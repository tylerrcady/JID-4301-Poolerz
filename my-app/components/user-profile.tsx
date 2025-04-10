"use client";

import React, { useCallback, useEffect, useState } from "react";
import Button from "@components/atoms/Button";
import { signIn, signOut } from "next-auth/react";
import AddModal from "./modals/add-modal";
import TextInput from "@components/atoms/text-input";
import NumberInput from "@components/atoms/number-input";
import AddIcon from "./icons/AddIcon";
import EditIcon from "./icons/EditIcon";
import Loading from "@components/icons/Loading";

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
    const [userFormDataBackup, setUserFormDataBackup] =
        useState<UserFormData | null>(null);
    const [userCarpoolData, setUserCarpoolData] = useState<any[]>([]);
    const [carpoolDetails, setCarpoolDetails] = useState<{[key: string]: any}>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isCarpoolLoading, setIsCarpoolLoading] = useState(true);

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
                        ? data.userFormData[0].userFormData
                        : ""
                );
            } else {
                console.error("Failed to fetch data:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        handleUserFormGet();
    }, [userId, handleUserFormGet]);

    // Extract fetchCarpoolData into a separate function
    const fetchCarpoolData = async () => {
        if (!userId) return;
        
        setIsCarpoolLoading(true);
        try {
            // Fetch user's carpool data
            const response = await fetch(`/api/join-carpool-data?userId=${userId}`);
            const data = await response.json();
            const joinedCarpools = data?.createCarpoolData?.[0]?.userData?.carpools || [];
            setUserCarpoolData(joinedCarpools);

            // Fetch details for each carpool
            const carpoolPromises = joinedCarpools.map(async (carpool: any) => {
                const carpoolResponse = await fetch(`/api/create-carpool-data?carpoolId=${carpool.carpoolId}`);
                const carpoolData = await carpoolResponse.json();
                console.log(`Carpool Details for ${carpool.carpoolId}:`, carpoolData);
                return {
                    id: carpool.carpoolId,
                    data: carpoolData.createCarpoolData?.[0] || {},
                };
            });

            const carpoolResults = await Promise.all(carpoolPromises);
            const carpoolDetailsMap = carpoolResults.reduce((acc, curr) => {
                acc[curr.id] = curr.data;
                return acc;
            }, {});
            setCarpoolDetails(carpoolDetailsMap);
        } catch (error) {
            console.error("Error fetching carpool data:", error);
        } finally {
            setIsCarpoolLoading(false);
        }
    };

    useEffect(() => {
        fetchCarpoolData();
    }, [userId]);

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
        try {
            // First identify deleted children by comparing with backup
            const deletedChildren = userFormDataBackup?.children.filter(backupChild => 
                !userFormData?.children.some(currentChild => currentChild.name === backupChild.name)
            ) || [];

            // Get the list of children whose names have changed
            const changedChildren = userFormData?.children.map((child, index) => {
                const originalChild = userFormDataBackup?.children[index];
                if (originalChild && originalChild.name !== child.name) {
                    return {
                        oldName: originalChild.name,
                        newName: child.name
                    };
                }
                return null;
            }).filter(change => change !== null);

            // Save user form data
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

            if (!response.ok) {
                console.error("Failed to save user data:", response.statusText);
                return;
            }

            // Process deleted children
            if (deletedChildren.length > 0) {
                // Find all carpools where any of the deleted children are riders
                const carpoolsToUpdate = userCarpoolData.filter(carpool => 
                    deletedChildren.some(child => carpool.riders.includes(child.name))
                );

                // Update each carpool
                for (const carpool of carpoolsToUpdate) {
                    const carpoolDetail = carpoolDetails[carpool.carpoolId];
                    if (!carpoolDetail) continue;

                    const updatedRiders = carpool.riders.filter((rider: string) => 
                        !deletedChildren.some(child => child.name === rider)
                    );

                    // Update the carpool with the removed riders
                    await fetch("/api/update-carpool", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            carpoolId: carpool.carpoolId,
                            carpoolData: {
                                ...carpoolDetail.createCarpoolData,
                                riders: updatedRiders
                            }
                        }),
                    });

                    // Update the user's carpool data
                    await fetch("/api/update-user-carpool", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            userId,
                            carpoolId: carpool.carpoolId,
                            carpoolData: {
                                ...carpool,
                                riders: updatedRiders
                            }
                        }),
                    });
                }
            }

            // If any children's names changed, update their names in the carpools
            if (changedChildren && changedChildren.length > 0) {
                // Get all carpools that need updating
                const carpoolsToUpdate = userCarpoolData.filter(carpool => 
                    changedChildren.some(change => 
                        carpool.riders.includes(change.oldName)
                    )
                );

                // Update each carpool
                for (const carpool of carpoolsToUpdate) {
                    const carpoolDetail = carpoolDetails[carpool.carpoolId];
                    if (!carpoolDetail) continue;

                    const updatedRiders = carpool.riders.map((rider: string) => {
                        const change = changedChildren.find(c => c.oldName === rider);
                        return change ? change.newName : rider;
                    });

                    // Update the carpool with the new rider names
                    await fetch("/api/update-carpool", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            carpoolId: carpool.carpoolId,
                            carpoolData: {
                                ...carpoolDetail.createCarpoolData,
                                riders: updatedRiders
                            }
                        }),
                    });

                    // Update the user's carpool data
                    await fetch("/api/update-user-carpool", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            userId,
                            carpoolId: carpool.carpoolId,
                            carpoolData: {
                                ...carpool,
                                riders: updatedRiders
                            }
                        }),
                    });
                }
            }

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
            
            // Refetch both user form data and carpool data after saving
            await Promise.all([
                handleUserFormGet(),
                fetchCarpoolData()
            ]);
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    return (
        <div className="flex flex-col md:flex-row justify-center items-start w-full bg-w p-4 md:p-10 gap-5">
            {/* Left section - profile info */}
            <div className="flex flex-col items-center justify-center w-full md:w-1/3 gap-4">
                <div className="rounded-full bg-gray flex items-center justify-center">
                    <img
                        width={150}
                        height={150}
                        src="/mask group.png"
                        alt="Profile"
                        className="w-150 h-150 rounded-full object-cover"
                    />
                </div>
                <div className="text-center">
                    <div className="text-black text-xl font-bold">{name}</div>
                    <div className="text-gray font-normal">{email}</div>
                </div>
                <div className="py-1 w-full max-w-[200px]">
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

            {/* Right section - cards */}
            <div className="flex flex-col w-full md:w-1/2 gap-6">
                {/* Profile Section */}
                <div className="flex-1 w-full h-auto p-5 bg-white rounded-md shadow flex-col gap-4 flex">
                    <div className="justify-between items-center flex flex-wrap gap-2">
                        <div className="text-blue text-2xl font-bold">
                            Profile
                        </div>
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
                    {isLoading || isCarpoolLoading ? (
                        <div className="flex justify-center items-center">
                            <Loading />
                        </div>
                    ) : (
                        userFormData && (
                            <>
                                <div className="break-all">
                                    <div className="text-black text-xl font-bold">
                                        Address
                                    </div>
                                    <div className="text-gray text-base font-normal">
                                        {isEditingProfile ? (
                                            <div className="flex flex-col gap-2">
                                                <TextInput
                                                    currentValue={userFormData.location.address}
                                                    onChange={(value) => {
                                                        setUserFormData({
                                                            ...userFormData,
                                                            location: {
                                                                ...userFormData.location,
                                                                address: value,
                                                            },
                                                        });
                                                    }}
                                                    placeholder="Enter street address"
                                                />
                                                <TextInput
                                                    currentValue={userFormData.location.city}
                                                    onChange={(value) => {
                                                        setUserFormData({
                                                            ...userFormData,
                                                            location: {
                                                                ...userFormData.location,
                                                                city: value,
                                                            },
                                                        });
                                                    }}
                                                    placeholder="Enter city"
                                                />
                                                <TextInput
                                                    currentValue={userFormData.location.state}
                                                    onChange={(value) => {
                                                        setUserFormData({
                                                            ...userFormData,
                                                            location: {
                                                                ...userFormData.location,
                                                                state: value,
                                                            },
                                                        });
                                                    }}
                                                    placeholder="Enter state"
                                                />
                                                <TextInput
                                                    currentValue={userFormData.location.zipCode}
                                                    onChange={(value) => {
                                                        setUserFormData({
                                                            ...userFormData,
                                                            location: {
                                                                ...userFormData.location,
                                                                zipCode: value,
                                                            },
                                                        });
                                                    }}
                                                    placeholder="Enter ZIP code"
                                                />
                                            </div>
                                        ) : (
                                            `${userFormData.location.address}, 
                                            ${userFormData.location.city}, 
                                            ${userFormData.location.state}, 
                                            ${userFormData.location.zipCode}`
                                        )}
                                    </div>
                                </div>
                                <div className="break-all">
                                    <div className="text-black text-xl font-bold">
                                        Phone Number
                                    </div>
                                    <div className="text-gray text-base font-normal">
                                        {isEditingProfile ? (
                                            <TextInput
                                                currentValue={userFormData.phoneNumber || ""}
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
                        )
                    )}
                </div>

                {/* Riders Section */}
                <div className="flex-1 w-full h-auto p-5 bg-white rounded-md shadow flex-col gap-4 flex">
                    <div className="justify-between items-center flex flex-wrap gap-2">
                        <div className="text-blue text-2xl font-bold">
                            Riders
                        </div>
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
                        {isLoading || isCarpoolLoading ? (
                            <div className="flex justify-center items-center">
                                <Loading />
                            </div>
                        ) : (
                            userFormData && userCarpoolData && carpoolDetails && (
                                <div>
                                    {userFormData.children.map((child, index) => (
                                        <div key={`child-${index}`} className="flex flex-col items-start w-full">
                                            <div className="text-gray text-xl w-full">
                                                {isEditingFamily ? (
                                                    <div key={`child-input-container-${index}`}>
                                                        <TextInput
                                                            currentValue={child.name}
                                                            onChange={(value) => {
                                                                setUserFormData({
                                                                    ...userFormData,
                                                                    children: userFormData.children.map((c, i) =>
                                                                        i === index ? { ...c, name: value } : c
                                                                    )
                                                                });
                                                            }}
                                                            placeholder="Enter rider's name"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-xl font-bold text-black">
                                                            {child.name}
                                                        </span>
                                                        {/* Display associated carpools */}
                                                        <div className="ml-4 mt-2 mb-6">
                                                            {userCarpoolData
                                                                .filter(carpool => carpool.riders.includes(child.name))
                                                                .map(carpool => {
                                                                    const carpoolInfo = carpoolDetails[carpool.carpoolId];
                                                                    return carpoolInfo ? (
                                                                        <div 
                                                                            key={carpool.carpoolId}
                                                                            className="text-base text-gray mb-1"
                                                                        >
                                                                            {carpoolInfo.createCarpoolData.carpoolName}
                                                                        </div>
                                                                    ) : null;
                                                                })
                                                            }
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            {isEditingFamily && (
                                                <div className="w text-gray text-xl">
                                                    <Button
                                                        text="Remove"
                                                        type="remove"
                                                        onClick={() => {
                                                            const updatedChildren = userFormData.children.filter((_, i) => i !== index);
                                                            setUserFormData({
                                                                ...userFormData,
                                                                children: updatedChildren,
                                                                numChildren: updatedChildren.length,
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
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