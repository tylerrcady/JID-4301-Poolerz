"use client";

import React, { useCallback, useEffect, useState } from "react";
import Button from "@components/atoms/Button";
import { signIn, signOut } from "next-auth/react";
import AddModal from "./modals/add-modal";
import TextInput from "@components/atoms/text-input";
import NumberInput from "@components/atoms/number-input";
import AddIcon from "./icons/AddIcon";
import EditIcon from "./icons/EditIcon";

interface UserProfileProps {
    userId: string | undefined;
    name: string | null | undefined;
    email: string | null | undefined;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, name, email }) => {
    // state variables
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingFamily, setIsEditingFamily] = useState(false);
    const [isChildModalOpen, setIsChildModalOpen] = useState(false);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] =
        useState(false);
    const [newDay, setNewDay] = useState("");
    const [newTimeRange, setNewTimeRange] = useState("");
    const [newChildName, setNewChildName] = useState("");
    const [isEditingAvailability, setIsEditingAvailability] = useState(false);
    const [userFormData, setUserFormData] = useState<UserFormData | null>(null);
    const [userFormDataBackup, setUserFormDataBackup] = useState<UserFormData | null>(null);

    // GET user-form-data handler
    const handleUserFormGet = useCallback(async () => {
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
    }, [userId]);

    useEffect(() => {
        handleUserFormGet();
    }, [userId, handleUserFormGet]);

    const handleEditProfile = () => {
        if (!isEditingProfile) {
            setUserFormDataBackup(userFormData); // Save the current data as a backup
        }
        setIsEditingProfile(!isEditingProfile);
    };

    const handleEditFamily = () => {
        if (!isEditingFamily) {
            setUserFormDataBackup(userFormData);
        }
        setIsEditingFamily(!isEditingFamily);
    };

    const handleAddChild = () => {
        if (!userFormData) return;

        const updatedChildren = [
            ...userFormData.children,
            { name: newChildName },
        ];

        setUserFormData({
            ...userFormData,
            children: updatedChildren,
            numChildren: updatedChildren.length,
        });

        setNewChildName("");
        setIsChildModalOpen(false);
    };

    const handleEditAvailability = () => {
        if (!isEditingAvailability) {
            setUserFormDataBackup(userFormData);
        }
        setIsEditingAvailability(!isEditingAvailability);
    };

    const handleAddAvailability = () => {
        if (!newDay.trim() || !newTimeRange.trim()) {
            alert("Please provide valid day and time range.");
            return;
        }
        if (!userFormData) return;

        const updatedAvailabilities = [
            ...userFormData.availabilities,
            { day: newDay.trim(), timeRange: newTimeRange.trim() },
        ];

        setUserFormData({
            ...userFormData,
            availabilities: updatedAvailabilities,
        });

        setNewDay("");
        setNewTimeRange("");
        setIsAvailabilityModalOpen(false);
    };

    const handleCancel = () => {
        if (userFormDataBackup) {
            setUserFormData(userFormDataBackup); // Restore the backup
        }
        setIsEditingProfile(false);
        setIsEditingFamily(false);
        setIsEditingAvailability(false);
    };

    const handleSave = async () => {
        // setIsLoading(true);
        try {
            const response = await fetch(`/api/user-form-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    userFormData: { ...userFormData },
                }),
            });
            if (response.ok) {
                console.log("User data saved successfully!");
                if (isEditingFamily) {
                    setIsEditingFamily(false);
                }
                if (isEditingProfile) {
                    setIsEditingProfile(false);
                }
                if (isEditingAvailability) {
                    setIsEditingAvailability(false);
                }
                if (isChildModalOpen) {
                    setIsChildModalOpen(false);
                }
                if (isAvailabilityModalOpen) {
                    setIsAvailabilityModalOpen(false);
                }
                handleUserFormGet();
            } else {
                console.error("Failed to save data:", response.statusText);
            }
        } catch (error) {
            console.error("Error saving data:", error);
        } finally {
            // setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-start h-auto w-full bg-w p-10 gap-4">
            {/* Profile Pic + Uneditable Info */}
            <div className="flex flex-col items-center justify-center md:items-center md:w-1/3 gap-4">
                <div className="rounded-full bg-gray flex items-center justify-center">
                    <img
                        width={150}
                        height={150}
                        //src="/profile.svg"
                        src="/mask group.png"
                        alt="Profile"
                        className="w-150 h-150 rounded-full object-cover"
                    />
                </div>
                <div className="text-center md:text-left">
                    <div className="text-black text-xl font-bold">{name}</div>
                    <div className="text-gray font-normal">{email}</div>
                </div>
                <div className="py-1">
                    <Button
                        text="View My Carpools"
                        type="primary"
                        onClick={() => {
                            window.location.href = "/carpools";
                        }}
                    />
                </div>
                <button
                    className="text-red font-normal"
                    onClick={async () => {
                        if (userId) {
                            await signOut();
                        }
                    }}
                >
                    Log out
                </button>
            </div>
    
            {/* Profile and Family */}
            <div className="flex flex-col md:flex-col flex-1 gap-6">
                {/* Profile Section */}
                <div className="flex-1 w-4/6 h-auto p-5 bg-white rounded-md shadow flex-col gap-4 flex">
                    <div className="justify-between items-center flex flex-wrap gap-2">
                        <div className="text-blue text-2xl font-bold">Profile</div>
                        {isEditingProfile ? (
                            <div className="flex items-center gap-2 cursor-pointer">
                                <div className="flex gap-2">
                                    <Button
                                        text="Cancel"
                                        type="cancel"
                                        onClick={handleCancel}
                                    />
                                    <Button
                                        text="Save"
                                        type="primary"
                                        onClick={handleSave}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 cursor-pointer">
                                <Button
                                    text="Edit"
                                    type="secondary"
                                    icon={<EditIcon />}
                                    onClick={handleEditProfile}
                                />
                            </div>
                        )}
                    </div>
                    {userFormData && (
                        <>
                            <div className="break-all">
                                <div className="text-black text-xl font-bold">
                                    Address
                                </div>
                                <div className="text-gray text-base font-normal">
                                    {`${userFormData.location.address}, 
                                        ${userFormData.location.city}, 
                                        ${userFormData.location.state}, 
                                        ${userFormData.location.zipCode}`}
                                </div>
                            </div>
                            <div className="break-all">
                                <div className="text-black text-xl font-bold">
                                    Phone Number
                                </div>
                                <div className="text-gray text-base font-normal">
                                    {isEditingProfile ? (
                                        <TextInput
                                            currentValue={
                                                userFormData.phoneNumber || ""
                                            }
                                            onChange={(value) => {
                                                setUserFormData({
                                                    ...userFormData,
                                                    phoneNumber: value,
                                                });
                                            }}
                                            placeholder="Enter phone number"
                                        />
                                    ) : (
                                        userFormData.phoneNumber || "Not provided"
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
    
                {/* Family Section */}
                <div className="flex-1 w-4/6 h-auto p-5 bg-white rounded-md shadow flex-col gap-4 flex">
                    <div className="justify-between items-center flex flex-wrap gap-2">
                        <div className="text-blue text-2xl font-bold">Family</div>
                        {isEditingFamily ? (
                            <div className="flex items-center gap-2 cursor-pointer">
                                <div className="flex gap-2">
                                    <Button
                                        text="Cancel"
                                        type="cancel"
                                        onClick={handleCancel}
                                    />
                                    <Button
                                        text="Save"
                                        type="primary"
                                        onClick={handleSave}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 cursor-pointer">
                                <Button
                                    text="Edit"
                                    type="secondary"
                                    icon={<EditIcon />}
                                    onClick={handleEditFamily}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        {userFormData &&
                            userFormData.children.map((child, index) => (
                                <div
                                    key={`${child.name}-${index}`}
                                    className="flex flex-col items-start"
                                >
                                    <div className="text-gray text-xl">
                                        {isEditingFamily ? (
                                            <TextInput
                                                currentValue={child.name}
                                                onChange={(value) => {
                                                    const updatedChildren =
                                                        userFormData.children.map(
                                                            (c, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...c,
                                                                          name: value,
                                                                      }
                                                                    : c
                                                        );
                                                    setUserFormData({
                                                        ...userFormData,
                                                        children: updatedChildren,
                                                    });
                                                }}
                                                placeholder="Enter rider's name"
                                            />
                                        ) : (
                                            <span className="text-xl font-bold text-black">
                                                {child.name}
                                            </span>
                                        )}
                                    </div>
                                    {isEditingFamily && (
                                        <div className="w text-gray text-xl">
                                            <Button
                                                text="Remove"
                                                type="remove"
                                                onClick={() => {
                                                    const updatedChildren =
                                                        userFormData.children.filter(
                                                            (_, i) => i !== index
                                                        );
                                                    setUserFormData({
                                                        ...userFormData,
                                                        children: updatedChildren,
                                                        numChildren:
                                                            updatedChildren.length,
                                                    });
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                    {isEditingFamily && (
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Button
                                icon={<AddIcon strokeColor="#FFFFFF" />}
                                text="Add Rider"
                                type="primary"
                                onClick={() => setIsChildModalOpen(true)}
                            />
                        </div>
                    )}
                    <AddModal
                        isOpen={isChildModalOpen}
                        text="Add Child"
                        onClose={() => setIsChildModalOpen(false)}
                    >
                        <div className="flex flex-col gap-4">
                            <TextInput
                                currentValue={newChildName}
                                onChange={setNewChildName}
                                placeholder="Enter child's name"
                            />
                            <div className="flex w-2/5 justify-start gap-4">
                                <Button
                                    text="Cancel"
                                    type="cancel"
                                    onClick={() => setIsChildModalOpen(false)}
                                />
                                <Button
                                    text="Save"
                                    type="primary"
                                    onClick={handleAddChild}
                                />
                            </div>
                        </div>
                    </AddModal>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
