import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(uri);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return new Response("User ID is required", { status: 400 });
    }

    try {
        await client.connect();
        const database = client.db("poolerz");
        const users = database.collection("users");

        const user = await users.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        return new Response(JSON.stringify({ name: user.name }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response("Internal Server Error", { status: 500 });
    }
}
