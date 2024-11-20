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
    const [userFormData, setUserFormData] = useState<UserFormData | null>(null);
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
        // do not change the first div at all
        <div className="flex items-center flex-col h-full w-full bg-w p-5 overflow-y-auto gap-4">
            {/*Profile Section*/}
            <div className="w-3/4 h-auto p-5 bg-white rounded-md shadow flex-col gap-4 flex">
                <div className="justify-between items-center gap-7 flex">
                    <div className="text-blue text-2xl font-bold">
                        My Profile
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer">
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
                <div className="break-all">
                    <div className="text-black text-2xl font-bold">{name}</div>
                    <div className="text-gray text-xl font-normal">{email}</div>
                </div>
                <div className="break-all">
                    <div className="text-black text-xl font-bold">Role</div>
                    <div className="text-gray text-base font-normal">
                        Parent
                    </div>
                </div>
                {userFormData && (
                    <div>
                        <p>Number children: {userFormData.numChildren}</p>
                        <p>Car capacity: {userFormData.carCapacity}</p>
                    </div>
                )}
            </div>
            {/*Family Section*/}
            <div className="w-3/4 h-auto p-5 bg-white rounded-md shadow flex-col gap-4 flex">
                <div className="justify-between items-center gap-7 flex">
                    <div className="text-blue text-2xl font-bold">Family</div>
                    <div className="relative flex items-center gap-2 cursor-pointer">
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
                {/*no children info has been converted to vhvw bc I'll need to take out this section anyway after we fix the form */}
                <div>
                    <div className="text-black text-2xl font-bold">Child A</div>
                    <div className="flex-col justify-start items-start gap-2.5">
                        <div className="text-gray text-xl font-normal">
                            Centerville Choir Group
                        </div>
                        <div className="text-gray text-xl font-normal">
                            Fairport High Cross Country
                        </div>
                    </div>
                </div>
                <div>
                    <div className="text-black text-2xl font-bold">Child B</div>
                </div>
            </div>
            {/*Availability Section*/}
            <div className="w-3/4 h-auto p-5 bg-white rounded-md shadow flex-col gap-4 flex">
                <div className="flex-col justify-start items-start flex">
                    <div className="text-blue text-2xl font-bold">
                        Driving Availability
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
