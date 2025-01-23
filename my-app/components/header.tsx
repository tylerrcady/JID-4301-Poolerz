import React from "react";
import { signIn, signOut } from "@/auth";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
    userId: string | undefined;
    isFormComplete: boolean; // Pass this as a prop
}

const Header: React.FC<HeaderProps> = ({ userId, isFormComplete }) => {
    const callbackUrl = "/";

    return (
        <header className="flex justify-between flex-wrap items-center bg-white py-4 px-6 min-w-full text-w">
            <Link href="/" aria-label="Go to home">
                <div className="relative w-full max-w-xs">
                    <Image
                        layout="responsive"
                        width={245}
                        height={42}
                        src="/poolerz.jpg"
                        alt="Poolerz logo"
                    />
                </div>
            </Link>
            <div>
                {userId && !isFormComplete && (
                    <span className="text-base mr-5 text-blue font-semibold">
                        <Link href="/user-form">Form</Link>
                    </span>
                )}
                {userId && (
                    <span className="text-base mr-5 text-blue font-semibold">
                        <Link href="/user-profile">Profile</Link>
                    </span>
                )}
                <span
                    onClick={async () => {
                        "use server";
                        if (userId) {
                            await signOut();
                        } else {
                            await signIn("google", { callbackUrl });
                        }
                    }}
                    className="cursor-pointer text-base mr-5 text-yellow font-semibold"
                >
                    {userId ? "Logout" : "Login"}
                </span>
            </div>
        </header>
    );
};

export default Header;