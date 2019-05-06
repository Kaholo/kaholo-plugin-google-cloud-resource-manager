const {Resource} = require('@google-cloud/resource');


function createProjects(action) {
    return new Promise((resolve, reject) => {
        let projectIDs = action.params.PROJECTIDS;
        let resource = new Resource(
            {
                projectId: projectIDs,
            }
        );
        let projectsArray = projectIDs.split(' ');
        projectsArray.forEach(result => {
            resource.createProject(result, function(err, project, operation, apiResponse) {
                if (err)
                    return reject(err);
                resolve(apiResponse)
            })
        })
    })
}
//requires logged into sdk:
// gcloud auth application-default login


function deleteProjects(action) {
    return new Promise((resolve, reject) => {
        let resource = new Resource({
            keyFilename: action.params.KEYFILE
        });
        let projectID = action.params.PROJECTIDS;
        let projectsArray = projectID.split(' ');
        for (i = 0; i < projectsArray.length; i++) {
            let project = resource.project(projectsArray[i]);
            project.delete(function (err, apiResponse) {
                if (err)
                    return reject(err);
                resolve(apiResponse)
            })
        }
    })
}
//apiResponce is empty if success



function listProjectsIDs(action) {
    return new Promise((resolve, reject) => {
        let resource = new Resource({
            keyFilename: action.params.KEYFILE
        });
        let cmdOut = [];
        let filtering = '';
        if (action.params.FILTER) {
            filtering += action.params.FILTER;
        }
        resource.getProjects(filtering, function (err, operations) {
            if (err)
                return reject(err);
            operations.forEach(project => {
                cmdOut.push(project.id)
            });
            resolve(cmdOut)
        })
    })
}

function listProjects(action) {
    return new Promise((resolve, reject) => {
        let resource = new Resource({
            keyFilename: action.params.KEYFILE
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
    listProjectsIDs: listProjectsIDs,
    listProjects: listProjects
}