import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    session: { strategy: "jwt" },
    callbacks: {
        async session({ session }) {
            console.log("Session callback started");
            try {
                const client = await clientPromise;
                console.log("Database connected");
                const db = client.db("poolerz");
                const usersCollection = db.collection("users");

                const userId = await usersCollection.findOne({
                    email: session?.user?.email,
                });
                console.log("User found:", userId);

                session.user.id = userId ? userId._id.toString() : "";
                console.log("Session callback completed");
                return session;
            } catch (error) {
                console.error("Error in session callback:", error);
                return session;
            }
        },
    },
    providers: [Google],
});
