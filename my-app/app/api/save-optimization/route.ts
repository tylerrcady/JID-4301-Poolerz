import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";

function sanitizeResults(results: any) {
    try {
        const sanitizedResults = JSON.parse(JSON.stringify(results));
        
        if (sanitizedResults.carpools && Array.isArray(sanitizedResults.carpools)) {
            sanitizedResults.carpools.forEach((carpool: any) => {
                if (carpool.driverSchedule) {
                    Object.entries(carpool.driverSchedule).forEach(([day, driver]: [string, any]) => {
                        if (typeof driver === 'object' && driver !== null) {
                            carpool.driverSchedule[day] = driver.name || driver.userId || JSON.stringify(driver);
                        }
                    });
                }
            });
        }
        
        return sanitizedResults;
    } catch (error) {
        console.error("Error sanitizing results:", error);
        return results;
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { carpoolId, results } = await req.json();

        if (!carpoolId) {
            return NextResponse.json(
                { error: "Missing carpoolId" },
                { status: 400 }
            );
        }

        const sanitizedResults = sanitizeResults(results);
        
        const client = await clientPromise;
        const db = client.db();
        
        const carpoolCollection = db.collection("carpools");
        
        console.log("Looking for carpoolId:", carpoolId);
        
        const carpool = await carpoolCollection.findOne({ 
            $or: [
                { carpoolID: carpoolId },
                { carpoolId: carpoolId },
                { "createCarpoolData.carpoolId": carpoolId }
            ]
        });
        
        console.log("Found carpool:", carpool);
        
        if (!carpool) {
            return NextResponse.json(
                { error: "Carpool not found" },
                { status: 404 }
            );
        }
        
        console.log("Carpool document structure:", JSON.stringify(carpool, null, 2));
        
        console.log("Checking direct fields:", {
            createdBy: carpool.createdBy,
            ownerId: carpool.ownerId,
            userId: carpool.userId,
            creatorId: carpool.creatorId
        });
        
        if (carpool.createCarpoolData) {
            console.log("Checking nested createCarpoolData fields:", {
                createdBy: carpool.createCarpoolData.createdBy,
                ownerId: carpool.createCarpoolData.ownerId,
                userId: carpool.createCarpoolData.userId,
                creatorId: carpool.createCarpoolData.creatorId
            });
        }
        
        const createdBy = carpool.createCarpoolData?.createdBy || 
                          carpool.createdBy || 
                          carpool.createCarpoolData?.ownerId ||
                          carpool.ownerId ||
                          carpool.userId ||
                          carpool.createCarpoolData?.userId ||
                          carpool.creatorId ||
                          carpool.createCarpoolData?.creatorId ||
                          (carpool.createCarpoolData && carpool.createCarpoolData.createCarpoolData?.createdBy);
        
        console.log("Carpool created by:", createdBy);
        console.log("Current user:", session.user.id);
        
        if (!createdBy) {
            console.log("Could not determine carpool owner, allowing current user to save results");
        } else if (createdBy !== session.user.id) {
            return NextResponse.json(
                { error: "Only the carpool owner can save optimization results", createdBy, userId: session.user.id },
                { status: 403 }
            );
        }

        const optimizationCollection = db.collection("optimizationResults");
        const existingResults = await optimizationCollection.findOne({ carpoolId });

        if (existingResults) {
            await optimizationCollection.updateOne(
                { carpoolId },
                {
                    $set: {
                        results: sanitizedResults,
                        updatedAt: new Date(),
                    },
                }
            );
        } else {
            await optimizationCollection.insertOne({
                carpoolId,
                results: sanitizedResults,
                createdBy: session.user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in save-optimization API:", error);
        return NextResponse.json(
            { error: "Failed to save optimization results" },
            { status: 500 }
        );
    }
}
