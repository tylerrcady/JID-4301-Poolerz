import { auth } from "@/auth";
import { postUserFormData, getUserFormData } from "@/lib/user-form-data";

// POST
export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 500,
        });
    }

    try {
        const { userId, userFormData } = await request.json();

        if (!userId) {
            return new Response(
                JSON.stringify({
                    error: "Invalid data",
                }),
                { status: 400 }
            );
        }

        // POST the data
        const result = await postUserFormData(userId, userFormData);

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
        console.error("Error with POST user-form-data: ", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        );
    }
}

// GET
export async function GET(request: Request) {
    const session = await auth();
    if (!session) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 500,
        });
    }

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return new Response(
                JSON.stringify({ error: "Invalid parameters" }),
                {
                    status: 400,
                }
            );
        }

        // GET the data
        const userFormData = await getUserFormData(userId); // currently returns "" if none

        // return success/failure
        if (userFormData == "" || userFormData) {
            return new Response(JSON.stringify({ userFormData }), {
                status: 200,
            });
        } else {
            return new Response(
                JSON.stringify({ error: "Failure with GET user-form-data" }),
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error with GET user-form-data: ", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        );
    }
}
