const GoogleResourceManager = require('./google-resource-manager');
const parsers = require('./parsers');
const { removeUndefinedAndEmpty } = require('./helpers')

async function listProjects(action, settings) {

    const projectsClient = GoogleResourceManager.from(action.params, settings);
    return projectsClient.listProjects();
}

// async function createProjects(action, settings) {
//     const creds = _getCredentials(action,settings);
//     let options = {
//         parent: {type: 'organization', id: action.params.organizationId}
//     };
//     if (action.params.labels) {
//         options.labels = action.params.labels;
//     }

//     const projectsArray = _handleArr(action.params.PROJECTIDS);
//     const resource = new Resource(creds);

//     return Promise.all(projectsArray.map(pId=>{ 
//         return new Promise((resolve, reject)=>{
//             resource.createProject(pId, options, function(err, project, operation, apiResponse) {
//                 if (err)
//                     return reject(err);
//                 if(!action.params.waitForOperation)
//                     return resolve(apiResponse)
//                 _handleOperation(operation).then(resolve).catch(reject);
//             })
//         })
//     }));
// }

// async function deleteProjects(action, settings) {
//     const creds = _getCredentials(action,settings);
//     const projectsArray = _handleArr(action.params.PROJECTIDS);
//     const resource = new Resource(creds);
//     return Promise.all(projectsArray.map(pId=>{
//         const project = resource.project(pId);
//         return new Promise((resolve, reject)=>{
//             project.delete(function (err, apiResponse) {
//                 if (err)
//                     return reject(err);
//                 return resolve(apiResponse)
//             })
//         });
//     }));
// }

// async function updateProject(action,settings){
//     const creds = _getCredentials(action,settings);
//     const auth = new google.auth.JWT({
//         email : creds.credentials.client_email,
//         key : creds.credentials.private_key,
//         scopes : ['https://www.googleapis.com/auth/cloud-platform']
//     });

//     const req = {
//         auth: auth,
//         projectId: action.params.projectId,
//     }
//     const shouldMerge = action.params.handlingType === "merge";
//     return new Promise((resolve, reject) => {
//         cloudResourceManager.projects.get(req, (err, res)=>{
//             if(err) return reject(err);
            
//             const project = res.data;
//             if (!action.params.labels && shouldMerge) // if handling type is merge and no new lables were provided, do nothing
//                 return resolve(project);

//             if(shouldMerge){
//                 project.labels = Object.assign(project.labels, action.params.labels);
//             } else {
//                 project.labels = action.params.labels;
//             }

//             const request = {
//                 projectId: action.params.projectId,
//                 resource: project,
//                 auth: auth
//             };

//             cloudResourceManager.projects.update(request, (innerErr, innerRes)=>{
//                 if (innerErr) return reject(innerErr);
//                 return resolve(innerRes.data);
//             });
//         });
//     });
// }

module.exports= {
    // createProjects: createProjects,
    // deleteProjects: deleteProjects,
    listProjects: listProjects,
    // updateProject : updateProject
}