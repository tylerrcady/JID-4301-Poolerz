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

        // get any existing carpool Data
        const existingCarpoolData = await collection.findOne({ carpoolID: carpoolId });

        console.log(createCarpoolData); // for testing only

        const JSON = {
            carpoolID: carpoolId,
            createCarpoolData,
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

// GET (CreateCarpoolData)
async function getCreateCarpoolData(query: any) {
    try {
        // make db connection
        const client = await connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // get the createCarpoolData
        const createCarpoolData = await collection.findOne( query );

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