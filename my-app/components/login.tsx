import React from "react";
import { signIn } from "@/auth";

const Login: React.FC = () => {
    const callbackUrl = "/";
    return (
        <div className="text-center">
            <div
                onClick={async () => {
                    "use server";
                    await signIn("google", { callbackUrl });
                }}
                className="flex items-center justify-center w-48 h-12 bg-white text-gray-700 rounded-md border border-gray-300 shadow hover:cursor-pointer hover:shadow-md space-x-2"
            >
                <span className="font-medium text-sm">Sign in with Google</span>
            </div>
        </div>
    );
};

export default Login;
