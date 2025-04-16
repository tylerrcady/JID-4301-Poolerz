
# Requirements
* Mongo Database -- note: in order to access Poolerz data, your email should be added to the database
* React/Node.js (instructions to download is below)

# Installation
## Downloading Node.js
For users that have never used React, they can install the latest version of Node.js here: https://nodejs.org/

## Cloning Github Repository and Opening Project code
1. Navigate to your desired directory in the terminal (where you want the project to live).
2. Use the below command to clone the github repo.
```
   git clone https://github.com/tylerrcady/JID-4301-Poolerz.git
```
3. Locate the file (folder should be called JID-4301-Poolerz) and open it in your code editor

## Adding Environment Variable File
For the next steps, you will create a local environment file that will contain the API and authentication keys necessary to run the application
4. Navigate to the my-app directory within the project using below command
```
cd my-app
```
Create a file called .env.local. You will populate the inside of the file with the necessary keys. The format should be the following:
```
AUTH_SECRET=<insert AUTH_SECRET key>
AUTH_GOOGLE_ID=<insert AUTH_GOOGLE_ID key>
AUTH_GOOGLE_SECRET=<insert AUTH_GOOGLE_SECRET key>
AUTH_URL=http://localhost:3000
MONGODB_URI=<insert MONGODB_URI key>
JWT_SECRET=<insert JWT_SECRET key>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<insert NEXT_PUBLIC_GOOGLE_MAPS_API_KEY>
```
5.

## Running application locally
Note: whenever, you are running the application, you must always be inside my-app
6. If you are running this application for the first time, you will install the necessary dependencies using the below command
```
    npm install
```
7. Finally, to properly run the application, use the following command each time:
```
    npm run dev
```