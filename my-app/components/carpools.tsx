"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface CarpoolsProps {
    userId: string | undefined;
}

const Carpools: React.FC<CarpoolsProps> = () => {
    const router = useRouter();

    const handleCreateCarpool = () => {
        router.push("/create-carpool");
    };

    const handleJoinCarpool = () => {
        router.push("/join-carpool");
    };

    return (
        <div className="flex flex-col md:flex-row justify-start items-start gap-6 m-2">
            {/* Create Carpool */}
            <div className="flex flex-col w-full max-w-md bg-white rounded-md shadow-lg p-6 md:p-8 gap-6">
                <div>
                    <h2 className="text-black text-xl md:text-2xl font-bold font-['Open Sans']">
                        Create Carpool
                    </h2>
                    <p className="mt-2 text-gray-600 text-lg md:text-xl font-normal font-['Open Sans']">
                        Start a new carpool and manage families within the group
                    </p>
                </div>
                <button
                    className="w-full md:w-auto px-6 py-3 bg-[#4b859f] rounded-md border border-[#4b859f] text-white text-lg md:text-xl font-semibold font-['Open Sans']"
                    onClick={handleCreateCarpool}
                >
                    Create
                </button>
            </div>

            {/* Join Carpool */}
            <div className="flex flex-col w-full max-w-md bg-white rounded-md shadow-lg p-6 md:p-8 gap-6">
                <div>
                    <h2 className="text-black text-xl md:text-2xl font-bold font-['Open Sans']">
                        Join Carpool
                    </h2>
                    <p className="mt-2 text-gray-600 text-lg md:text-xl font-normal font-['Open Sans']">
                        Join an existing carpool and view your rides and
                        schedule
                    </p>
                </div>
                <button
                    className="w-full md:w-auto px-6 py-3 bg-[#4b859f] rounded-md border border-[#4b859f] text-white text-lg md:text-xl font-semibold font-['Open Sans']"
                    onClick={handleJoinCarpool}
                >
                    Join
                </button>
            </div>

            {/* Current Carpools */}
            <div className="flex flex-col w-full max-w-md bg-white rounded-md shadow-lg p-6 md:p-8 gap-6">
                <div>
                    <h2 className="text-black text-xl md:text-2xl font-bold font-['Open Sans']">
                        Current Carpools
                    </h2>
                    <p className="mt-2 text-gray-600 text-lg md:text-xl font-normal font-['Open Sans']">
                        You currently have no carpools - create or join one to
                        start!
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Carpools;
