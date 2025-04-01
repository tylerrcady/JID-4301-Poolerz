"use client";

import React, { useState } from "react";
import { signIn, signOut } from "next-auth/react"; // Import from next-auth
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
    userId: string | undefined;
    isFormComplete: boolean;
    currentPath: string;
}

const Header: React.FC<HeaderProps> = ({
    userId,
    isFormComplete,
    currentPath,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="flex justify-between items-center bg-white py-4 px-5 text-w gap-2 mb-7 rounded-md w-full">
            <Link href="/" aria-label="Go to home">
                <div className="relative w-full max-w-xs">
                    <Image
                        width={175}
                        height={30}
                        src="/Poolerz.io.png"
                        alt="Poolerz logo"
                    />
                </div>
            </Link>
            {/* Hamburger Menu */}
            <div className="md:hidden">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-gray"
                    aria-label="Toggle menu"
                >
                    <Image
                        src="/burger-menu.svg"
                        alt="Toggle menu"
                        width={40}
                        height={40}
                        className="object-contain"
                    />
                </button>
                <nav
                    className={`absolute top-16 left-0 w-full bg-white shadow-md rounded-md transform transition-all duration-500 ease-in-out ${
                        menuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                    } origin-top`}
                >
                    {userId && isFormComplete && (
                        <>
                            <Link
                                href="/dashboard"
                                className={`block text-lg font-medium transition-colors duration-200 px-5 py-2 ${
                                    currentPath === "/dashboard"
                                        ? "text-blue underline underline-offset-8 decoration-2"
                                        : "text-gray hover:text-blue"
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/carpools"
                                className={`block text-lg font-medium transition-colors duration-200 px-5 py-2 ${
                                    currentPath === "/carpools" || currentPath.startsWith("/pool-info")
                                        ? "text-blue underline underline-offset-8 decoration-2"
                                        : "text-gray hover:text-blue"
                                }`}
                            >
                                Carpools
                            </Link>
                            <Link
                                href="/user-profile"
                                className={`block text-lg font-medium transition-colors duration-200 px-5 py-2 ${
                                    currentPath === "/user-profile"
                                        ? "text-blue underline underline-offset-8 decoration-2"
                                        : "text-gray hover:text-blue"
                                }`}
                            >
                                Profile
                            </Link>
                        </>
                    )}
                    <span
                        className="inline-block text-base text-w text-sm font-medium bg-blue ml-5 mb-5 px-5
                                    py-2 cursor-pointer rounded-md mt-2"
                        onClick={async () => {
                            if (userId) {
                                await signOut();
                            } else {
                                await signIn("google");
                            }
                        }}
                    >
                        {userId ? "Log Out" : "Log In"}
                    </span>
                </nav>
            </div>
            {/* Desktop Menu */}
            <nav className="hidden md:flex md:items-center md:gap-10">
                {userId && isFormComplete && (
                    <>
                        <Link
                            href="/dashboard"
                            className={`text-lg font-medium transition-colors duration-200 ${
                                currentPath === "/dashboard"
                                    ? "text-blue underline underline-offset-8 decoration-2"
                                    : "text-gray hover:text-blue"
                            }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/carpools"
                            className={`text-lg font-medium transition-colors duration-200 ${
                                currentPath === "/carpools" || currentPath.startsWith("/pool-info")
                                    ? "text-blue underline underline-offset-8 decoration-2"
                                    : "text-gray hover:text-blue"
                            }`}
                        >
                            Carpools
                        </Link>
                        <Link
                            href="/user-profile"
                            className={`text-lg font-medium transition-colors duration-200 ${
                                currentPath === "/user-profile"
                                    ? "text-blue underline underline-offset-8 decoration-2"
                                    : "text-gray hover:text-blue"
                            }`}
                        >
                            Profile
                        </Link>
                    </>
                )}
                <span
                    className="text-base text-w font-medium bg-blue p-2 cursor-pointer rounded-md"
                    onClick={async () => {
                        if (userId) {
                            await signOut();
                        } else {
                            await signIn("google");
                        }
                    }}
                >
                    {userId ? "Log Out" : "Log In"}
                </span>
            </nav>
        </header>
    );
};

export default Header;