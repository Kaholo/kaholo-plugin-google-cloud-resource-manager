const { ProjectsClient } = require('@google-cloud/resource-manager');
const { google } = require('googleapis');
const parsers = require('./parsers');
const { removeUndefinedAndEmpty } = require('./helpers')

/** Class for using the Google Resource Manager API. */
module.exports = class GoogleResourceManager {
    /**
     * Create a Google Resource Manager instance
     * @param {object} credentials The credentials of a service account to use to make the request 
     */
    constructor(credentials) {
        this.credentials = credentials;
        this.projectsClient = new ProjectsClient({
            credentials: this.credentials
        });
    }

    /**
     * Get Google Resource Manager Client from Kaholo action and settings objects
     * @param {object} params Kaholo Action Params Object
     * @param {string} settings Kaholo Settings Object
     * @return {GoogleResourceManager} The Google Resource Manager Client
     */
    static from(params, settings, noProject) {
        const creds = parsers.object(params.creds || settings.creds);
        if (!creds) throw "Must provide credentials to call any method in the plugin!";
        return new GoogleResourceManager(creds);
    }

    async listProjects() {
        let iterable = this.projectsClient.searchProjectsAsync();
        let projects = [];

        try {
            for await (let proj of iterable) {
                projects.push(proj);
            }
        } catch (error) {
            throw error;
        }
        return projects;
    }
}
