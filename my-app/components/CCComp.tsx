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
        <div className="flex flex-col w-full items-center p-1 gap-6">
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
            <p className="text-black text-base font-normal font-['Open Sans'] mb-2 text-center">
                Your carpool for{" "}
                <span className="font-semibold">{poolName}</span> has been
                created. Share the join code below to invite others to the pool!
            </p>

            {/* Join Code Section */}
            <div className="mb-2 text-center">
                <h2 className="text-black text-lg font-bold font-['Open Sans'] mb-1">
                    Join Code
                </h2>
                <p className="text-black text-xl font-semibold font-['Open Sans']">
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
                disabled={loading}
                className={`px-4 py-2 rounded-md border text-base md:text-lg font-semibold font-['Open Sans'] ${
                    loading
                        ? "bg-gray-400 border-gray-400 text-gray-200"
                        : "bg-[#4b859f] border-[#4b859f] text-white"
                }`}
            >
                {!loading ? (
                    <span>View My Carpool</span>
                ) : (
                    <span>Navigating...</span>
                )}
            </button>
        </div>
    );
};
export default CCComp;
