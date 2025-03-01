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
        const existingUser = await collection.findOne({ userId : userId});
        console.log(existingUser);

        const JSON = {
            userId: userId,
            userData,
        }

        if (!existingUser) {
            // post the user data
            await collection.insertOne(JSON);
            return { success: true };
        } else {
            // There is existing data: merge the joinedCarpools arrays.
            const existingJoinedCarpools: Carpool[] = existingUser.userData.carpools || [];
            const newJoinedCarpools: Carpool[] = userData.carpools;

            // Merge while avoiding duplicates based on carpoolId.
            const updatedJoinedCarpools = [
                ...existingJoinedCarpools.filter(
                (existing: Carpool) =>
                    !newJoinedCarpools.some((newOne: Carpool) => newOne.carpoolId === existing.carpoolId)
                ),
                ...newJoinedCarpools
            ];

            // Update the entire userData field with the new changes,
            // but override the joinedCarpools with our merged array.
            const updatedUserData: JoinCarpoolData = {
                ...userData,
                carpools: updatedJoinedCarpools
            };

            await collection.updateOne(
                { _id: existingUser._id },
                { $set: { userData: updatedUserData } }
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