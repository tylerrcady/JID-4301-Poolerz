"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface JoinCarpoolProps {
    userId: string | undefined;
}

const JoinCarpool: React.FC<JoinCarpoolProps> = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col w-10/12 max-w-2xl mx-auto p-4 gap-6">
            {/* Title */}
            <h1 className="text-black text-2xl font-bold font-['Open Sans']">
                Carpool Invites
            </h1>
            {/* Back Button */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="text-b text-lg md:text-2xl"
                >
                    Back
                </button>
            </div>

            {/* Invite 1 */}
            <div className="bg-white rounded-md shadow-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-black text-xl md:text-2xl font-bold font-['Open Sans']">
                        Mount Pisgah Track Team
                    </h2>
                    <p className="text-[#666666] text-lg md:text-xl font-normal font-['Open Sans'] mt-1">
                        Organizer: Matthew Dworkin
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button className="px-6 py-2 bg-[#4b859f] rounded-md border border-[#4b859f] text-white text-lg md:text-xl font-semibold font-['Open Sans']">
                        Join
                    </button>
                    <button className="px-6 py-2 rounded-md shadow-md border border-[#666666] text-[#575757] text-lg md:text-xl font-semibold font-['Open Sans']">
                        Ignore
                    </button>
                </div>
            </div>

            {/* Invite 2 */}
            <div className="bg-white rounded-md shadow-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-black text-xl md:text-2xl font-bold font-['Open Sans']">
                        Centerville Choir Group
                    </h2>
                    <p className="text-[#666666] text-lg md:text-xl font-normal font-['Open Sans'] mt-1">
                        Organizer: Maya Narayanan
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button className="px-6 py-2 bg-[#4b859f] rounded-md border border-[#4b859f] text-white text-lg md:text-xl font-semibold font-['Open Sans']">
                        Join
                    </button>
                    <button className="px-6 py-2 rounded-md shadow-md border border-[#666666] text-[#575757] text-lg md:text-xl font-semibold font-['Open Sans']">
                        Ignore
                    </button>
                </div>
            </div>

            {/* Invite 3 */}
            <div className="bg-white rounded-md shadow-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-black text-xl md:text-2xl font-bold font-['Open Sans']">
                        FDR Math Team
                    </h2>
                    <p className="text-[#666666] text-lg md:text-xl font-normal font-['Open Sans'] mt-1">
                        Organizer: Ignacio Galindo
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button className="px-6 py-2 bg-[#4b859f] rounded-md border border-[#4b859f] text-white text-lg md:text-xl font-semibold font-['Open Sans']">
                        Join
                    </button>
                    <button className="px-6 py-2 rounded-md shadow-md border border-[#666666] text-[#575757] text-lg md:text-xl font-semibold font-['Open Sans']">
                        Ignore
                    </button>
                </div>
            </div>
        </div>
    );
};
export default JoinCarpool;
