const {Resource, Project} = require('@google-cloud/resource');
const {google} = require('googleapis');
var cloudResourceManager = google.cloudresourcemanager('v1beta1');

function _getCredentials(action,settings){
    let keysParam = action.params.CREDENTIALS || settings.CREDENTIALS
    let keys;

    if (typeof keysParam != 'string'){
        keys = keysParam;
    } else {
        try{
            keys = JSON.parse(keysParam)
        }catch(err){
            throw new Error("Invalid credentials JSON");
        }
    }

    return keys;
}

function _handleOPeration(operation){
    return new Promise((resolve,reject)=>{
        try {
            operation
                .on('error', function (err) {
                    reject(err);
                })
                .on('running', function (metadata) {
                    console.log(JSON.stringify(metadata));
                })
                .on('complete', function (metadata) {
                    console.log("Virtual machine created!");
                    resolve(metadata);
                });
        } catch (e) {
            reject(e);
        }    
    })
}

function createProjects(action, settings) {
    return new Promise((resolve, reject) => {
        let credentials = _getCredentials(action,settings);
        let options = {
            parent : {type: 'organization', id: action.params.organizationId}
        };

        if (action.params.LABELS) {
            options.labels = action.params.LABELS;
        }

        let projectsArray = _handleParam(action.params.PROJECTIDS);
        if(typeof projectsArray == 'string')
            projectsArray = [projectsArray];
        
        Promise.all(projectsArray.map(pId=>{ 
            return new Promise((resolveInner, rejectInner)=>{
                
                let resource = new Resource(
                    {
                        credentials
                    }
                );

                resource.createProject(pId, options, function(err, project, operation, apiResponse) {
                    if (err)
                        return rejectInner(err);

                    if(!action.params.waitForOperation)
                        return resolveInner(apiResponse)

                    _handleOPeration(operation).then(resolveInner).catch(rejectInner);
                })
            })
        })).then(resolve).catch(reject);
    })
}
//requires logged into sdk:
// gcloud auth application-default login
function _handleParam(param){
    if (typeof param == 'string')
    {
        try{
            return JSON.parse(param)
        } catch (err){
            return param;
        }
    }
    return param
}

function deleteProjects(action, settings) {
    return new Promise((resolve, reject) => {
        let credentials = _getCredentials(action,settings);
        let projectsArray = _handleParam(action.params.PROJECTIDS);
        if(typeof projectsArray == 'string')
            projectsArray = [projectsArray];
        
        Promise.all(projectsArray.map(pId=>{
            let resource = new Resource({
                credentials
            });
            let project = resource.project(pId);
            return new Promise((resolveInner, rejectInner)=>{
                project.delete(function (err, apiResponse) {
                    if (err)
                        return rejectInner(err);
                    resolveInner(apiResponse, {success: true})
                })
            })    
        })).then(resolve).catch(reject);
    })
}

function updateProject(action,settings){
    return new Promise((resolve, reject) => {
        let credentials = _getCredentials(action,settings);
        let auth = new google.auth.JWT({
            email : credentials.client_email,
            key : credentials.private_key,
            scopes : ['https://www.googleapis.com/auth/cloud-platform']
        });

        let req = {
            auth,
            projectId: action.params.projectId,
        }

        cloudResourceManager.projects.get(req,(err,res)=>{
            if(err) return reject(err);
            
            let project = res.data;
            if (!action.params.LABELS)
                return resolve(project);

            if(!action.params.handlingType || action.params.handlingType=="overwrite"){
                project.labels = action.params.LABELS;
            } else {
                project.labels = Object.assign(project.labels,action.params.LABELS);
            }

            let request = {
                projectId: action.params.projectId,
                resource: project,
                auth: auth
            };

            cloudResourceManager.projects.update(request,(err,res)=>{
                if (err) return reject(err);
                resolve(res.data);
            })
        })
    })
}

function listProjects(action, settings) {
    return new Promise((resolve, reject) => {
        let credentials = _getCredentials(action,settings);
        let resource = new Resource({
            credentials
        });
        let options = action.params.OPTIONS;
        let cmdOut = [];
        resource.getProjects(options, function (err, operations) {
            if (err)
                return reject(err);
            operations.forEach(project => {
                cmdOut.push(project)
            });
            resolve(cmdOut)
        })
    })
}

module.exports= {
    createProjects: createProjects,
    deleteProjects: deleteProjects,
    listProjects: listProjects,
    updateProject : updateProject
}