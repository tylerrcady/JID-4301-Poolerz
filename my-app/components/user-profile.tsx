"use client";

import React, { useCallback, useEffect, useState } from "react";
import Button from "@components/atoms/Button";
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import AddModal from "./modals/add-modal";
import TextInput from "@components/atoms/text-input";
import NumberInput from "@components/atoms/number-input";
import AddIcon from "./icons/AddIcon";
=======
=======
>>>>>>> Stashed changes

import TextInput from "@components/atoms/text-input";
import NumberInput from "@components/atoms/number-input";

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

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
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
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

    // get userFormData handler/caller useEffect
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
          { day: newDay.trim(), 
            timeRange: newTimeRange.trim() },
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                    userFormData: { ...userFormData },
=======
                    userFormData:  { ...userFormData,},
>>>>>>> Stashed changes
=======
                    userFormData:  { ...userFormData,},
>>>>>>> Stashed changes
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
        // do not change the first div at all
        <div className="flex items-center flex-col h-auto w-full bg-w p-5 overflow-y-auto gap-4">
            {/*Profile Section*/}
            <div className="w-3/4 h-auto p-5 bg-white rounded-md shadow flex-col gap-4 flex">
                <div className="justify-between items-center flex flex-wrap">
                    <div className="text-blue text-2xl font-bold">Profile</div>
                    {isEditingProfile ? (
                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="flex gap-6">
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
                                onClick={handleEditProfile}
                            />
                        </div>
                    )}
                </div>
                <div className="break-all">
                    <div className="text-black text-2xl font-bold">{name}</div>
                    <div className="text-gray font-normal">{email}</div>
                </div>
                {userFormData && (
                    <div className="break-all">
                        <div className="text-black text-xl font-bold">
                            Number of Children
                        </div>
                        <div className="text-gray text-base font-normal">
                            {userFormData.numChildren}
                        </div>
                    </div>
                )}
                {userFormData && (
                    <div className="break-all">
                        <div className="text-black text-xl font-bold">
                            Car Capacity
                        </div>
                        <div className="w-1/5 text-gray text-base font-normal">
                            {isEditingProfile ? (
                                <NumberInput
                                    currentValue={userFormData.carCapacity}
                                    onChange={(value) => {
                                        setUserFormData({
                                            ...userFormData,
                                            carCapacity: isNaN(value)
                                                ? 0
                                                : value,
                                        });
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
            {/*Right Side */}
            {/*Family Section*/}
            <div className="w-3/4 h-auto p-5 bg-white rounded-md shadow flex-col gap-4 flex">
                <div className="justify-between items-center flex flex-wrap">
                    <div className="text-blue text-2xl font-bold">Family</div>
                    {isEditingFamily ? (
                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="flex gap-6">
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
                                onClick={handleEditFamily}
                            />
                        </div>
                    )}
                </div>
                <div>
                    {userFormData &&
                        userFormData.children.map((child, index) => (
                            <div key={index} className="flex items-center justify-start gap-8">
                                <div className="w-1/5 text-gray text-xl">
                                    {isEditingFamily ? (
                                        <TextInput
                                            currentValue={child.name}
                                            onChange={(value) => {
                                                const updatedChildren = [
                                                    ...userFormData.children,
                                                ];
                                                updatedChildren[index].name =
                                                    value;
                                                setUserFormData({
                                                    ...userFormData,
                                                    children: updatedChildren,
                                                });
                                            }}
                                            placeholder="Enter child's name"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-black">
                                            {child.name}
                                        </span>
                                    )}
                                </div>
                                {isEditingFamily && (
                                    <div className="w-1/12 text-gray text-xl">
                                    <Button
                                        text="Remove"
                                        type="remove"
                                        onClick={() => {
                                            const updatedChildren = userFormData.children.filter(
                                                (_, i) => i !== index
                                            );
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
                {isEditingFamily && (
                <div className="w-1/5 flex items-center gap-2 cursor-pointer">
                <Button
                    icon={<AddIcon
                        strokeColor="#FFFFFF"
                    />}
                    text="Add Child"
                    type="primary"
                    onClick={() => setIsChildModalOpen(true)}
                />
            </div>
            )}
            {/* Modal for adding a child */}
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
            {/*Availability Section*/}
            <div className="w-3/4 h-auto p-5 bg-white rounded-md shadow flex-col gap-4 flex">
                <div className="justify-between items-center flex flex-wrap">
                    <div className="text-blue text-2xl font-bold">
                        Driving Availability
                    </div>
                    {isEditingAvailability ? (
                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="flex gap-6">
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
                                onClick={handleEditAvailability}
                            />
                        </div>
                    )}
                </div>
                <div className="w-full flex-col justify-start items-start gap-2.5 inline-flex">
                    {isEditingAvailability
                        ? userFormData?.availabilities?.map(
                            (availability, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 text-xl"
                                >
                                <TextInput
                                        currentValue={availability.day}
                                        onChange={(value) => {
                                            const updatedAvailabilities = [
                                                ...userFormData.availabilities,
                                            ];
                                            updatedAvailabilities[index].day =
                                                value;
                                            setUserFormData({
                                                ...userFormData,
                                                availabilities:
                                                    updatedAvailabilities,
                                            });
                                        }}
                                    placeholder="Enter day"
                                />
                                <TextInput
                                    currentValue={availability.timeRange}
                                    onChange={(value) => {
                                        const updatedAvailabilities = [
                                            ...userFormData.availabilities,
                                        ];
                                        updatedAvailabilities[
                                            index
                                        ].timeRange = value;
                                        setUserFormData({
                                            ...userFormData,
                                            availabilities:
                                                updatedAvailabilities,
                                        });
                                    }}
                                    placeholder="Enter hours"
                                />
                                <div className="w-1/5 text-gray text-xl">
                                    <Button
                                        text="Remove"
                                        type="remove"
                                        onClick={() => {
                                            const updatedAvailabilities = userFormData.availabilities.filter(
                                                (_, i) => i !== index
                                            );
                                            setUserFormData({
                                                ...userFormData,
                                                availabilities: updatedAvailabilities,
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            )
                        )
                        : userFormData?.availabilities?.map(
                              (availability, index) => (
                                  <div
                                      key={index}
                                      className="justify-start items-center gap-4 flex"
                                  >
                                      <div className="text-black text-2xl font-bold">
                                          {availability.day}
                                      </div>
                                      <div className=" text-gray text-xl font-normal">
                                          {availability.timeRange}
                                      </div>
                                  </div>
                              )
                        )}
                </div>
                {isEditingAvailability && (
                    <div className="w-1/5 flex items-center gap-2 cursor-pointer">
                        <Button
                            icon={<AddIcon strokeColor="#FFFFFF" />}
                            text="Add Availability"
                            type="primary"
                            onClick={() => setIsAvailabilityModalOpen(true)}
                        />
                    </div>
                )}
                <AddModal
                    isOpen={isAvailabilityModalOpen}
                    text="Add Availability"
                    onClose={() => setIsAvailabilityModalOpen(false)}
                >
                    <div className="flex flex-col gap-4">
                        <div className="mb-4">
                        <label className="block text-xl font-bold text-black mb-2">Day</label>
                        <select
                            className="border p-2 w-full mb-2 rounded text-gray focus:ring-2 focus:ring-blue"
                            value={newDay}
                            onChange={(e) => setNewDay(e.target.value)}
                        >
                            <option value="">Select a day</option>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                        </select>
                        </div>

                        <div className="mb-4">
                        <label className="block text-xl font-bold text-black mb-2">Time Range</label>
                        <input
                            type="text"
                            placeholder="HH:MM - HH:MM"
                            className="border p-2 w-full rounded text-gray focus:ring-2 focus:ring-blue"
                            value={newTimeRange}
                            onInput={(e) => {
                                const input = e.target as HTMLInputElement;
                                input.value = input.value.replace(/[^0-9:-]/g, "");
                            }}
                            pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                            title="Please enter a time range in the format HH:MM-HH:MM (e.g., 09:00-17:00)"
                            onChange={(e) => setNewTimeRange(e.target.value)}
                        />
                        </div>
                        <div className="flex w-2/5 justify-start gap-4">
                            <Button
                                text="Cancel"
                                type="cancel"
                                onClick={() => setIsAvailabilityModalOpen(false)}
                            />
                            <Button
                                text="Save"
                                type="primary"
                                onClick={handleAddAvailability}
                            />
                        </div>
                    </div>
                </AddModal>
            </div>
        </div>
    );
};

export default UserProfile;