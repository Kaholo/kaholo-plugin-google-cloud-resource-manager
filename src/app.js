const {Resource} = require('@google-cloud/resource');

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
    listProjects: listProjects
}