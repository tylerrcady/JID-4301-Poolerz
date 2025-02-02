import clientPromise from "@/lib/db";

// db information
const dbName = "poolerz";
const collectionName = "create-carpool";

// database connection
// Note: copied/pasted this exact method from user-form-data; it may be cleaner to later import this to enforce cleaner code
async function connect() {
    try {
        const client = await clientPromise;
        return client;
    } catch (error) {
        console.error("Failed to connect to the MongoDB server", error);
        throw error;
    }
}

// POST (create carpool data)
async function postCreateCarpoolData(carpoolId: string, createCarpoolData: CreateCarpoolData) {
    try {
        // make db connection
        const client = await connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // get any existingUserFormData
        const existingCarpoolData = await collection.findOne({ carpoolID: carpoolId }); // for testing only

        console.log(createCarpoolData); // for testing only-- refer to Iggy's team message about logging on console if any issues persist

        const JSON = {
            carpoolID: carpoolId,
            createCarpoolData,
            // isFormComplete: true -- will I add this line at some point?
    
        };

        if (!existingCarpoolData) {
            // post the user data
            await collection.insertOne(JSON);
            return { success: true };
        } else {
            // for testing only (updates)
            await collection.updateOne(
                { _id: existingCarpoolData._id },
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
async function getCreateCarpoolData(carpoolId: string) {
    try {
        // make db connection
        const client = await connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // get the createCarpoolData
        const createCarpoolData = await collection.findOne({ carpoolId });

        // return the createCarpoolData or ""
        if (!createCarpoolData) {
            return "";
        } else {
            return createCarpoolData;
        }
    } catch (error) {
        console.error("Failed to GET user form data", error);
        throw error;
    }
}

export {postCreateCarpoolData, getCreateCarpoolData};