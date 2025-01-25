import React from "react";
import { signIn, signOut } from "@/auth";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
    userId: string | undefined;
    isFormComplete: boolean;
}

const Header: React.FC<HeaderProps> = ({ userId, isFormComplete }) => {
    const callbackUrl = "/";

    return (
        <header className="flex justify-between flex-wrap items-center bg-white py-4 px-3 text-w gap-2 border border-d border-[#D3D3D3] m-2 rounded-md w-11/12">
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
            <div className="flex items-center gap-4">
                {userId ? (
                    <>
                        {isFormComplete && (
                            <>
                                <span className="text-base mr-5 text-blue font-semibold">
                                    <Link href="/carpools">Carpools</Link>
                                </span>
                                <span className="text-base mr-5 text-blue font-semibold">
                                    <Link href="/user-profile">Profile</Link>
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
