"use client";

import React, { useState } from "react";
import BackButton from "@components/atoms/back-button";

interface UserFormProps {
    userId: string | undefined;
}

const UserForm: React.FC<UserFormProps> = ({ userId }) => {
    const [currentPage, setCurrentPage] = useState(1); // Start with page 1
    const [isLoading, setIsLoading] = useState(false);
    const [userFormData, setUserFormData] = useState<UserFormData>({
        // perfect keep like this and edit this only; do not edit any other API files; make sure changes are reflected in user-profile.tsx
        numChildren: 0,
        children: [] as { name: string }[],
        carCapacity: 0,
        availabilities: [] as { day: string; timeRange: string }[],
    });

    // POST user-form-data handler
    const handleUserFormPost = async () => {
        try {
            const response = await fetch("/api/user-form-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    userFormData,
                }),
            });

            if (response.ok) {
                console.log("Form submitted successfully!");
            } else {
                console.error("Failed to submit form:", response.statusText);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    // Handle changes for the number of children
    const handleNumChildrenChange = (value: string) => {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num >= 0 && num <= 5) {
            setUserFormData((prev) => ({
                ...prev,
                numChildren: num,
                children: Array(num).fill({ name: "" }), // Initialize empty child objects
            }));
        }
    };

    // Handle changes for individual children's names
    const handleChildNameChange = (index: number, value: string) => {
        const updatedChildren = [...userFormData.children];
        updatedChildren[index] = { name: value };
        setUserFormData((prev) => ({
            ...prev,
            children: updatedChildren,
        }));
    };

    // Handle car capacity input
    const handleCarCapacityChange = (value: string) => {
        const capacity = parseInt(value, 10);
        if (!isNaN(capacity) && capacity >= 0 && capacity <= 10) {
            setUserFormData((prev) => ({
                ...prev,
                carCapacity: capacity,
            }));
        }
    };

    // Add a new availability entry
    const addAvailability = () => {
        setUserFormData((prev) => ({
            ...prev,
            availabilities: [
                ...prev.availabilities,
                { day: "", timeRange: "" },
            ],
        }));
    };

    // Update a specific availability entry
    const updateAvailability = (
        index: number,
        key: "day" | "timeRange",
        value: string
    ) => {
        const updatedAvailabilities = [...userFormData.availabilities];
        updatedAvailabilities[index][key] = value;
        setUserFormData((prev) => ({
            ...prev,
            availabilities: updatedAvailabilities,
        }));
    };

    // Move to the next page
    const handleContinue = () => {
        if (currentPage === 1 && userFormData.numChildren === 0) {
            alert("Please enter a valid number of children.");
            return;
        }
        if (currentPage === 3 && userFormData.carCapacity === 0) {
            alert("Please enter a valid car capacity.");
            return;
        }
        setCurrentPage(currentPage + 1);
    };

    // Move to the previous page
    const handleBack = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="flex items-center justify-center flex-col h-full w-full bg-gray-100 p-5 overflow-y-auto">
            {currentPage === 1 && (
                <div className="flex flex-col items-center w-full max-w-screen-sm mx-auto">
                    <h1 className="text-2xl font-bold mb-4 text-center">
                        How many children do you have?
                    </h1>
                    <input
                        type="number"
                        placeholder="Enter number of children"
                        className="border mb-4 p-2 w-full rounded"
                        onChange={(e) =>
                            handleNumChildrenChange(e.target.value)
                        }
                    />
                    <div className="flex justify-between w-full gap-4">
                        <BackButton
                            onClick={handleBack}
                            disabled={currentPage === 1} // Disable Back on the first page
                        />
                        <button
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded w-full"
                            onClick={handleContinue}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {currentPage === 2 && (
                <div className="flex flex-col items-center w-full max-w-screen-sm mx-auto">
                    <h1 className="text-2xl font-bold mb-4 text-center">
                        Enter your child&apos;s names
                    </h1>
                    {userFormData.children.map((child, index) => (
                        <div key={index} className="mb-4 w-full">
                            <label className="block text-sm font-medium mb-2">
                                Child {index + 1} Name
                            </label>
                            <input
                                type="text"
                                placeholder={`Child ${index + 1} Name`}
                                className="border p-2 w-full rounded"
                                value={child.name}
                                onChange={(e) =>
                                    handleChildNameChange(index, e.target.value)
                                }
                            />
                        </div>
                    ))}
                    <div className="flex justify-between w-full gap-4">
                        <BackButton onClick={handleBack} />
                        <button
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded w-full"
                            onClick={handleContinue}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {currentPage === 3 && (
                <div className="flex flex-col items-center w-full max-w-screen-sm mx-auto">
                    <h1 className="text-2xl font-bold mb-4 text-center">
                        Enter Car Capacity
                    </h1>
                    <input
                        type="number"
                        placeholder="Enter car capacity"
                        className="border mb-4 p-2 w-full rounded"
                        onChange={(e) =>
                            handleCarCapacityChange(e.target.value)
                        }
                    />

                    <h2 className="text-xl font-bold mb-4">Add Availability</h2>
                    <button
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded w-full mb-4"
                        onClick={addAvailability}
                    >
                        Add Availability
                    </button>

                    {userFormData.availabilities.map((availability, index) => (
                        <div key={index} className="mb-4 w-full">
                            <label className="block text-sm font-medium mb-2">
                                Day
                            </label>
                            <select
                                className="border p-2 w-full mb-2 rounded"
                                value={availability.day}
                                onChange={(e) =>
                                    updateAvailability(
                                        index,
                                        "day",
                                        e.target.value
                                    )
                                }
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

                            <label className="block text-sm font-medium mb-2">
                                Time Range
                            </label>
                            <input
                                type="text"
                                placeholder="Enter time range (e.g., 9 AM - 5 PM)"
                                className="border p-2 w-full rounded"
                                value={availability.timeRange}
                                onChange={(e) =>
                                    updateAvailability(
                                        index,
                                        "timeRange",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    ))}

                    <div className="flex justify-between w-full gap-4">
                        <BackButton onClick={handleBack} />
                        {!isLoading && (
                            <button
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded w-full"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    setIsLoading(true);
                                    await handleUserFormPost();
                                    setIsLoading(false);
                                }}
                            >
                                Submit
                            </button>
                        )}
                        {isLoading && (
                            <p className="text-center text-gray-500">Submitting...</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserForm;