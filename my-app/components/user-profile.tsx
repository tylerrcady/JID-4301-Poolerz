"use client";

import React, { useCallback, useEffect, useState } from "react";
import Button from "@components/atoms/Button";
import EditIcon from "@components/icons/EditIcon";
import AddIcon from "@components/icons/AddIcon";

interface UserProfileProps {
    userId: string | undefined;
    name: string | null | undefined;
    email: string | null | undefined;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, name, email }) => {
    // state variables
    const [userFormData, setUserFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // GET user-form-data handler
    const handleUserFormGet = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/user-form-data?userId=${userId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                setUserFormData(
                    data && data.userFormData
                        ? data.userFormData.userFormData
                        : ""
                ); // update variable with returned data if any exists
            } else {
                console.error("Failed to fetch data:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setIsLoading(false);
    }, [userId]);

    // get userFormData handler/caller useEffect
    useEffect(() => {
        handleUserFormGet();
    }, [userId, handleUserFormGet]);

    return (
        /*        
            <div className="flex items-center justify-center flex-col h-full w-full bg-w p-5 overflow-y-auto">
            <h1>profile for {userId}</h1>
            {!isLoading && <span>{userFormData}</span>}
            {isLoading && <span>loading</span>}
        </div>
 */
        <div className="h-[698px] justify-start items-start gap-11 inline-flex">
            <div className="flex-col justify-start items-start gap-[35px] inline-flex">
                <div className="w-[575px] h-[392px] px-[34px] py-[25px] bg-white rounded-md shadow flex-col justify-start items-start gap-[25px] flex">
                    <div className="justify-center items-center gap-7 inline-flex">
                        <div className="w-[426px] text-blue text-2xl font-bold font-['Open Sans']">
                            My Profile
                        </div>
                        <div className="h-[22px] relative flex items-center gap-2 cursor-pointer">
                            <Button
                                icon={<EditIcon />}
                                text="Edit"
                                type="secondary"
                                onClick={() => "/"}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>
                    <div className="self-stretch grow shrink basis-0 relative">
                        <div className="w-[431.81px] left-0 top-0 absolute text-black text-2xl font-bold font-['Open Sans']">
                            {name}
                        </div>
                        <div className="w-[447.40px] left-[-0px] top-[43.40px] absolute text-gray text-xl font-normal font-['Open Sans']">
                            {email}
                        </div>
                    </div>
                    <div className="self-stretch grow shrink basis-0 relative">
                        <div className="w-[431.81px] left-0 top-0 absolute text-black text-xl font-bold font-['Open Sans']">
                            Role
                        </div>
                        <div className="w-[447.40px] left-0 top-[31px] absolute text-gray text-base font-normal font-['Open Sans']">
                            Parent
                        </div>
                    </div>
                    <div className="w-[447.40px] text-[#e50606] text-base font-normal font-['Open Sans']">
                        Log out
                    </div>
                    <div className="w-[447.40px] text-[#e50606] text-base font-normal font-['Open Sans']">
                        <Button
                            text="Log Out"
                            type="logout"
                            onClick={() => "/"}
                        >
                            Log Out
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex-col justify-center items-start gap-11 inline-flex">
                <div className="w-[575px] h-[327px] px-[33.60px] py-[25.20px] bg-white rounded-md shadow flex-col justify-start items-start gap-[25.20px] flex">
                    <div className="h-[286.60px] flex-col justify-start items-start gap-[19px] flex">
                        <div className="justify-center items-center gap-7 inline-flex">
                            <div className="w-[399px] text-blue text-2xl font-bold font-['Open Sans']">
                                Family
                            </div>
                            <div className="h-[22px] relative flex items-center gap-2 cursor-pointer">
                                <Button
                                    icon={<AddIcon />}
                                    text="Add"
                                    type="secondary"
                                    onClick={() => "/"}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                        <div className="w-[476.20px] h-[107.80px] relative">
                            <div className="w-[431.81px] left-0 top-0 absolute text-black text-2xl font-bold font-['Open Sans']">
                                Child A
                            </div>
                            <div className="w-[447.80px] h-16 left-[28.40px] top-[43.80px] absolute flex-col justify-start items-start gap-2.5 inline-flex">
                                <div className="self-stretch text-gray text-xl font-normal font-['Open Sans']">
                                    Centerville Choir Group
                                </div>
                                <div className="self-stretch text-gray text-xl font-normal font-['Open Sans']">
                                    Fairport High Cross Country
                                </div>
                            </div>
                        </div>
                        <div className="h-[107.80px] relative">
                            <div className="w-[431.81px] left-0 top-0 absolute text-black text-2xl font-bold font-['Open Sans']">
                                Child B
                            </div>
                            <div className="w-[447.80px] h-16 left-[28.40px] top-[43.80px] absolute" />
                        </div>
                    </div>
                </div>
                <div className="w-[575px] h-[327px] px-[33.60px] py-[25.20px] bg-white rounded-md shadow flex-col justify-start items-start gap-[25.20px] flex">
                    <div className="flex-col justify-start items-start gap-[19px] flex">
                        <div className="w-[426px] text-blue text-2xl font-bold font-['Open Sans']">
                            Driving Availability
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
