import { auth } from "@/auth";
import { postCreateCarpoolData } from "@/lib/create-carpool-data";
import { postUserCarpoolData, getUserCarpoolData } from "@/lib/join-carpool-data";

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
        const carpoolId = joinCarpoolData.joinData.carpools[0].carpoolId;
        const createCarpoolData = joinCarpoolData.createCarpoolData;
        const userId = joinCarpoolData.userId;
        const joinData = joinCarpoolData.joinData;

        console.log("carpool ID is");
        console.log(carpoolId);

        // POST the data
        // Run both functions concurrently
        const [createCarpoolResult, userCarpoolResult] = await Promise.all([
            postCreateCarpoolData(carpoolId, createCarpoolData),
            postUserCarpoolData(userId, joinData)
        ]);
        // return success/failure
        if (createCarpoolResult?.success && userCarpoolResult?.success) {
            return new Response(
                JSON.stringify({ message: "Success with POST user-carpool-data", joinCode: carpoolId }),
                {
                    status: 200,
                }
            );
        } else {
            return new Response(
                JSON.stringify({ error: "Failure with POST user-carpool-data" }),
                {
                    status: 500,
                }
            );
        }
    } catch(error) {
        console.error("Error with POST user-carpool-data: ", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        );
    }
}

// GET
export async function GET(request: Request) {
    // check if authenticated
    const session = await auth();
    if (!session) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 500,
        });
    }

    try {
        // get parameters
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        // check if parameters are valid
        if (!userId) {
            return new Response(
                JSON.stringify({ error: "Invalid parameters" }),
                {
                    status: 400,
                }
            );
        }

        // Retrieve the data from the database
        const userCarpoolData = await getUserCarpoolData(userId);

        // return success/failure
        if (userCarpoolData) {
            return new Response(JSON.stringify({ createCarpoolData: userCarpoolData }), {
                status: 200,
            });
        } else {
            return new Response(
                JSON.stringify({ error: "Failure with GET user-carpool-data" }),
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error with GET user-carpool-data: ", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        );
    }
}