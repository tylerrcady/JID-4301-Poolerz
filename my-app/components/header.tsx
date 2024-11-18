"use client"
import React from "react";
import { signIn, signOut } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface HeaderProps {
    userId: string | undefined;
}

const Header: React.FC<HeaderProps> = ({ userId }) => {
    const callbackUrl = "/";
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;
    return (
        <header className="flex justify-between flex-wrap items-end bg-white py-4 px-10 min-w-full text-w">
            {/*<p className="text-2xl text-w">
                <Link href="/">Poolerz</Link>
            </p>
            <div>
                <span className="text-sm mr-5">
                    <Link href="/user-form">Form</Link>
                </span>
                <span className="text-sm mr-5">
                    <Link href="/user-profile">Profile</Link>
                </span>
                <span className="text-sm mr-5">{userId ? userId : "N/A"}</span>
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
            </div>*/}

            {/*Logo*/}
            <Link href="/" aria-label="Go to home">
                    <Image 
                        width = {245} 
                        height = {42} 
                        src="/poolerz.jpg" 
                        alt="Poolerz logo"/>
            </Link>

            {/*Nav Bar*/}
            <nav className="flex space-x-8 text-gray">
                <Link href="/">
                <span
                    className={`cursor-pointer ${
                        isActive("/dashboard") 
                            ? "text-blue border-b-2 border-blue" 
                            : "hover:text-blue"
                    }`}
                    >
                        Dashboard
                    </span>
                </Link>

                <Link href="/">
                    <span
                        className={`cursor-pointer ${
                            isActive("/carpools")
                                ? "text-blue border-b-2 border-blue"
                                : "hover:text-blue"
                        }`}
                    >
                        Carpools
                    </span>
                </Link>

                <Link href="user-profile">
                    <span
                        className={`cursor-pointer ${
                            isActive("/profile")
                                ? "text-blue border-b-2 border-blue"
                                : "hover:text-blue"
                        }`}
                    >
                        Profile
                    </span>
                </Link>
            </nav>
        </header>
    );
};

export default Header;
