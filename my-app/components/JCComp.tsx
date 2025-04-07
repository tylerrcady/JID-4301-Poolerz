"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const JCComp: React.FC = ({}) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const poolName = searchParams.get("poolName") || "Your Pool";

    const [loading, setLoading] = useState(false);

    return (
        <>
            {/* Blue Circle with White Check Mark */}
            <div className="mb-2">
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#4b859f]">
                    <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
            </div>

            {/* Heading */}
            <h1 className="text-black text-3xl font-bold font-['Open Sans'] mb-1">
                Carpool Joined!
            </h1>

            {/* Informational Message */}
            <p className="text-black text-lg font-normal font-['Open Sans'] mb-1 text-center">
                Your carpool for{" "}
                <span className="font-semibold">{poolName}</span> has been
                joined. You can find, manage, and edit your schedule within the
                group in the Carpools tab.
            </p>

            {/* Return Button */}
            <button
                onClick={() => {
                    setLoading(true);
                    router.push("/carpools");
                }}
                className="px-6 py-3 bg-[#4b859f] rounded-md border border-[#4b859f] text-white text-lg md:text-xl font-semibold font-['Open Sans']"
            >
                {!loading ? (
                    <span>View My Carpool</span>
                ) : (
                    <span>Navigating...</span>
                )}
            </button>
        </>
    );
};
export default JCComp;
