import { auth } from "@/auth";
import { postCreateCarpoolData } from "@/lib/create-carpool-data";
import { postUserCarpoolData } from "@/lib/join-carpool-data";

// POST
export async function POST(request: Request) {
    // check if authenticated
    const session = await auth();
    if (!session) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 500,
        });
    }
    try {
        const {joinCarpoolData} = await request.json();
        if (!joinCarpoolData) {
            return new Response(
                JSON.stringify({
                    error: "Invalid data",
                }),
                { status: 400 }
            );
        }
        const carpoolId = joinCarpoolData.joinData.carpoolId;
        const createCarpoolData = joinCarpoolData.createCarpoolData;
        const userId = joinCarpoolData.userId;
        const joinData = joinCarpoolData.joinData;

        // POST the data
        // Run both functions concurrently
        const [createCarpoolResult, userCarpoolResult] = await Promise.all([
            postCreateCarpoolData(carpoolId, createCarpoolData),
            postUserCarpoolData(userId, joinData)
        ]);
        // return success/failure
        if (createCarpoolResult?.success && userCarpoolResult?.success) {
            return new Response(
                JSON.stringify({ message: "Success with POST create-carpool-data", joinCode: carpoolId }),
                {
                    status: 200,
                }
            );
        } else {
            return new Response(
                JSON.stringify({ error: "Failure with POST create-carpool-data" }),
                {
                    status: 500,
                }
            );
        }
        
    } catch(error) {
        console.error("Error with POST join-carpool-data: ", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        );
    }
}