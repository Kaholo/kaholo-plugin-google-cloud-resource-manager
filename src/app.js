const {Resource} = require('@google-cloud/resource');
const {google} = require('googleapis');
var cloudResourceManager = google.cloudresourcemanager('v1beta1');

async function createProjects(action, settings) {
    const creds = _getCredentials(action,settings);
    let options = {};
    if (action.params.organizationId){
        options.parent = {type: 'organization', id: action.params.organizationId}
    }
    if (action.params.LABELS) {
        options.labels = action.params.LABELS;
    }

    const projectsArray = _handleArr(action.params.PROJECTIDS);
    const resource = new Resource({creds});

    return Promise.all(projectsArray.map(pId=>{ 
        return new Promise((resolve, reject)=>{
            resource.createProject(pId, options, function(err, project, operation, apiResponse) {
                if (err)
                    return reject(err);
                if(!action.params.waitForOperation)
                    return resolve(apiResponse)
                _handleOperation(operation).then(resolve).catch(reject);
            })
        })
    }));
}

async function deleteProjects(action, settings) {
    const creds = _getCredentials(action,settings);
    const projectsArray = _handleArr(action.params.PROJECTIDS);
    const resource = new Resource({creds});
    return Promise.all(projectsArray.map(pId=>{
        const project = resource.project(pId);
        return new Promise((resolve, reject)=>{
            project.delete(function (err, apiResponse) {
                if (err)
                    return reject(err);
                return resolve(apiResponse)
            })
        });
    }));
}

async function updateProject(action,settings){
    const creds = _getCredentials(action,settings);
    const auth = new google.auth.JWT({
        email : creds.client_email,
        key : creds.private_key,
        scopes : ['https://www.googleapis.com/auth/cloud-platform']
    });

    const req = {
        auth: auth,
        projectId: action.params.projectId,
    }
    const shouldMerge = action.params.handlingType === "merge";
    return new Promise((resolve, reject) => {
        cloudResourceManager.projects.get(req, (err, res)=>{
            if(err) return reject(err);
            
            const project = res.data;
            if (!action.params.LABELS && shouldMerge) // if handling type is merge and no new lables were provided, do nothing
                return resolve(project);

            if(shouldMerge){
                project.labels = Object.assign(project.labels, action.params.LABELS);
            } else {
                project.labels = action.params.LABELS;
            }

            const request = {
                projectId: action.params.projectId,
                resource: project,
                auth: auth
            };

            cloudResourceManager.projects.update(request, (innerErr, innerRes)=>{
                if (innerErr) return reject(innerErr);
                return resolve(innerRes.data);
            });
        });
    });
}

async function listProjects(action, settings) {
    const creds = _getCredentials(action,settings);
    const resource = new Resource({creds});
    const [projects] = await resource.getProjects();
    return projects;
}

// helpers

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

function _handleOperation(operation){
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

function _handleArr(arrParam){
    if (Array.isArray(arrParam)){
        return arrParam;
    }
    if (typeof(arrParam) !== "string"){
        throw "Parameter must be either an array or a string";
    }
    return arrParam.split("\n").map((item) => item.trim()).filter((item) => item);
}

module.exports= {
    createProjects: createProjects,
    deleteProjects: deleteProjects,
    listProjects: listProjects,
    updateProject : updateProject
}