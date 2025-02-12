"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CarpoolsProps {
    userId: string | undefined;
}

interface CarpoolData {
    carpoolID: string | undefined;
    createCarpoolData: CreateCarpoolData | undefined; 
}

const Carpools: React.FC<CarpoolsProps> = ({ userId }) => {
    const router = useRouter();
    const [createCarpoolData, setCreateCarpoolData] = useState<CarpoolData[]>([]);

    const handleCreateCarpool = () => {
        router.push("/create-carpool");
    };

    const handleJoinCarpool = () => {
        router.push("/join-carpool");
    };

    // GET create-carpool data handler
    const handleCarpoolsGet = useCallback(async () => {
        try {
            const response = await fetch(
                `/api/create-carpool-data?creatorId=${userId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                setCreateCarpoolData(
                    data?.createCarpoolData
                ); // update variable with returned data if any exists
                
            } else {
                console.error("Failed to fetch data:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [userId]);

    // get createFormData handler/caller effect
    useEffect(() => {
        handleCarpoolsGet();
        console.log("Updated createCarpoolData:", createCarpoolData);
    }, [userId, handleCarpoolsGet]);

    return (
        <div className="flex flex-col md:flex-row justify-start items-start gap-6 m-6">
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
                    {createCarpoolData.length > 0 ? (
                        <div className="mt-2 space-y-3">
                            {createCarpoolData.map((carpool, index) => (
                                <div key={index} className="bg-gray-100 p-3 rounded-md shadow-sm">
                                    <p className="text-lg font-semibold text-gray-800">
                                        {carpool?.createCarpoolData?.notes || "No notes available"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-2 text-gray-600 text-lg md:text-xl font-normal font-['Open Sans']">
                            You currently have no carpools - create or join one to start!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Carpools;

