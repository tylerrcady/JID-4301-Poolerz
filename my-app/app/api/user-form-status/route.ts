import { auth } from "@/auth";
import { checkFormCompletion } from "@/lib/user-form-data";

export async function GET(request: Request) {
    const session = await auth();
    if (!session) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
        });
    }

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return new Response(
                JSON.stringify({ error: "Invalid parameters" }),
                { status: 400 }
            );
        }

        const isFormComplete = await checkFormCompletion(userId);
        return new Response(JSON.stringify({ isFormComplete }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error checking form completion status: ", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        );
    }
} 