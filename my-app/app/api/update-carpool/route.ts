import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";

const dbName = "poolerz";
const collectionName = "carpools";

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
        const { carpoolId, carpoolData } = body;
        
        console.log("Updating carpool:", carpoolId);
        console.log("Received carpoolData:", JSON.stringify(carpoolData));

        if (!carpoolId || !carpoolData) {
            console.error("Missing carpoolId or carpoolData");
            return NextResponse.json(
                { error: "Missing carpoolId or carpoolData" },
                { status: 400 }
            );
        }

        const client = await connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const existingCarpool = await collection.findOne({ carpoolID: carpoolId });

        if (!existingCarpool) {
            console.error("Carpool not found:", carpoolId);
            return NextResponse.json(
                { error: "Carpool not found" },
                { status: 404 }
            );
        }
        
        console.log("Found existing carpool:", JSON.stringify(existingCarpool));

        try {
            const updateResult = await collection.updateOne(
                { carpoolID: carpoolId },
                { $set: { createCarpoolData: carpoolData } }
            );
            
            console.log("Update result:", JSON.stringify(updateResult));
            
            return NextResponse.json(
                { success: true, message: "Carpool data updated successfully" },
                { status: 200 }
            );
        } catch (dbError) {
            console.error("Database update error:", dbError);
            return NextResponse.json(
                { error: `Database update error: ${(dbError as Error).message}` },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Failed to update carpool data", error);
        return NextResponse.json(
            { error: `Failed to update carpool data: ${(error as Error).message}` },
            { status: 500 }
        );
    }
} 