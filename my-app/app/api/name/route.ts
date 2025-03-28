import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(uri);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userIds = searchParams.getAll("userId");

/*     if (!userId) {
        return new Response("User ID is required", { status: 400 });
    } */
    if (!userIds || userIds.length === 0) {
        return new Response("User IDs are required", { status: 400 });
    }
    

    try {
        await client.connect();
        const database = client.db("poolerz");
        const users = database.collection("users");

        //const user = await users.findOne({ _id: new ObjectId(userId) });
        const objectIds = userIds.map((id) => new ObjectId(id));
        const userDocs = await users.find({ _id: { $in: objectIds } }).toArray();

        /* if (!user) {
            return new Response("User not found", { status: 404 });
        }

        return new Response(JSON.stringify({ name: user.name }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        }); */

        const userMap = userDocs.reduce((map, user) => {
            map[user._id.toString()] = user.name;
            return map;
        }, {} as Record<string, string>);

        return new Response(JSON.stringify(userMap), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response("Internal Server Error", { status: 500 });
    }
}
