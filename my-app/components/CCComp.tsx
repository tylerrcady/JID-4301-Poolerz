"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CCComp: React.FC = ({}) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const joinCode = searchParams.get("joinCode") || "XXXXXX";
    const poolName = searchParams.get("poolName") || "Your Pool";

    const [loading, setLoading] = useState(false);

    return (
        <>
            {/* Blue Circle with White Check Mark */}
            <div className="mb-2">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#4b859f]">
                    <svg
                        className="w-10 h-10 text-white"
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
            <h1 className="text-black text-2xl font-bold font-['Open Sans'] mb-1">
                Carpool Created!
            </h1>

            {/* Informational Message */}
            <p className="px-10 md:px-0 text-black text-base md:text-lg font-normal font-['Open Sans'] mb-0 md:mb-2 text-center">
                Your carpool for{" "}
                <span className="font-semibold">{poolName}</span> has been
                created.
                <br className="block md:hidden" /> Share the join code below to invite others to the pool!
            </p>

            {/* Join Code Section */}
            <div className="mb-0 md:mb-2 text-center">
                <h2 className="text-black text-lg md:text-xl font-bold font-['Open Sans'] mb-1">
                    Join Code
                </h2>
                <p className="text-black text-xl md:text-2xl font-semibold font-['Open Sans']">
                    {joinCode}
                </p>
            </div>

            {/* Return Button */}
            <button
                onClick={() => {
                    setLoading(true);
                    router.push(
                        `/pool-info/0?carpoolId=${joinCode}&newPool=true`
                    );
                }}
                className="px-4 py-2 bg-blue rounded-md border border-blue text-white text-base md:text-lg font-semibold font-['Open Sans']"
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
export default CCComp;
