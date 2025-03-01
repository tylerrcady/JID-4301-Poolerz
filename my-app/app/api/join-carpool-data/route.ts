import { auth } from "@/auth";
import { postCreateCarpoolData } from "@/lib/create-carpool-data";

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
        const carpoolId = joinCarpoolData.carpoolId;
        const createCarpoolData = joinCarpoolData.createCarpoolData;

        // POST the data
        const result = await postCreateCarpoolData(carpoolId, createCarpoolData);
        
        // return success/failure
        if (result && result.success) {
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