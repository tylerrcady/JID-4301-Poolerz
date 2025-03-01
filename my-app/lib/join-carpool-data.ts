import clientPromise from "@/lib/db";

// db information
const dbName = "poolerz";
const collectionName = "carpools";

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