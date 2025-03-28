import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";

const dbName = "poolerz";
const USER_CARPOOL_COLLECTION = "user-carpool-data";
const CARPOOLS_COLLECTION = "carpools";

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
        const { carpoolId, userId } = body;

        console.log("Leaving carpool:", carpoolId, "for user:", userId);

        if (!carpoolId || !userId) {
            console.error("Missing carpoolId or userId");
            return NextResponse.json(
                { error: "Missing carpoolId or userId" },
                { status: 400 }
            );
        }

        const client = await connect();
        const db = client.db(dbName);

        // 1. First get the user's current carpool data
        const userCarpoolDb = db.collection(USER_CARPOOL_COLLECTION);
        const existingUser = await userCarpoolDb.findOne({ userId: userId });

        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Filter out the carpool to leave
        const updatedCarpools = existingUser.userData.carpools.filter(
            (carpool: any) => carpool.carpoolId !== carpoolId
        );

        // Update user-carpool-data
        const userCarpoolResult = await userCarpoolDb.updateOne(
            { userId: userId },
            { 
                $set: { 
                    "userData.carpools": updatedCarpools
                }
            }
        );

        console.log("User carpool update result:", userCarpoolResult);

        // 2. Update the carpool's members list
        const carpoolDb = db.collection(CARPOOLS_COLLECTION);
        const existingCarpool = await carpoolDb.findOne({ carpoolID: carpoolId });

        if (!existingCarpool) {
            return NextResponse.json(
                { error: "Carpool not found" },
                { status: 404 }
            );
        }

        // Filter out the leaving user
        const updatedMembers = existingCarpool.createCarpoolData.carpoolMembers.filter(
            (memberId: string) => memberId !== userId
        );

        // Update carpool members
        const carpoolResult = await carpoolDb.updateOne(
            { carpoolID: carpoolId },
            { 
                $set: { 
                    "createCarpoolData.carpoolMembers": updatedMembers
                }
            }
        );

        console.log("Carpool update result:", carpoolResult);

        if (userCarpoolResult.modifiedCount === 0 && carpoolResult.modifiedCount === 0) {
            return NextResponse.json(
                { error: "No documents were modified" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true, 
                message: "Successfully left carpool",
                userCarpoolResult,
                carpoolResult
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Failed to leave carpool:", error);
        return NextResponse.json(
            { error: "Failed to leave carpool" },
            { status: 500 }
        );
    }
} 