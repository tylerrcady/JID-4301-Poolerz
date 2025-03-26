"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import BackButton from "@/components/atoms/back-button";
import { Optimizer } from "@/lib/optimize";

interface UserWithCoords {
    userId: string;
    name: string;
    children?: string[];
    coordinates: {
        lat: number;
        lng: number;
    };
}

interface ClusterWithSchedule {
    users: UserWithCoords[];
    centroid: {
        lat: number;
        lng: number;
    };
    drivingSchedule: Record<string, string>; // day -> driver name
}

interface OptimizerResults {
    initialClusters: any[];
    validatedClusters: any[];
    finalClusters: ClusterWithSchedule[];
    unclusteredUsers: UserWithCoords[];
}

interface TransformedCarpool {
    id: number;
    members: string[];
    riders: string[];
    driverSchedule: Record<string, string> | any; // Use any temporarily to resolve type issue
    totalDistance: number;
}

interface TransformedResults {
    carpools: TransformedCarpool[];
    unassignedMembers: string[];
    metrics: {
        totalClusters: number;
        totalMembers: number;
        unassignedCount: number;
    };
}

interface PoolInfoProps {
    userId: string | undefined;
    index: string;
}

const CarpoolPage: React.FC<PoolInfoProps> = ({ userId, index }) => {
    const [foundCarpool, setFoundCarpool] = useState<Carpool>(); // found in user-carpool-data
    const [carpoolOrgInfo, setCarpoolOrgInfo] = useState<CreateCarpoolData>();
    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const [carpoolDays, setCarpoolDays] = useState<string>(); // found from create-carpool
    const [times, setTimes] = useState<string>(); // found from create-carpool
    const [drivingAvailability, setDrivingAvailability] = useState<string>(); // found from user-carpool-data
    const [riders, setRiders] = useState<string>(); // found from user-carpool-data
    const [userLocation, setUserLocation] = useState<UserLocation>();

    const router = useRouter();

    const handleConfirmBack = () => {
        router.back();
    };

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<TransformedResults | null>(null);

    const runOptimizer = async () => {
        setLoading(true);

        try {
            const carpoolId = new URLSearchParams(window.location.search).get(
                "carpoolId"
            );
            if (carpoolId) {
                const optimizerResults = await Optimizer(carpoolId); // run the optimizer with carpoolId from the URL as parameter
                console.log("Raw optimizer results:", optimizerResults);
                
                // Transform the optimizerResults into a more user-friendly format
                const transformedResults = {
                    carpools: optimizerResults.finalClusters.map((cluster, index) => {
                        // Extract member names from the cluster
                        const members = cluster.users.map(user => user.name);
                        
                        // Extract rider names based on children in the cluster
                        const riders = cluster.users.flatMap(user => 
                            user.children || []
                        );
                        
                        // Calculate total distance if available
                        const totalDistance = 0; // We can't calculate this from the current data structure
                        
                        // Transform driver schedule into day-to-driver format
                        const driverSchedule = cluster.drivingSchedule || {};
                        
                        return {
                            id: index,
                            members,
                            riders,
                            driverSchedule,
                            totalDistance
                        };
                    }),
                    unassignedMembers: optimizerResults.unclusteredUsers.map(user => user.name),
                    metrics: {
                        totalClusters: optimizerResults.finalClusters.length,
                        totalMembers: optimizerResults.finalClusters.reduce((total, cluster) => 
                            total + cluster.users.length, 0
                        ),
                        unassignedCount: optimizerResults.unclusteredUsers.length
                    }
                };
                
                console.log("Transformed results:", transformedResults);
                setResults(transformedResults);
            } else {
                console.error("Carpool ID is null");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // GET create-carpool data handler
    const handleCarpoolsGet = useCallback(async () => {
        try {
            const carpoolId = new URLSearchParams(window.location.search).get(
                "carpoolId"
            );
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
                const carpoolInfo = data?.createCarpoolData[0].createCarpoolData; 
                console.log(carpoolInfo);
                setCarpoolOrgInfo(carpoolInfo);
                const selectedArray = carpoolInfo?.carpoolDays;
                const daysString = selectedArray?.length
                    ? selectedArray
                          .map((dayIndex: number) => daysOfWeek[dayIndex])
                          .join(", ")
                    : "";
                setCarpoolDays(daysString);
                const notes = carpoolInfo?.notes;
                setTimes(notes.substring(10, 15));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [userId]);

    // GET user-carpool-data handler
    const handleUserDataGet = useCallback(async () => {
        try {
            const targetId = new URLSearchParams(window.location.search).get(
                "carpoolId"
            );
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
                setUserLocation(data?.createCarpoolData.userData.userLocation);
                console.log(data?.createCarpoolData.userData.carpools);
                const foundCarpool = data?.createCarpoolData.userData.carpools.find((c: { carpoolId: any; }) => c.carpoolId === targetId);
                setFoundCarpool(foundCarpool);
                console.log(foundCarpool);
                const selectedArray = foundCarpool.drivingAvailability;
                const daysString = selectedArray?.length
                    ? selectedArray
                          .map((dayIndex: number) => daysOfWeek[dayIndex])
                          .join(", ")
                    : ""; // maps number representation to day representation for weekdays
                setDrivingAvailability(daysString);
                const ridersArray = foundCarpool.riders;
                setRiders(ridersArray.join(", "));
            } else {
                console.error("Failed to fetch data:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [userId]);

    // get createFormData & handleUserDataGet handler/caller effect
    useEffect(() => {
        handleCarpoolsGet();
        handleUserDataGet();
    }, [userId, handleCarpoolsGet, handleUserDataGet]);

    return (
        <>
            <div className="w-11/12 mx-auto px-1">
                <BackButton onClick={handleConfirmBack} />
            </div>
            <div className="justify-center flex flex-col w-6/12 mx-auto p-10 gap-6 rounded-md">
                {/*Title Card*/}
                <div className="flex-col justify-start items-start gap-5 flex">
                    <div className="text-black text-2xl font-bold font-['Open Sans']">
                        {carpoolOrgInfo?.carpoolName}
                    </div>
                    <div className="self-stretch justify-start items-start inline-flex gap-10">
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            Closes on March 4
                        </div>
                        <div className="text-blue text-xl font-bold font-['Open Sans']">
                            Close Now
                        </div>
                    </div>
                </div>
                {/*Carpool Info*/}
                <div className="py-10 flex-col justify-start items-start gap-5 flex">
                    <div className="self-stretch justify-between items-start inline-flex">
                        <div className="text-black text-xl font-bold font-['Open Sans']">
                            Organization Information
                        </div>
                        <div className="text-blue text-xl font-bold font-['Open Sans']">
                            Edit
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Location
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">{`${carpoolOrgInfo?.carpoolLocation.name}, ${carpoolOrgInfo?.carpoolLocation.address}, ${carpoolOrgInfo?.carpoolLocation.city}, ${carpoolOrgInfo?.carpoolLocation.state} ${carpoolOrgInfo?.carpoolLocation.zipCode}`}</div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Occurs Every
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            {carpoolDays}
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Time
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            {times}
                        </div>
                    </div>
                </div>
                {/*Carpools*/}
                <div className="w-8/12 flex-col justify-start items-start gap-5 flex">
                    <div className="self-stretch justify-start items-center gap-5 inline-flex">
                        <div className="text-black text-xl font-bold font-['Open Sans']">
                            Carpools
                        </div>
                        <div className="px-6 py-2 bg-blue rounded-md justify-center items-center inline-flex">
                            {!loading && (
                                <button
                                    className="text-center text-white text-base font-normal font-['Open Sans']"
                                    onClick={() => runOptimizer()}
                                >
                                    Run Optimizer
                                </button>
                            )}
                            {loading && (
                                <div className="text-center text-white text-base font-normal font-['Open Sans']">
                                    Optimizing...
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {!results && (
                        <div className="flex-col justify-start items-start gap-2.5 flex">
                            <div className="text-gray text-xl font-normal font-['Open Sans']">
                                No pools yet - run the optimizer to create
                                groupings!
                            </div>
                        </div>
                    )}
                    
                    {results && (
                        <div className="w-full flex-col justify-start items-start gap-6 flex mt-4">
                            <div className="text-black text-lg font-semibold font-['Open Sans']">
                                Optimization Results
                            </div>
                            
                            {results.carpools && results.carpools.map((carpool: any, index: number) => (
                                <div key={index} className="w-full p-4 border border-gray-200 rounded-md shadow-sm">
                                    <div className="text-blue font-semibold text-lg mb-2">
                                        Carpool Group {index + 1}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-gray font-bold text-md">Driver Schedule</div>
                                            <div className="mt-1">
                                                {carpool.driverSchedule && Object.entries(carpool.driverSchedule).map(([day, driver]: [string, any]) => (
                                                    <div key={day} className="flex justify-between items-center py-1">
                                                        <span className="text-gray-600">{day}:</span>
                                                        <span className="font-medium">{driver}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="text-gray font-bold text-md">Members</div>
                                            <div className="mt-1">
                                                {carpool.members && carpool.members.map((member: string, idx: number) => (
                                                    <div key={idx} className="py-1 text-gray-600">
                                                        {member}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {carpool.riders && carpool.riders.length > 0 && (
                                        <div className="mt-3">
                                            <div className="text-gray font-bold text-md">Riders</div>
                                            <div className="mt-1 text-gray-600">
                                                {carpool.riders.join(", ")}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {carpool.totalDistance && (
                                        <div className="mt-3 text-sm text-gray-500">
                                            Total distance: {carpool.totalDistance.toFixed(2)} miles
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {results.unassignedMembers && results.unassignedMembers.length > 0 && (
                                <div className="w-full p-4 border border-gray-200 rounded-md mt-4">
                                    <div className="text-red-500 font-semibold text-lg mb-2">
                                        Unassigned Members
                                    </div>
                                    <div className="text-gray-600">
                                        {results.unassignedMembers.join(", ")}
                                    </div>
                                </div>
                            )}

                            {results.metrics && (
                                <div className="w-full p-4 border border-gray-200 rounded-md mt-4">
                                    <div className="text-black font-semibold text-lg mb-2">
                                        Optimization Metrics
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(results.metrics).map(([key, value]: [string, any]) => (
                                            <div key={key} className="flex justify-between items-center py-1">
                                                <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                                                <span className="font-medium">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex-col justify-start items-start gap-2.5 flex mt-6">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            All Members
                        </div>
                        <div className="flex-col justify-start items-start gap-2.5 flex">
                            <div className="text-gray text-xl font-normal font-['Open Sans']">
                                Megan Wagner, Asha Vora, Tom Papa, Ben Aimasiko,
                                David Pursell, Bijoy Vallamattam, Lorie Langan,
                                Michael Li, Mary Rice, John Barry, Janice
                                McAniff, Nadia Lin
                            </div>
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            All Riders
                        </div>
                        <div className="flex-col justify-start items-start gap-2.5 flex">
                            <div className="text-gray text-xl font-normal font-['Open Sans']">
                                Lauren Wagner, Shivani Vora, Nathan Papa, Peter
                                Aimasiko, Benedict Pursell, Annie Vallamattam,
                                Grace Langan, Bryan Li, Thomas Rice, Patrick
                                Barry, Alex McAniff, Nathan Lin
                            </div>
                        </div>
                    </div>
                </div>
                <div className="py-10 flex-col justify-start items-start gap-5 flex">
                    <div className="self-stretch justify-between items-start inline-flex">
                        <div className="text-black text-xl font-bold font-['Open Sans']">
                            My Information
                        </div>
                        <div className="text-blue text-xl font-bold font-['Open Sans']">
                            Edit
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Location
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">{`${userLocation?.address}, ${userLocation?.city}, ${userLocation?.state} ${userLocation?.zipCode}`}</div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Driving Availability
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            {drivingAvailability}
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Rider(s)
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            {riders}
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Car Capacity
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            {foundCarpool?.carCapacity}
                        </div>
                    </div>
                </div>
                {/*My Pool*/}
                <div className="flex-col justify-start items-start gap-5 flex">
                    <div className="justify-start items-start gap-5 inline-flex">
                        <div className="text-black text-xl font-bold font-['Open Sans']">
                            My Carpool
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Members
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            Megan Wagner, Asha Vora, Tom Papa
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Driving Days
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            ?????
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Riders
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            Lauren Wagner, Shivani Vora, Nathan Papa
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Notes
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            Asha Vora - my child has a peanut allergy!
                            <br />
                            Tom Papa - Nathan has an oversized backpack
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CarpoolPage;
