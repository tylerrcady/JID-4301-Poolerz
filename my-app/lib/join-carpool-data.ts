import clientPromise from "@/lib/db";

// db information
const dbName = "poolerz";
const collectionName = "user-carpool-data";

// ADD additional DB for displaying users information for carpoolMembers

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

// POST (user-carpool-data)
async function postUserCarpoolData(userId: string, userData : JoinCarpoolData) {
    try {
        // make db connection
        const client = await connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // get any existing carpool Data
        const existingCarpoolData = await collection.findOne({ userId : userId});

        console.log(existingCarpoolData)

        const JSON = {
            userId: userId,
            userData,
        }

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
        console.error("Failed to POST join Carpool data", error);
        throw error;
    }
}

// GET (CreateCarpoolData)
async function getUserCarpoolData(query: any) {
    try {
        // make db connection
        const client = await connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        console.log(query);

        // get the createCarpoolData
        const userCarpoolData = await collection.find(query).toArray();

        // return the createCarpoolData or ""
        if (!userCarpoolData || userCarpoolData.length == 0) {
            return null;
        } else {
            //console.log(createCarpoolData);
            return userCarpoolData;
        }
    } catch (error) {
        console.error("Failed to GET user form data", error);
        throw error;
    }
}

export {postUserCarpoolData, getUserCarpoolData};