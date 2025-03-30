import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const url = new URL(req.url);
        const carpoolId = url.searchParams.get("carpoolId");

        if (!carpoolId) {
            return NextResponse.json(
                { error: "Missing carpoolId" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();
        
        console.log("Fetching optimization results for carpoolId:", carpoolId);
        
        const optimizationCollection = db.collection("optimizationResults");
        const resultsData = await optimizationCollection.findOne({ carpoolId });

        console.log("Found results:", resultsData ? "Yes" : "No");
        
        if (!resultsData) {
            return NextResponse.json({ results: null });
        }

        return NextResponse.json({ 
            results: resultsData.results,
            updatedAt: resultsData.updatedAt 
        });
    } catch (error) {
        console.error("Error fetching optimization results:", error);
        return NextResponse.json(
            { error: "Failed to fetch optimization results" },
            { status: 500 }
        );
    }
}
