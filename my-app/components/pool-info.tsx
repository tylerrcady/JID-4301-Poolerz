"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AddModal from "@/components/modals/add-modal";
import Button from "@/components/atoms/Button";
import JoinCarpool from "./join-carpool";


interface PoolInfoProps {
  userId: string | undefined;
}

interface CarpoolData {
    carpoolID: string | undefined;
    createCarpoolData: CreateCarpoolData | undefined; 
}

// will tweak and remove
interface CarpoolDoc {
  carpoolID: string;
  createCarpoolData: {
    creatorId: string;
    carpoolName: string;
    carpoolLocation: {
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
    };
    carpoolDays: number[]; // stored as integers, e.g. [1,3,5]
    notes: string; // e.g. "Times: 08:00. Additional Notes: Some note"
    carpoolMembers: string[];
  };
}

const CarpoolPage: React.FC<PoolInfoProps> = ({ userId }) => {
    const [createCarpoolData, setCreateCarpoolData] = useState<CarpoolData[]>([]);
    const [joinCarpoolData, setJoinCarpoolData] = useState<JoinCarpoolData | null>(null);

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
                setCreateCarpoolData(
                    data?.createCarpoolData
                );
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [userId]);

    // get createFormData handler/caller effect
    useEffect(() => {
        handleCarpoolsGet();
        console.log(createCarpoolData);
    }, [userId, handleCarpoolsGet]);

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
                setJoinCarpoolData(
                    data?.userData
                )
            } else {
                console.error("Failed to fetch data:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [userId])
    return (
        <div className="flex flex-col w-8/12 mx-auto p-10 gap-6 rounded-md shadow-lg">
        {/*Title Card*/}
        <div className="flex-col justify-start items-start gap-5 flex">
            <div className="text-black text-2xl font-bold font-['Open Sans']">{createCarpoolData[0]?.createCarpoolData?.carpoolName}</div>
            <div className="self-stretch justify-start items-start inline-flex gap-10">
                <div className="text-gray text-xl font-normal font-['Open Sans']">Closes on March 4</div>
                <div className="text-blue text-xl font-bold font-['Open Sans']">Close Now</div>
            </div>
        </div>
        {/*Carpool Info*/}
        <div className="flex-col justify-start items-start gap-5 flex">
            <div className="w-8/12 justify-between items-start inline-flex">
                <div className="text-black text-xl font-bold font-['Open Sans']">Carpool Information</div>
                <div className="text-blue text-xl font-bold font-['Open Sans']">Edit</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Location</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">Peak to Peak High School, 78 Emma Street, Lafayette CO, 80234</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Occurs Every</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">Monday, Wednesday, Thursday</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Time</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">3-5pm</div>
            </div>
        </div>
        {/*Carpools*/}
        <div className=" w-8/12 flex-col justify-start items-start gap-5 flex">
            <div className="justify-start items-start gap-5 inline-flex">
                <div className="text-black text-xl font-bold font-['Open Sans']">Carpools</div>
            </div>
            <div className="px-6 py-3 bg-blue rounded-md justify-center items-center inline-flex">
                <div className="text-center text-white text-base font-normal font-['Open Sans']">Run Optimizer</div>
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
        <div className="flex-col justify-start items-start gap-5 flex">
            <div className="justify-between items-start inline-flex">
                <div className="text-black text-xl font-bold font-['Open Sans']">My Information</div>
                <div className="text-blue text-xl font-bold font-['Open Sans']">Edit</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Location</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">901 Sander Street, Lafayette CO, 80233</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Driving Availability</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">Monday, Wednesay, Thursday</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Rider(s)</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">Child 2, 3</div>
            </div>
            <div className="flex-col justify-start items-start gap-2.5 flex">
                <div className="text-gray text-xl font-bold font-['Open Sans']">Car Capacity</div>
                <div className="text-gray text-xl font-normal font-['Open Sans']">6</div>
            </div>
        </div>
        {/*My Pool*/}
        <div className="flex-col justify-start items-start gap-5 flex">
            <div className="justify-start items-start gap-5 inline-flex">
                <div className="text-black text-xl font-bold font-['Open Sans']">My Pool</div>
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
                <div className="text-gray text-xl font-normal font-['Open Sans']">Asha Vora - my child has a peanut allergy!<br/>Tom Papa - Nathan has a big ass backpack</div>
            </div>
        </div>
    </div>
    );
};

export default CarpoolPage;