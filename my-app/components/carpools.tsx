"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

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
    const [carpoolIds, setCarpoolIds] = useState<string[]>([]); // list of carpoolIDs found under user-carpool-data
    const [joinCarpoolData, setJoinCarpoolData] = useState<CarpoolData[]>([]); // data of Carpools found by linking joined carpoolIds with the createCarpool info

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
                );
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [userId]);

    // GET create-carpool data handler via carpoolID
    const handleCarpoolsGetWithCarpoolId = useCallback(async (carpoolId: string) => {
        try {
            const response = await fetch(
                `/api/create-carpool-data?carpoolId=${carpoolId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                return data?.createCarpoolData; // Return the fetched data
            }
        } catch (error) {
            console.error(`Error fetching data for carpoolId ${carpoolId}:`, error);
        }
        return null; // Return null if there's an error
    }, []);

    // GET user-carpool-data handler
    const handleUserCarpoolsGet = useCallback(async () => {
        try {
            const response = await fetch(
                `/api/join-carpool-data?userId=${userId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                const joinedCarpoolsData = data?.createCarpoolData.userData.carpools;
                const carpoolIdsData: string[] = joinedCarpoolsData?.map((carpool: { carpoolId: any; }) => carpool.carpoolId) || [];
                console.log(carpoolIdsData);
                setCarpoolIds(
                    carpoolIdsData
                );
                // console.log(data?.createCarpoolData.userData.carpools);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [userId]);

    // Fetch all carpool data after carpoolIds are set
    const fetchAllCarpoolData = useCallback(async () => {
        if (carpoolIds.length === 0) return; // Ensure we have carpool IDs before fetching

        console.log("Fetching create-carpool data for IDs:", carpoolIds);

        const fetchedData = await Promise.all(
            carpoolIds.map(carpoolId => handleCarpoolsGetWithCarpoolId(carpoolId))
        );
        console.log(fetchedData);
        // Filter out null values and update state
        setJoinCarpoolData(fetchedData.flat());
    }, [carpoolIds, handleCarpoolsGetWithCarpoolId]);

    // Fetch create-carpool data when carpoolIds change
    useEffect(() => {
        if (carpoolIds.length > 0) {
            fetchAllCarpoolData();
        }
    }, [carpoolIds, fetchAllCarpoolData]);


    // get createFormData handler/caller effect
    useEffect(() => {
        handleCarpoolsGet();
        handleUserCarpoolsGet();
        console.log("Updated createCarpoolData:", createCarpoolData);
        console.log(joinCarpoolData);
        
    }, [userId, handleCarpoolsGet, handleUserCarpoolsGet]);

    return (
        <div className="flex flex-col md:flex-row justify-between items-stretch gap-6 m-6 px-20 w-full">
            {/* Create Carpool */}
            <div className="flex flex-col w-full max-w-lg bg-white rounded-md shadow-lg p-6 md:p-8 gap-6">
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
            <div className="flex flex-col w-full max-w-lg bg-white rounded-md shadow-lg p-6 md:p-8 gap-6">
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

            {/* Created Carpools */}
            <div className="flex flex-col w-full max-w-lg bg-white rounded-md shadow-lg p-6 md:p-8 gap-6">
                <div>
                    <h2 className="text-black text-xl md:text-2xl font-bold font-['Open Sans']">
                        Created Carpools
                    </h2>
                    {createCarpoolData.length > 0 ? (
                        <div className="mt-2 space-y-3">
                            {createCarpoolData.map((carpool, index) => (
                                <Link href={`/pool-info/${index}`} key={index} className="block">
                                    <div className="bg-gray-100 p-3 rounded-md shadow-sm hover:bg-gray-200 cursor-pointer flex justify-between items-center">
                                        <p className="text-lg font-semibold text-gray-800">
                                            {carpool?.createCarpoolData?.carpoolName || "No notes available"}
                                        </p>  
                                        <span className="text-blue text-5xl">›</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-2 text-gray-600 text-lg md:text-xl font-normal font-['Open Sans']">
                            You currently have no carpools - create or join one to start!
                        </p>
                    )}
                </div>
            </div>
            {/* Joined Carpools */}
            <div className="flex flex-col w-full max-w-lg bg-white rounded-md shadow-lg p-6 md:p-8 gap-6">
                <div>
                    <h2 className="text-black text-xl md:text-2xl font-bold font-['Open Sans']">
                        Joined Carpools
                    </h2>
                    {joinCarpoolData.length > 0 ? (
                        <div className="mt-2 space-y-3">
                            {joinCarpoolData.map((carpool, index) => (
                                <Link href={`/pool-info/${index}`} key={index} className="block">
                                    <div className="bg-gray-100 p-3 rounded-md shadow-sm hover:bg-gray-200 cursor-pointer flex justify-between items-center">
                                        <p className="text-lg font-semibold text-gray-800">
                                            {carpool.createCarpoolData?.carpoolName || "No notes available"}
                                        </p>  
                                        <span className="text-blue text-5xl">›</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-2 text-gray-600 text-lg md:text-xl font-normal font-['Open Sans']">
                            You currently have no joined carpools - create or join one to start!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Carpools;

