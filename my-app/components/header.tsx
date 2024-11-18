import React from "react";
import { signIn, signOut } from "@/auth";
import Link from "next/link";

interface HeaderProps {
    userId: string | undefined;
}

const Header: React.FC<HeaderProps> = ({ userId }) => {
    const callbackUrl = "/";
    return (
        <header className="flex justify-between flex-wrap items-end bg-b py-4 px-6 min-w-full text-w">
            <p className="text-2xl text-w">
                <Link href="/">Poolerz</Link>
            </p>
            <div>
                <span className="text-sm mr-5">
                    <Link href="/user-form">Form</Link>
                </span>
                <span className="text-sm mr-5">
                    <Link href="/user-profile">Profile</Link>
                </span>
                <span
                    onClick={async () => {
                        "use server";
                        if (userId) {
                            await signOut();
                        } else {
                            await signIn("google", { callbackUrl });
                        }
                    }}
                    className="cursor-pointer text-sm mr-5 text-y"
                >
                    {userId ? "Logout" : "Login"}
                </span>
            </div>
        </header>
    );
};

export default Header;
