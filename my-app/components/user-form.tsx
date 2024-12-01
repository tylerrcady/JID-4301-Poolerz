"use client";

import React, { useState } from "react";
import Image from "next/image";
import NumberInput from "./atoms/number-input";
import BackButton from "@components/atoms/back-button";
import Slider from "@mui/material/Slider"
import { useRouter } from "next/navigation";


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
        location: {
            address: "",
            city: "",
            state: "",
            zipCode: "",
        } as UserLocation,
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
    const handleNumChildrenChange = (value: number) => {
        //const num = parseInt(value, 10);
        if (!isNaN(value) && value >= 0 && value <= 5) {
            setUserFormData((prev) => ({
                ...prev,
                numChildren: value,
                //children: Array(value).fill({ name: "" }), // Initialize empty child objects
                children: [...prev.children.slice(0, value), ...Array(Math.max(0, value - prev.children.length)).fill({ name: "" })],
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
    const handleCarCapacityChange = (value: number) => {
        if (!isNaN(value) && value >= 0 && value <= 10) {
            setUserFormData((prev) => ({
                ...prev,
                carCapacity: value,
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

    // Remove an availability entry by index
    const removeAvailability = (index: number) => {
        setUserFormData((prev) => {
            const updatedAvailabilities = prev.availabilities.filter((_, i) => i !== index);
            return {
                ...prev,
                availabilities: updatedAvailabilities,
            };
        });
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

    const handleLocationChange = (key: "address" | "city" | "state" | "zipCode", value: string) => {
        setUserFormData((prev) => ({
            ...prev,
            location: {
                ...prev.location,
                [key]: value,
            },
        }));
    };

    const validatePage = () => {
        console.log("Validating current page:", currentPage);
    
        if (currentPage === 1) {
            if (userFormData.numChildren === 0) {
                alert("Please enter a valid number of children before continuing.");
                return false;
            }
    
            const emptyNames = userFormData.children.some((child) => child.name.trim() === "");
            if (emptyNames) {
                alert("Please ensure all children have names before continuing.");
                return false;
            }
        } else if (currentPage === 2) {
            if (userFormData.carCapacity === 0) {
                alert("Please enter a valid car capacity before continuing.");
                return false;
            }
    
            if (userFormData.availabilities.length === 0) {
                alert("Please add at least one availability before continuing.");
                return false;
            }

            const { address, city, state, zipCode } = userFormData.location;
            if (!address.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
                alert("Please fill in all location fields before continuing.");
                return false;
            }

            const timeRangeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            const invalidTimeRanges = userFormData.availabilities.some(
                (availability) => !timeRangeRegex.test(availability.timeRange)
            );
            if (invalidTimeRanges) {
                alert("Please enter a valid time range in the format HH:MM-HH:MM (e.g., 09:00-17:00).");
                return false;
            }
    
            const incompleteAvailabilities = userFormData.availabilities.some(
                (availability) => !availability.day.trim() || !availability.timeRange.trim()
            );
            if (incompleteAvailabilities) {
                alert("Please ensure all availability slots are filled before continuing.");
                return false;
            }
        }
    
        return true;
    };

    // Move to the next page
    const handleContinue = () => {
        if (validatePage()) {
            setCurrentPage(currentPage + 1);
        }
    };

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Availabilities before submission:", userFormData.availabilities);

        if (!validatePage()) {
            console.log("Validation failed. Submission blocked.");
            return;
        }

        setIsLoading(true);
        try {
            await handleUserFormPost();
            console.log("Redirecting to /user-profile...");
            router.push("/user-profile"); // Use router.push for client-side navigation
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error during submission:", error.message);
                alert(`There was an error submitting the form: ${error.message}`);
            } else {
                console.error("Unknown error during submission:", error);
                alert("There was an unknown error submitting the form. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Move to the previous page
    const handleBack = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        // do not change the first div at all
        <div className="flex items-center flex-col h-auto w-full bg-w p-5 overflow-y-auto gap-4 text-center">
            <Image
                src="/poolerz.jpg"
                alt="Poolerz Logo"
                width={245}
                height={42}
            />
            {currentPage === 1 && (
                <>
                    <h1 className="text-2xl text-black font-bold mb-4">
                        Household Information
                    </h1>
                    <div className="flex flex-col items-center gap-5 mt-6">
                        
                            <label className="text-black text-lg font-semibold">
                                How many children do you have?
                            </label>
                            <div className="w-3/4 mt-6">
                            <Slider
                                aria-label="Number of Children"
                                min={0}
                                max={5}
                                value={userFormData.numChildren}
                                valueLabelDisplay="on"
                                onChange={(e, value) => handleNumChildrenChange(value as number)}
                            />
                            </div>
                        </div>
                    {userFormData.numChildren > 0 && (
                        <>
                            {userFormData.children.map((child, index) => (
                                <div key={index} className="mb-4">
                                    <label className="block text-sm text-black font-medium mb-2">
                                        Child {index + 1} Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={`Child ${index + 1} Name`}
                                        className="border p-2 w-full"
                                        value={child.name}
                                        onChange={(e) =>
                                            handleChildNameChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            ))}
                        </>
                    )}
                    <button
                        className="px-4 py-2 bg-blue text-w rounded min-w-1/6"
                        onClick={handleContinue}
                    >
                        Continue
                    </button>
                </>
            )}

            {currentPage === 2 && (
                <>
                    <h1 className="text-2xl font-bold mb-4">
                        Enter Car Capacity
                    </h1>
                    <div className="w-auto h-5 px-4 py-10 bg-white justify-center items-center flex">
                        <NumberInput
                            onChange={(e) => handleCarCapacityChange(e)}
                            placeholder="Enter car capacity"
                            min={0}
                            max={10}
                            step={1}
                        />
                    </div>
                    <h2 className="text-xl font-bold mb-4">Location</h2>
                    <div className="flex flex-col gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                type="text"
                                className="border p-2 w-full rounded"
                                placeholder="Enter your address"
                                value={userFormData.location.address}
                                onChange={(e) => handleLocationChange("address", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input
                                type="text"
                                className="border p-2 w-full rounded"
                                placeholder="Enter your city"
                                value={userFormData.location.city}
                                onChange={(e) => handleLocationChange("city", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">State</label>
                            <input
                                type="text"
                                className="border p-2 w-full rounded"
                                placeholder="Enter your state"
                                value={userFormData.location.state}
                                onChange={(e) => handleLocationChange("state", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                            <input
                                type="text"
                                className="border p-2 w-full rounded"
                                placeholder="Enter your zip code"
                                value={userFormData.location.zipCode}
                                onChange={(e) => handleLocationChange("zipCode", e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded w-full mb-4"
                        onClick={addAvailability}
                    >
                        Add Availability
                    </button>

                    {userFormData.availabilities.map((availability, index) => (
                        <div 
                            key={index}
                            className="block text-sm font-medium mb-2"
                        >
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
                            {availability.day.trim() === "" && (
                                <p className="block text-sm font-medium mb-2">Please select a day.</p>
                            )}

                            <label className="block text-sm font-medium mb-2">
                                Time Range
                            </label>
                            <input
                                type="text"
                                placeholder="HH:MM - HH:MM"
                                className="border p-2 w-full rounded"
                                value={availability.timeRange || "09:00-17:00"}
                                pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                                title="Please enter a time range in the format HH:MM-HH:MM (e.g., 09:00-17:00)"
                                onChange={(e) =>
                                    updateAvailability(
                                        index,
                                        "timeRange",
                                        e.target.value
                                    )
                                }
                            />
                            <button
                                className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white rounded w-full"
                                onClick={() => removeAvailability(index)}
                            >
                                Remove Availability
                            </button>
                        </div>
                    ))}

                    <div className="flex justify-between w-full gap-4">
                        <BackButton onClick={handleBack} />
                        {!isLoading && (
                            <button
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded w-full"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                Submit
                            </button>
                        )}
                        {isLoading && (
                            <p className="text-center text-gray-500">
                                Submitting...
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default UserForm;
