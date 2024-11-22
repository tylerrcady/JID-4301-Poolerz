"use client";

import React, { useCallback, useEffect, useState } from "react";
import Button from "@components/atoms/Button";
import EditIcon from "@components/icons/EditIcon";
import AddIcon from "@components/icons/AddIcon";

import TextInput from "@components/atoms/text-input";
import NumberInput from "@components/atoms/number-input";
import BackButton from "@components/atoms/back-button";

interface UserProfileProps {
    userId: string | undefined;
    name: string | null | undefined;
    email: string | null | undefined;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, name, email }) => {
    // state variables
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingFamily, setIsEditingFamily] = useState(false);
    const [isEditingAvailability, setIsEditingAvailability] = useState(false);
    const [userFormData, setUserFormData] = useState<UserFormData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: name || "",
        email: email || "",
    });

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

    const handleEditProfile = () => {
        setIsEditingProfile(!isEditingProfile);
    };

    const handleEditFamily = () => {
        setIsEditingFamily(!isEditingFamily);
    };

    const handleEditAvailability = () => {
        setIsEditingAvailability(!isEditingAvailability);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/user-form-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    userFormData:  { ...userFormData, ...formData },
                }),
            });
            if (response.ok) {
                console.log('User data saved successfully!');
                if (isEditingFamily) {
                    setIsEditingFamily(false);
                }
                if (isEditingProfile) {
                    setIsEditingProfile(false);
                }if (isEditingAvailability) {
                    setIsEditingAvailability(false);
                }
                handleUserFormGet();
            } else {
                console.error("Failed to save data:", response.statusText);
            }
        } catch (error) {
            console.error("Error saving data:", error);
        } finally {
        setIsLoading(false);
        }
    };


    return (
        // do not change the first div at all
        <div className="flex items-center flex-col h-full w-full bg-w p-5 overflow-y-auto gap-4">
            <div className="flex w-full justify-center gap-6">
                {/*Left Side*/}
                <div className="flex flex-col gap-4 w-2/5">
                    {/*Profile Section*/}
                    <div className="h-auto p-6 bg-white rounded-md shadow flex-col gap-4 flex">
                        <div className="justify-between items-center gap-7 flex">
                            <div className="text-blue text-2xl font-bold">Family</div>
                            {isEditingProfile ? (
                                <div className="flex items-center gap-2 cursor-pointer">   
                                    <div className="flex gap-6">
                                        <Button text="Cancel" type="cancel" onClick={handleEditProfile} />
                                        <Button text="Save" type="secondary" onClick={handleSave} />
                                    </div>
                                </div> 
                            ) : (
                                <div className="flex items-center gap-2 cursor-pointer">
                                     <Button text="Edit" type="secondary" onClick={handleEditProfile} />
                                </div>
                            )}
                        </div>           
                        <div className="break-all">
                            <div className="text-black text-2xl font-bold">{name}</div>
                            <div className="text-gray text-xl font-normal">{email}</div>
                        </div>
                        {userFormData && (
                            <div className="break-all">
                                <div className="text-black text-xl font-bold">Number of Children</div>
                                <div className="text-gray text-base font-normal">{userFormData.numChildren}</div>
                            </div>
                        )}
                        {userFormData && (
                            <div className="break-all">
                                <div className="text-black text-xl font-bold">Car Capacity</div>
                                <div className="text-gray text-base font-normal">
                                {isEditingProfile ? (
                                            <NumberInput
                                                currentValue={userFormData.carCapacity}
                                                onChange={(value) => {
                                                    setUserFormData({ ...userFormData, carCapacity: value });
                                                }}  
                                                placeholder="Enter car capacity"
                                                min={0}
                                                max={10}
                                                step={1}
                                            />
                                        ) : (
                                            <p>{userFormData.carCapacity}</p>
                                        )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/*Right Side */}  
                <div className="flex flex-col gap-6 w-2/5">
                    {/*Family Section*/}
                    <div className="h-auto p-6 bg-white rounded-md shadow flex-col gap-4 flex">
                        <div className="justify-between items-center gap-7 flex">
                            <div className="text-blue text-2xl font-bold">Family</div>
                            {isEditingFamily ? (
                                <div className="flex items-center gap-2 cursor-pointer">   
                                    <div className="flex gap-6">
                                        <Button text="Cancel" type="cancel" onClick={handleEditFamily} />
                                        <Button text="Save" type="secondary" onClick={handleSave} />
                                    </div>
                                </div> 
                            ) : (
                                <div className="flex items-center gap-2 cursor-pointer">
                                     <Button text="Edit" type="secondary" onClick={handleEditFamily} />
                                </div>
                            )}
                        </div>
                        <div>
                            {userFormData && userFormData.children.map((child, index) => (
                                <div key={index} className="flex flex-col gap-4">
                                    <div className="text-black text-xl font-bold">
                                        {isEditingFamily ? (
                                            <TextInput
                                                currentValue={child.name}
                                                onChange={(value) => {
                                                    const updatedChildren = [...userFormData.children];
                                                    updatedChildren[index].name = value;
                                                    setUserFormData({ ...userFormData, children: updatedChildren });
                                                }}  
                                                placeholder="Enter child's name"
                                            />
                                        ) : (
                                            <p>{child.name}</p>
                                        )}
                                    </div>
                                    {/*<div className="flex-col justify-start items-start gap-2.5">
                                        <div className="text-gray text-xl font-normal">
                                            Centerville Choir Group
                                        </div>
                                        <div className="text-gray text-xl font-normal">
                                            Fairport High Cross Country
                                        </div>
                                    </div>*/}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/*Availability Section*/}
                    <div className="h-auto p-6 bg-white rounded-md shadow flex-col gap-4 flex">
                        <div className="justify-between items-center gap-7 flex">
                            <div className="text-blue text-2xl font-bold">Driving Availability</div>
                            {isEditingAvailability ? (
                                <div className="flex items-center gap-2 cursor-pointer">   
                                    <div className="flex gap-6">
                                        <Button text="Cancel" type="cancel" onClick={handleEditAvailability} />
                                        <Button text="Save" type="secondary" onClick={handleSave} />
                                    </div>
                                </div> 
                            ) : (
                                <div className="flex items-center gap-2 cursor-pointer">
                                     <Button text="Edit" type="secondary" onClick={handleEditAvailability} />
                                </div>
                            )}
                        </div>
                        <div className="w-[447.80px] flex-col justify-start items-start gap-2.5 inline-flex">
                        {isEditingAvailability ? (
                            userFormData?.availabilities?.map((availability, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <TextInput
                                        currentValue={availability.day}
                                        onChange={(value) => {
                                            const updatedAvailabilities = [...userFormData.availabilities];
                                            updatedAvailabilities[index].day = value;
                                            setUserFormData({ ...userFormData, availabilities: updatedAvailabilities });
                                        }}
                                        placeholder="Enter day"
                                    />
                                    <TextInput
                                        currentValue={availability.timeRange}
                                        onChange={(value) => {
                                            const updatedAvailabilities = [...userFormData.availabilities];
                                            updatedAvailabilities[index].timeRange = value;
                                            setUserFormData({ ...userFormData, availabilities: updatedAvailabilities });
                                        }}
                                        placeholder="Enter hours"
                                    />
                                </div>
                            ))
                        ) : (
                            userFormData?.availabilities?.map((availability, index) => (
                                <div key={index} className="self-stretch justify-start items-center gap-[23px] inline-flex">
                                    <div className="w-[103px] text-black text-2xl font-bold">{availability.day}</div>
                                    <div className="grow shrink basis-0 text-[#666666] text-xl font-normal">{availability.timeRange}</div>
                                </div>
                            ))
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
