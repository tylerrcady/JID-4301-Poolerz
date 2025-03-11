"use client";

import React, { useState, useEffect, useCallback } from "react";

interface PoolInfoProps {
  userId: string | undefined;
  index: string;
}

const CarpoolPage: React.FC<PoolInfoProps> = ({ userId, index }) => {
    const [foundCarpool, setFoundCarpool] = useState<CreateCarpoolData>();
    const [joinCarpoolData, setJoinCarpoolData] = useState<JoinCarpoolData>();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [carpoolDays, setCarpoolDays] = useState<string>();
    const [times, setTimes] = useState<string>();
    const [drivingAvailability, setDrivingAvailability] = useState<string>();

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
                console.log(data?.createCarpoolData);
                setFoundCarpool(data.createCarpoolData[Number(index)]?.createCarpoolData);
                const selectedArray = data.createCarpoolData[Number(index)]?.createCarpoolData?.carpoolDays;
                const daysString = selectedArray?.length 
                    ? selectedArray.map((dayIndex: number) => daysOfWeek[dayIndex]).join(", ")
                    : "";
                setCarpoolDays(daysString);
                const notes = data.createCarpoolData[Number(index)]?.createCarpoolData?.notes;
                setTimes(notes.substring(10, 15))
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [userId]);


    // GET user-carpool-data handler
    const handleUserDataGet = useCallback(async () => {
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
                console.log(data?.createCarpoolData.userData);
                setJoinCarpoolData(
                    data?.createCarpoolData.userData
                );
                const selectedArray = data?.createCarpoolData.userData.drivingAvailability;
                const daysString = selectedArray?.length 
                    ? selectedArray.map((dayIndex: number) => daysOfWeek[dayIndex]).join(", ")
                    : "";
                setDrivingAvailability(daysString);
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
        console.log(foundCarpool);
        console.log(joinCarpoolData);
    }, [userId, handleCarpoolsGet, handleUserDataGet]);

    return (
        <div className="justify-center flex flex-col w-6/12 mx-auto p-10 gap-6 rounded-md">
        {/*Title Card*/}
        <div className="flex-col justify-start items-start gap-5 flex">
            <div className="text-black text-2xl font-bold font-['Open Sans']">{foundCarpool?.carpoolName}</div>
            <div className="self-stretch justify-start items-start inline-flex gap-10">
                <div className="text-gray text-xl font-normal font-['Open Sans']">Closes on March 4</div>
                <div className="text-blue text-xl font-bold font-['Open Sans']">Close Now</div>
            </div>
        </div>
        {/*Carpool Info*/}
        <div className="py-10 flex-col justify-start items-start gap-5 flex">
            <div className="self-stretch justify-between items-start inline-flex">
                <div className="text-black text-xl font-bold font-['Open Sans']">Organization Information</div>
                <div className="text-blue text-xl font-bold font-['Open Sans']">Edit</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Location</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">{`${foundCarpool?.carpoolLocation.name}, ${foundCarpool?.carpoolLocation.address}, ${foundCarpool?.carpoolLocation.city}, ${foundCarpool?.carpoolLocation.state} ${foundCarpool?.carpoolLocation.zipCode}`}</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Occurs Every</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">{carpoolDays}</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Time</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">{times}</div>
            </div>
        </div>
        {/*Carpools*/}
        <div className="w-8/12 flex-col justify-start items-start gap-5 flex">
            <div className="self-stretch justify-start items-center gap-5 inline-flex">
                <div className="text-black text-xl font-bold font-['Open Sans']">Carpools</div>
                <div className="px-6 py-2 bg-blue rounded-md justify-center items-center inline-flex">
                    <div className="text-center text-white text-base font-normal font-['Open Sans']">Run Optimizer</div>
                </div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-normal font-['Open Sans']">No pools yet - run the optimizer to create groupings!</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">All Members</div>
                <div className="flex-col justify-start items-start gap-2.5 flex">
                    <div className="text-gray text-xl font-normal font-['Open Sans']">Megan Wagner, Asha Vora, Tom Papa, Ben Aimasiko, David Pursell, 
                                                                                        Bijoy Vallamattam, Lorie Langan, Michael Li, Mary Rice, John Barry, 
                                                                                        Janice McAniff, Nadia Lin</div>
                </div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">All Riders</div>
                <div className="flex-col justify-start items-start gap-2.5 flex">
                    <div className="text-gray text-xl font-normal font-['Open Sans']">Lauren Wagner, Shivani Vora, Nathan Papa, Peter Aimasiko, Benedict Pursell, Annie Vallamattam, Grace Langan, Bryan Li, Thomas Rice, Patrick Barry, Alex McAniff, Nathan Lin</div>
                </div>
            </div>
        </div>
        <div className="py-10 flex-col justify-start items-start gap-5 flex">
            <div className="self-stretch justify-between items-start inline-flex">
                <div className="text-black text-xl font-bold font-['Open Sans']">My Information</div>
                <div className="text-blue text-xl font-bold font-['Open Sans']">Edit</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Location</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">{`${joinCarpoolData?.userLocation.address}, ${joinCarpoolData?.userLocation.city}, ${joinCarpoolData?.userLocation.state} ${joinCarpoolData?.userLocation.zipCode}`}</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Driving Availability</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">Monday, Wednesday, Friday</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Rider(s)</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">Child 2, 3</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Car Capacity</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">5</div>
            </div>
        </div>
        {/*My Pool*/}
        <div className="flex-col justify-start items-start gap-5 flex">
            <div className="justify-start items-start gap-5 inline-flex">
                <div className="text-black text-xl font-bold font-['Open Sans']">My Carpool</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Members</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">Megan Wagner, Asha Vora, Tom Papa</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Driving Days</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">?????</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Riders</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">Lauren Wagner, Shivani Vora, Nathan Papa</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Notes</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">Asha Vora - my child has a peanut allergy!<br/>Tom Papa - Nathan has an oversized backpack</div>
            </div>
        </div>
    </div>
    );
};

export default CarpoolPage;