# Paxson Manager (WIP)
This project is an attempt at a node project manager. It is designed to help manage package.json files inside of complex projects. For example, one could have a folder heirarchy like this:

ProjectFolder

-Apps

--FirstApp

--SecondApp

-Services

--ServiceOne

--ServiceTwo

-Backend

--BackendOne

--BackendTwo

Each of those subfolders could have a package.json as they are their own components. This application has a few features to try to help.

## Settings
This is where you will create the projects to be managed, set their directory, and add path exclusions. You should always add the node_modules as part of your path exclusions. Selecting a project will automatically run the lookups for "Sync Package.json" and "Check Dependencies". No changes are made to the project at this time.

## Sync Package.json
This will compare each package.json with the package-lock.json. It looks for differences between the declared package version and what is actually installed. If they do not match, they will be highlighted in red. Select the packages you want synced and click "Sync Selected Packages". This will edit the package.json files dependency packages that you have selected.

## Check Dependencies
This gets all of the dependencies from each package.json in the project directory. 

***WARNING: if node_modules is not in path exceptions, this will take a LONG time to process.***

After getting the dependencies, Check Dependencies utilizes the "npm outdated" command to check each package for outdated modules. The intention here is to find major package changes (for example, from 4.0.5 to 12.1.8). Any package that is not latest will be marked red. This activity also uses the [get-repository-url](https://github.com/jonschlinkert/get-repository-url) to get the repositories for those dependencies. The intent is to help lookup the changes faster.

## Update Packages
Upcoming feature...

## Test Packages
Upcoming feature..

## Increment Semvers
Upcoming feature..

## Publish Packages
Upcoming feature..

# Added libraries

- [get-repository-url](https://github.com/jonschlinkert/get-repository-url) 
- [@mdi/font](https://github.com/Templarian/MaterialDesign-Webfont)
- [@mdi/js](https://github.com/Templarian/MaterialDesign-JS)
- [mdi-vue](https://github.com/therufa/mdi-vue)
- [Vue Material](https://www.creative-tim.com/vuematerial/getting-started)

# Notes:
This is using Vue 2.6.14. The boilerplate is still in beta for Vue3.

## Running Locally for development

1. `npm install`
1. `npm start`
1. Once Webpack finishes starting up your app will appear in a window


## Building for distribution

1. `npm run build:clean` will delete your `./dist` and `./dist-vue` folders
1. `npm run build:vue` will build just your Vue app for distribution (`./dist-vue`)
1. `npm run build:nw` will build just your NW.js app (`./dist`)
1. `npm run build` is your all-in-one command. It will clean out the old dist folders and build your Vue and NW.js app


# **IMPORTANT NOTE ABOUT BUILDS!!!**

They take a long time. If you do `npm run build` expect it to take 10-30 minutes. This can be adjusted by changing the build params in the `package.json`. The more platforms and build types, the longer it takes. You can also remove the `--concurrent` from the `build:nw` script to see a status of what has been completed. This will allow individual pieces to finish faster, but the entire build will take longer.
