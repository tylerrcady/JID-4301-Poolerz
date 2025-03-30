import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";

const dbName = "poolerz";
const collectionName = "user-carpool-data";

// Database connection helper function
async function connect() {
    try {
        const client = await clientPromise;
        return client;
    } catch (error) {
        console.error("Failed to connect to the MongoDB server", error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, carpoolId, carpoolData, userLocation } = body;

        if (!userId || !carpoolId || !carpoolData) {
            return NextResponse.json(
                { error: "Missing userId, carpoolId, or carpoolData" },
                { status: 400 }
            );
        }

        const client = await connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const existingUser = await collection.findOne({ userId: userId });

        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const existingCarpools = existingUser.userData.carpools || [];

        const carpoolIndex = existingCarpools.findIndex(
            (carpool: any) => carpool.carpoolId === carpoolId
        );

        if (carpoolIndex === -1) {
            return NextResponse.json(
                { error: "Carpool not found in user's data" },
                { status: 404 }
            );
        }

        existingCarpools[carpoolIndex] = carpoolData;

        const updateObj: any = {
            "userData.carpools": existingCarpools
        };

        if (userLocation) {
            updateObj["userData.userLocation"] = userLocation;
        }

        await collection.updateOne(
            { userId: userId },
            { $set: updateObj }
        );

        return NextResponse.json(
            { success: true, message: "User carpool data updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to update user carpool data", error);
        return NextResponse.json(
            { error: "Failed to update user carpool data" },
            { status: 500 }
        );
    }
} 