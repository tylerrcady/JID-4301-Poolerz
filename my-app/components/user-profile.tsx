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
        <div className="h-[127.1vh] justify-start items-start gap-11 inline-flex">
            <div className="flex-col justify-start items-start gap-[1vw] inline-flex">
                {/*Profile Section*/}
                <div className="w-[40vw] h-[52vh] px-[2.7vw] py-[4.5vh] bg-white rounded-md shadow flex-col justify-start items-start gap-[4.5vh] flex">
                    <div className="justify-center items-center gap-7 inline-flex">
                        <div className="w-[29vw] text-blue text-2xl font-bold font-['Open Sans']">
                            My Profile
                        </div>
                        <div className="h-[4vh] relative flex items-center gap-2 cursor-pointer">
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
                        <div className="w-[33.7vw] left-0 top-0 absolute text-black text-2xl font-bold font-['Open Sans']">{name}</div>
                        <div className="w-[35vw] left-[-0vw] top-[5vh] absolute text-gray text-xl font-normal font-['Open Sans']">{email}</div>
                    </div>
                    <div className="self-stretch grow shrink basis-0 relative">
                        <div className="w-[33.7vw] left-0 top-0 absolute text-black text-xl font-bold font-['Open Sans']">
                            Role
                        </div>
                        <div className="w-[35vw] left-0 top-[5vh] absolute text-gray text-base font-normal font-['Open Sans']">
                            Parent
                        </div>
                    </div>
                    {/*<div className="w-[447.40px] text-[#e50606] text-base font-normal font-['Open Sans']">
                        <Button
                            text="Log Out"
                            type="logout"
                            onClick={() => "/"}
                        >
                            Log Out
                        </Button>
                    </div>*/}
                </div>
            </div>
            <div className="flex-col justify-center items-start gap-11 inline-flex">
                {/*Family Section*/}
                <div className="w-[40vw] h-[52vh] px-[2.7vw] py-[4.5vh] bg-white rounded-md shadow flex-col justify-start items-start gap-[4.5vh] flex">
                    <div className="h-[52vh] flex-col justify-start items-start gap-[1.5vw] flex">
                        <div className="justify-center items-center gap-7 inline-flex">
                            <div className="w-[29vw] text-blue text-2xl font-bold font-['Open Sans']">
                                Family
                            </div>
                            <div className="h-[4vh] relative flex items-center gap-2 cursor-pointer">
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
                {/*Availability Section*/}
                <div className="w-[40vw] h-[52vh] px-[2.7vw] py-[4.5vh] bg-white rounded-md shadow flex-col justify-start items-start gap-[4.5vh] flex">
                    <div className="flex-col justify-start items-start gap-[1.5vw] flex">
                        <div className="w-[29vw] text-blue text-2xl font-bold font-['Open Sans']">
                            Driving Availability
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;