"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import BackButton from "@/components/atoms/back-button";
import { Optimizer } from "@/lib/optimize";

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
    const [carpoolID, setCarpoolID] = useState<string>(); // found from URL
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
    const [results, setResults] = useState<any | null>(null);

    const runOptimizer = async () => {
        setLoading(true);

        try {
            const carpoolId = new URLSearchParams(window.location.search).get(
                "carpoolId"
            );
            if (carpoolId) {
                const optimizerResults = await Optimizer(carpoolId); // run the optimizer with carpoolId from the URL as parameter
                console.log(optimizerResults);
                setResults(optimizerResults); // store the results in the state
                setCarpoolID(carpoolId);
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
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            No pools yet - run the optimizer to create
                            groupings!
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
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
