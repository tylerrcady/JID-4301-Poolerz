
# Poolerz Installation Guide
Follow the steps below to set up and run the project locally.
## Requirements
- **MongoDB** – To access Poolerz data, your email must be whitelisted in the database.
- **Node.js & React** – If you’ve never used React or Node.js, download and install the latest LTS version from:  [https://nodejs.org](https://nodejs.org)

## Installation
### Downloading Node.js
For users that have never used React, they can install the latest version of Node.js here: https://nodejs.org/

### Cloning Github Repository
1. Navigate to your desired directory in the terminal (where you want the project to live).
2. Run the following command to clone this repo:
```
   git clone https://github.com/tylerrcady/JID-4301-Poolerz.git
```
3. Open the cloned folder (`JID-4301-Poolerz`) in your preferred code editor

### Adding Environment Variable File
For the next steps, you will create a local environment file that will contain the API and authentication keys necessary to run the application

4. Navigate into the `my-app` directory:
```
cd my-app
```
5. Create a file called `.env.local` in this directory and populate it with the following content:
```
AUTH_SECRET=<insert AUTH_SECRET key>
AUTH_GOOGLE_ID=<insert AUTH_GOOGLE_ID key>
AUTH_GOOGLE_SECRET=<insert AUTH_GOOGLE_SECRET key>
AUTH_URL=http://localhost:3000
MONGODB_URI=<insert MONGODB_URI key>
JWT_SECRET=<insert JWT_SECRET key>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<insert NEXT_PUBLIC_GOOGLE_MAPS_API_KEY>
```

### Running application locally
⚠️ **Note:** Always make sure you're inside the `my-app` directory before running the below commands.

6. Install dependencies (only required the first time or when dependencies are updated):
```
    npm install
```
7. Start the development server:
```
    npm run dev
```
