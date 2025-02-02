import { auth } from "@/auth";
import { postCreateCarpoolData, getCreateCarpoolData } from "@/lib/create-carpool-data";

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
        // get passed-in data
        const {carpoolId, createCarpoolData} = await request.json();

        // check if data is valid
        if (!carpoolId) {
            return new Response(
                JSON.stringify({
                    error: "Invalid data",
                }),
                { status: 400 }
            );
        }

        // POST the data
        const result = await postCreateCarpoolData(carpoolId, createCarpoolData);

        // return success/failure
        if (result && result.success) {
            return new Response(
                JSON.stringify({ message: "Success with POST user-form-data" }),
                {
                    status: 200,
                }
            );
        } else {
            return new Response(
                JSON.stringify({ error: "Failure with POST user-form-data" }),
                {
                    status: 500,
                }
            );
        }
    } catch (error) {
        console.error("Error with POST create-carpool-data: ", error);
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
        const carpoolId = searchParams.get("carpoolId");

        // check if parameters are valid
        if (!carpoolId) {
            return new Response(
                JSON.stringify({ error: "Invalid parameters" }),
                {
                    status: 400,
                }
            );
        }

        // GET the data
        const createCarpoolData = await getCreateCarpoolData(carpoolId); // currently returns "" if none

        // return success/failure
        if (createCarpoolData == "" || createCarpoolData) {
            return new Response(JSON.stringify({ createCarpoolData }), {
                status: 200,
            });
        } else {
            return new Response(
                JSON.stringify({ error: "Failure with GET create-carpool-data" }),
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error with GET create-carpool-data: ", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        );
    }
}