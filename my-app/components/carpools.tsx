"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Loading from "./icons/Loading";

interface CarpoolsProps {
    userId: string | undefined;
}

interface CarpoolData {
    carpoolID: string | undefined;
    createCarpoolData: CreateCarpoolData | undefined;
}

const Carpools: React.FC<CarpoolsProps> = ({ userId }) => {
    const router = useRouter();
    const [createCarpoolData, setCreateCarpoolData] = useState<CarpoolData[]>(
        []
    );
    const [carpoolIds, setCarpoolIds] = useState<string[]>([]); // list of carpoolIDs found under user-carpool-data
    const [joinCarpoolData, setJoinCarpoolData] = useState<CarpoolData[]>([]); // data of Carpools found by linking joined carpoolIds with the createCarpool info
    const [loading, setLoading] = useState<boolean>(true);

    const handleCreateCarpool = () => {
        router.push("/create-carpool");
    };

    const handleJoinCarpool = () => {
        router.push("/join-carpool");
    };

    // GET create-carpool data handler
    const handleCarpoolsGet = useCallback(async () => {
        try {
            setLoading(true);
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
                setCreateCarpoolData(data?.createCarpoolData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // GET create-carpool data handler via carpoolID
    const handleCarpoolsGetWithCarpoolId = useCallback(
        async (carpoolId: string) => {
            try {
                setLoading(true);
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
                console.error(
                    `Error fetching data for carpoolId ${carpoolId}:`,
                    error
                );
            } finally {
                setLoading(false);
            }
            return null; // Return null if there's an error
        },
        []
    );

    // GET user-carpool-data handler
    const handleUserCarpoolsGet = useCallback(async () => {
        try {
            setLoading(true);
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
                const joinedCarpoolsData =
                    data?.createCarpoolData?.[0]?.userData?.carpools;
                const carpoolIdsData: string[] =
                    joinedCarpoolsData?.map(
                        (carpool: { carpoolId: any }) => carpool.carpoolId
                    ) || [];
                // console.log(carpoolIdsData);
                setCarpoolIds(carpoolIdsData);
                // console.log(data?.createCarpoolData.userData.carpools);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Fetch all carpool data after carpoolIds are set
    const fetchAllCarpoolData = useCallback(async () => {
        if (carpoolIds.length === 0) return; // Ensure we have carpool IDs before fetching
        setLoading(true);

        // console.log("Fetching create-carpool data for IDs:", carpoolIds);

        const fetchedData = await Promise.all(
            carpoolIds.map((carpoolId) =>
                handleCarpoolsGetWithCarpoolId(carpoolId)
            )
        );
        // console.log(fetchedData);
        // Filter out null values and update state
        setJoinCarpoolData(fetchedData.flat());
        setLoading(false);
    }, [carpoolIds, handleCarpoolsGetWithCarpoolId]);

    // annie note: previous joining didn't pull created carpools properly,
    // this uses old logic, but filters for duplicates
    const allCarpools = [
        ...createCarpoolData.map((carpool) => ({ ...carpool, isOwner: true })),
        ...joinCarpoolData
            .filter(
                (joined) =>
                    !createCarpoolData.some(
                        (created) => created.carpoolID === joined.carpoolID
                    )
            )
            .map((carpool) => ({ ...carpool, isOwner: false })),
    ];

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
        // console.log("Updated createCarpoolData:", createCarpoolData);
        // console.log(joinCarpoolData);
    }, [userId, handleCarpoolsGet, handleUserCarpoolsGet]);

    return (
        <div className="flex flex-col md:flex-row justify-between gap-6 lg:px-20 px-5 m-2 pb-5 w-full items-start">
            {/* Create and Join Carpool */}
            <div className="flex flex-col w-full md:w-1/2 gap-4">
                {/* Create Carpool */}
                <div className="flex flex-col w-full bg-gradient-to-t from-offwhite to-white rounded-md shadow-lg p-6 gap-3 h-auto">
                    <div>
                        <h2 className="text-black text-lg md:text-xl font-bold font-['Open Sans']">
                            Create Carpool
                        </h2>
                        <p className="mt-1 text-gray text-md md:text-lg font-normal font-['Open Sans']">
                            Start a new carpool to add and manage families
                            within the organization
                        </p>
                    </div>
                    <button
                        className="w-full md:w-auto px-4 py-2 bg-blue rounded-md border border-blue text-white text-md md:text-lg font-semibold font-['Open Sans'] hover:opacity-75"
                        onClick={handleCreateCarpool}
                    >
                        Create
                    </button>
                </div>

                {/* Join Carpool */}
                <div className="flex flex-col w-full bg-gradient-to-t from-offwhite to-white rounded-md shadow-lg p-6 gap-3 h-auto">
                    <div>
                        <h2 className="text-black text-lg md:text-xl font-bold font-['Open Sans']">
                            Join Carpool
                        </h2>
                        <p className="mt-1 text-gray text-md md:text-lg font-normal font-['Open Sans']">
                            Join an existing carpool with a code to view your
                            group, rides, and schedule
                        </p>
                    </div>
                    <button
                        className="w-full md:w-auto px-4 py-2 bg-blue rounded-md border border-blue text-white text-md md:text-lg font-semibold font-['Open Sans'] hover:opacity-75"
                        onClick={handleJoinCarpool}
                    >
                        Join
                    </button>
                </div>
            </div>

            {/* Current Carpools */}
            <div className="flex flex-col w-full md:w-1/2 bg-gradient-to-t from-offwhite2 to-white rounded-md shadow-lg p-6 md:p-8 gap-6">
                <div>
                    <h2 className="text-black text-xl md:text-2xl font-bold font-['Open Sans']">
                        Current Carpools
                    </h2>
                    {allCarpools.length > 0 ? (
                        <div className="mt-2 space-y-3 overflow-y-scroll h-80 px-5 scrollbar-custom">
                            {allCarpools.map((carpool, index) => (
                                <Link
                                    href={`/pool-info/${index}?carpoolId=${allCarpools[index].carpoolID}&newPool=${carpool.isOwner}`}
                                    key={index}
                                    className="block"
                                >
                                    <div className="p-3 bg-w bg-opacity-70 rounded-md shadow-sm cursor-pointer flex justify-between items-center hover:bg-gray hover:bg-opacity-5 hover:duration-75">
                                        <div className="flex flex-col gap-2">
                                            <div className="text-2xl md:text-reg font-regular text-gray">
                                                {
                                                    carpool.createCarpoolData
                                                        ?.carpoolName
                                                }
                                            </div>
                                            {carpool.isOwner && (
                                                <div className="italic">
                                                    Owner
                                                </div>
                                            )}
                                        </div>
                                        <Image
                                            src="/back-arrow2.svg"
                                            alt="Back arrow"
                                            width={30}
                                            height={30}
                                            className={`mr-1 rotate-180`}
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center flex-col items-center">
                            {!loading ? (
                                <>
                                    <p className="mt-2 text-gray text-lg md:text-xl font-normal font-['Open Sans']">
                                        You currently have no carpools - create
                                        or join one to start!
                                    </p>
                                    <Image
                                        src="/Curly.svg"
                                        alt="Curly graphic"
                                        width={50}
                                        height={50}
                                        className="hidden lg:block w-1/3 h-1/3 mt-6"
                                    />
                                </>
                            ) : (
                                <div className="mt-6">
                                    <Loading />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Carpools;
