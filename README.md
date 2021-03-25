# kaholo-plugin-google-cloud-resource-manager
Google Cloud Resource Manager plugin for Kaholo

## Settings
1. Credentials(vault)**optional** - The Google Cloud credentials of the default user to execute the methods.

## Method Create New Projects
Create new Google Cloud project(s) with the name(s) specified.

### Parameters
1. Credentials(vault)**optional** - The Google Cloud credentials of the user to execute this specific time.
2. Project name(s)(string)**required** - All names/ids of the projects to create. You can enter either an array from code or a text, representing all the names of the projects, each seperated with a new line.
3. Organization ID(string)**required** - The ID of the organization your account is associated with and where the project will be created. You can see how to get organization ID in [here](https://cloud.google.com/resource-manager/docs/creating-managing-organization#retrieving_your_organization_id).
4. Labels Object(object)**optional** - The Labels to assign to the new project(s). Provide it as an object directly from code.
5. Wait for operation end(boolean)**optional** - Wether to wait until the project(s) is created or not.

## Method Update Project Labels
Update the lables associated with the specified project.

### Parameters
1. Credentials(vault)**optional** - The Google Cloud credentials of the user to execute this specific time.
2. Project ID(string)**required** - Name of the project to update.
3. Labels Object(object)**required** - The Labels to assign to the new project(s). Provide it as an object directly from code.
4. Handling Type(overwrite/merge)**optional** - The way to handle with the new lables - to overwrite existing lables or to merge with them.

## Method Delete Project(s)
Delete all projects provided.

### Parameters
1. Credentials(vault)**optional** - The Google Cloud credentials of the user to execute this specific time.
2. Project Name(s)(string)**required** - All names of the projects to delete. You can enter either an array from code or a text, representing all the names of the projects, each seperated with a new line.

## Method List Projects
List all projects associated with this user.

### Parameters
1. Credentials(vault)**optional** - The Google Cloud credentials of the user to execute this specific time.