//"use client";
import React from "react";
import { signIn, signOut } from "@/auth";
import Link from "next/link";
import Image from "next/image";

//import { usePathname } from 'next/navigation'

interface HeaderProps {
    userId: string | undefined;
    isFormComplete: boolean;
    currentPath: string; // prop
}

const Header: React.FC<HeaderProps> = ({
    userId,
    isFormComplete,
    currentPath,
}) => {
    const callbackUrl = "/";

    return (
        <header className="flex justify-between flex-wrap items-center bg-white py-4 px-3 text-w gap-2 m-2 rounded-md w-11/12">
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
            <div className="flex items-center gap-4">
                {userId ? (
                    <>
                        {isFormComplete && (
                            <>  
                                <span className="text-lg mr-5 font-medium transition-colors duration-200">
                                    <Link
                                        href="/dashboard"
                                        className={
                                            currentPath === "/dashboard"
                                                ? "text-blue"
                                                : "text-gray hover:text-blue"
                                        }
                                    >
                                        Dashboard
                                    </Link>
                                </span>
                                <span className="text-lg mr-5 font-medium transition-colors duration-200">
                                    <Link
                                        href="/carpools"
                                        className={
                                            currentPath === "/carpools"
                                                ? "text-blue"
                                                : "text-gray hover:text-blue"
                                        }
                                    >
                                        Carpools
                                    </Link>
                                </span>
                                <span className="text-lg mr-5 font-medium transition-colors duration-200">
                                    <Link
                                        href="/user-profile"
                                        className={
                                            currentPath === "/user-profile"
                                                ? "text-blue"
                                                : "text-gray hover:text-blue"
                                        }
                                    >
                                        Profile
                                    </Link>
                                </span>
                            </>
                        )}
                    </>
                ) : null}
                <span
                    className="text-base text-w font-semibold bg-blue p-2 cursor-pointer rounded-md"
                    onClick={async () => {
                        "use server";
                        if (userId) {
                            await signOut();
                        } else {
                            await signIn("google", { callbackUrl });
                        }
                    }}
                >
                    {userId ? "Log Out" : "Log In"}
                </span>
            </div>
        </header>
    );
};

export default Header;
