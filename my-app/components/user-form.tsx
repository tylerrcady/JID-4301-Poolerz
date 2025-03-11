"use client";

import React, { useState } from "react";
import Image from "next/image";
import NumberInput from "./atoms/number-input";
import BackButton from "@components/atoms/back-button";
import Slider from "@mui/material/Slider";
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
                    userFormData: {
                        //! explicitly needed this as was somehow putting isComplete in here
                        // ! might be something to debug later
                        numChildren: userFormData.numChildren,
                        children: userFormData.children,
                        carCapacity: userFormData.carCapacity,
                        availabilities: userFormData.availabilities,
                        location: userFormData.location,
                    },
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
                children: [
                    ...prev.children.slice(0, value),
                    ...Array(Math.max(0, value - prev.children.length)).fill({
                        name: "",
                    }),
                ],
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

    const handleLocationChange = (
        key: "address" | "city" | "state" | "zipCode",
        value: string
    ) => {
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
                alert(
                    "Please enter a valid number of children before continuing."
                );
                return false;
            }

            const emptyNames = userFormData.children.some(
                (child) => child.name.trim() === ""
            );
            if (emptyNames) {
                alert(
                    "Please ensure all children have names before continuing."
                );
                return false;
            }
        } else if (currentPage === 2) {
            const { address, city, state, zipCode } = userFormData.location;
            if (
                !address.trim() ||
                !city.trim() ||
                !state.trim() ||
                !zipCode.trim()
            ) {
                alert("Please fill in all location fields before continuing.");
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

        console.log(
            "Availabilities before submission:",
            userFormData.availabilities
        );

        if (!validatePage()) {
            console.log("Validation failed. Submission blocked.");
            return;
        }

        setIsLoading(true);
        try {
            await handleUserFormPost();
            console.log("Redirecting to /user-profile...");
            router.push("/user-profile");
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error during submission:", error.message);
                alert(
                    `There was an error submitting the form: ${error.message}`
                );
            } else {
                console.error("Unknown error during submission:", error);
                alert(
                    "There was an unknown error submitting the form. Please try again."
                );
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
        <div className="flex items-center flex-col h-auto w-full bg-w p-5 gap-4 text-center">
            <div className="text-base underline text-black">
                Complete our onboarding form below to get access to the full
                application.
            </div>
            <Image
                src="/poolerz.jpg"
                alt="Poolerz Logo"
                width={245}
                height={42}
            />
            {currentPage === 1 && (
                <>
                    <h1 className="text-2xl text-black font-bold">
                        Household Information
                    </h1>
                    <div className="flex flex-col items-center gap-5 mt-2">
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
                                onChange={(e, value) =>
                                    handleNumChildrenChange(value as number)
                                }
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
                                        className="border p-2 w-full text-black rounded-lg active:border-blue"
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
                    <h2 className="text-xl font-bold text-black">Location</h2>
                    <div className="flex flex-col gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray">
                                Address
                            </label>
                            <input
                                type="text"
                                className="border p-2 w-full rounded text-black rounded-lg active:border-blue"
                                placeholder="Street Name"
                                value={userFormData.location.address}
                                onChange={(e) =>
                                    handleLocationChange(
                                        "address",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray">
                                City
                            </label>
                            <input
                                type="text"
                                className="border p-2 w-full rounded text-black rounded-lg active:border-blue"
                                placeholder="City"
                                value={userFormData.location.city}
                                onChange={(e) =>
                                    handleLocationChange("city", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray">
                                State
                            </label>
                            <input
                                type="text"
                                className="border p-2 w-full rounded text-black rounded-lg active:border-blue"
                                placeholder="State"
                                value={userFormData.location.state}
                                onChange={(e) =>
                                    handleLocationChange(
                                        "state",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray">
                                Zip Code
                            </label>
                            <input
                                type="text"
                                className="border p-2 w-full rounded text-black rounded-lg active:border-blue"
                                placeholder="Zip Code"
                                value={userFormData.location.zipCode}
                                onChange={(e) =>
                                    handleLocationChange(
                                        "zipCode",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="flex justify-center w-full gap-4">
                        <BackButton onClick={handleBack} />
                        {!isLoading && (
                            <button
                                className="px-4 py-2 bg-blue text-w rounded min-w-1/6"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                Submit
                            </button>
                        )}
                        {isLoading && (
                            <p className="text-center text-gray">
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
