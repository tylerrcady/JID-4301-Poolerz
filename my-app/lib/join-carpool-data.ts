import clientPromise from "@/lib/db";

// db information
const dbName = "poolerz";
const collectionName = "user-carpool-data";

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
            // If existing data, merge the joinedCarpools arrays.
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

// GET (UserCarpoolData)
async function getUserCarpoolData(userId: string) {
    try {
        // make db connection
        const client = await connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        console.log(userId); // for testing only

        // get the userCarpoolData
        const userCarpoolData = await collection.findOne({ userId });;

        // return the userCarpoolData or ""
        if (!userCarpoolData) {
            return null;
        } else {
            return userCarpoolData;
        }
    } catch (error) {
        console.error("Failed to GET user form data", error);
        throw error;
    }
}

export {postUserCarpoolData, getUserCarpoolData};