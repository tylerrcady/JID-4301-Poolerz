import clientPromise from "@/lib/db";

// db information
const dbName = "poolerz";
const collectionName = "user-data";

// database connection
async function connect() {
    try {
        const client = await clientPromise;
        return client;
    } catch (error) {
        console.error("Failed to connect to the MongoDB server", error);
        throw error;
    }
}

// POST (user form data)
async function postUserFormData(userId: string, userFormData: UserFormData) {
    try {
        // make db connection
        const client = await connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // get any existingUserFormData
        const existingUserFormData = await collection.findOne({ userId }); // for testing only

        console.log(userFormData); // for testing only

        const JSON = {
            userId,
            userFormData,
            isFormComplete: true,  //set when form is submitted
            // add stuff here with userFormData
        };

        if (!existingUserFormData) {
            // post the user data
            await collection.insertOne(JSON);
            return { success: true };
        } else {
            // for testing only (updates)
            await collection.updateOne(
                { _id: existingUserFormData._id },
                { $set: JSON }
            );
            return { success: true };
        }
    } catch (error) {
        console.error("Failed to POST user form data", error);
        throw error;
    }
}

// GET (user form data)
async function getUserFormData(userId: string) {
    try {
        // make db connection
        const client = await connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // get the userFormData
        const userFormData = await collection.findOne({ userId });

        // return the userFormData or ""
        if (!userFormData) {
            return "";
        } else {
            return userFormData;
        }
    } catch (error) {
        console.error("Failed to GET user form data", error);
        throw error;
    }
}

// check form completion // ! don't know if need a separate func or can just be part of the above function
// this would be used if a user has completed the form, restricting them or redirecting
// not being used rn though
async function checkFormCompletion(userId: string): Promise<boolean> {
    try {
        const client = await connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const userData = await collection.findOne({ userId});
        return userData?.isFormComplete || false;
    } catch (error) {
        console.error("Failed to check form completion status", error);
        return false;
    }
}

export { postUserFormData, getUserFormData, checkFormCompletion };
