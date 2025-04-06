"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/atoms/back-button";
import AddModal from "@/components/modals/add-modal";
import Button from "@/components/atoms/Button";
import Loading from "./icons/Loading";

const DAYS_OF_WEEK = [
    { label: "Su", value: "Su", number: 0 },
    { label: "M", value: "M", number: 1 },
    { label: "T", value: "T", number: 2 },
    { label: "W", value: "W", number: 3 },
    { label: "Th", value: "Th", number: 4 },
    { label: "F", value: "F", number: 5 },
    { label: "S", value: "S", number: 6 },
];

interface JoinCarpoolProps {
    userId: string | undefined;
}

interface CarpoolDoc {
    carpoolID: string;
    createCarpoolData: {
        creatorId: string;
        carpoolName: string;
        carpoolLocation: {
            name: string;
            address: string;
            city: string;
            state: string;
            zipCode: string;
        };
        carpoolDays: number[];
        notes: string;
        carpoolMembers: string[];
    };
}

function parseTimeFromNotes(notes: string): string {
    const prefix = "Times:";
    const prefixIndex = notes.indexOf(prefix);
    if (prefixIndex === -1) return "N/A";
    const afterPrefix = notes.substring(prefixIndex + prefix.length).trim();
    const periodIndex = afterPrefix.indexOf(".");
    if (periodIndex === -1) return afterPrefix;
    return afterPrefix.substring(0, periodIndex).trim();
}

function decodeDays(dayNumbers: number[]): string {
    return dayNumbers
        .map((num) => {
            const found = DAYS_OF_WEEK.find((d) => d.number === num);
            return found ? found.value : "??";
        })
        .join(", ");
}

export default function JoinCarpool({ userId }: JoinCarpoolProps) {
    const router = useRouter();

    const [step, setStep] = useState<"codeEntry" | "form">("codeEntry");

    // 1) Code Entry state
    const [joinCode, setJoinCode] = useState("");
    const [carpoolDoc, setCarpoolDoc] = useState<CarpoolDoc | null>(null);
    const [isEnterVisible, setIsEnterVisible] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [fetchError, setFetchError] = useState("");
    const [isBackModalOpen, setIsBackModalOpen] = useState(false);

    // 2) Join Form state
    const [riders, setRiders] = useState<
        { id: string; name: string; selected: boolean }[]
    >([]);
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [stateField, setStateField] = useState("");
    const [zip, setZip] = useState("");
    const [drivingAvailability, setDrivingAvailability] = useState<string[]>(
        []
    );
    const [carCapacity, setCarCapacity] = useState("");
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [error, setError] = useState("");
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;
        fetch(`/api/user-form-data?userId=${userId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch user form data");
                }
                return res.json();
            })
            .then((data) => {
                const doc = data.userFormData;
                const children = doc?.userFormData?.children || [];
                const mapped = children.map((child: any, idx: number) => ({
                    id: child.id || `child-${idx}`,
                    name: child.name,
                    selected: false,
                }));
                setRiders(mapped);

                const userAddress = doc?.userFormData?.location || {};
                setAddress(userAddress.address || "");
                setCity(userAddress.city || "");
                setStateField(userAddress.state || "");
                setZip(userAddress.zipCode || "");
            })
            .catch((err) => {
                console.error(err);
                setError("Could not load children from profile.");
            });
    }, [userId]);

    useEffect(() => {
        setFetchError("");
        setCarpoolDoc(null);
        if (joinCode.length === 6) {
            setLoading(true);
            fetch(`/api/create-carpool-data?carpoolId=${joinCode}`)
                .then((res) => {
                    if (!res.ok) {
                        setFetchError("No carpool found for that code.");
                        setIsEnterVisible(false);
                        setLoading(false);
                        return null;
                    }
                    return res.json();
                })
                .then((data) => {
                    if (
                        !data ||
                        !data.createCarpoolData ||
                        data.createCarpoolData.length === 0
                    ) {
                        setFetchError("Carpool not found for that code.");
                        setIsEnterVisible(false);
                        setLoading(false);
                        return;
                    }
                    const doc = Array.isArray(data.createCarpoolData)
                        ? data.createCarpoolData[0]
                        : data.createCarpoolData;
                    setCarpoolDoc(doc);
                    setIsEnterVisible(true);
                })
                .catch(() => {
                    setFetchError("An error occurred while fetching data.");
                    setIsEnterVisible(false);
                })
                .finally(() => {
                    setLoading(false); // Ensure loading is stopped in all cases
                });
        } else {
            setIsEnterVisible(false);
        }
    }, [joinCode]);

    const handleEnterClick = () => {
        if (!carpoolDoc) return;
        setIsConfirmModalOpen(true);
    };

    const handleBackClick = () => {
        setIsBackModalOpen(true);
    };

    const handleConfirmBack = () => {
        setIsBackModalOpen(false);
        router.back();
    };

    const handleCancelBack = () => {
        setIsBackModalOpen(false);
    };

    const handleConfirmNo = () => {
        setIsConfirmModalOpen(false);
    };

    const handleConfirmYes = () => {
        setIsConfirmModalOpen(false);
        setStep("form");
    };

    // toggle child's selected state
    const handleRiderToggle = (id: string) => {
        setRiders((prev) =>
            prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
        );
    };

    // toggle driving availability
    const toggleAvailability = (day: string) => {
        setDrivingAvailability((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    // enable/disable submit
    useEffect(() => {
        if (
            address.trim() &&
            city.trim() &&
            stateField.trim() &&
            zip.trim() &&
            carCapacity.trim() &&
            drivingAvailability.length > 0
        ) {
            setIsSubmitDisabled(false);
        } else {
            setIsSubmitDisabled(true);
        }
    }, [address, city, stateField, zip, carCapacity, drivingAvailability]);

    const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();
        if (!carpoolDoc) {
            setError("Carpool data not loaded. Please try again.");
            return;
        }
        const selectedDaysAsInt = drivingAvailability
            .map(
                (dayAbbr) =>
                    DAYS_OF_WEEK.find((day) => day.value === dayAbbr)?.number
            )
            .filter((num): num is number => num !== undefined)
            .sort((a, b) => a - b);

        // get selected riders
        const selectedRiderNames: string[] = riders
            .filter((rider) => rider.selected)
            .map((rider) => rider.name);

        const joinUserData: JoinCarpoolData = {
            userLocation: {
                address,
                city,
                state: stateField,
                zipCode: zip,
            },
            carpools: [
                {
                    carpoolId: carpoolDoc.carpoolID,
                    riders: selectedRiderNames,
                    notes: additionalNotes,
                    drivingAvailability: selectedDaysAsInt,
                    carCapacity: Number(carCapacity),
                },
            ],
        };
        console.log("Join Carpool Data:", joinUserData);

        // add member
        carpoolDoc.createCarpoolData.carpoolMembers.push(userId || "");

        try {
            // reformat so that's similar to createCarpoolData
            const combine = {
                userId: userId,
                createCarpoolData: carpoolDoc.createCarpoolData,
                joinData: joinUserData,
            };

            const response = await fetch("/api/join-carpool-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ joinCarpoolData: combine }),
            });
            const result = await response.json();
            if (!response) {
                setError(result.error || "Failed to add member to carpool.");
                return;
            }
            router.push(
                `/carpool-joined?joinCode=${joinCode}&poolName=${encodeURIComponent(
                    carpoolDoc.createCarpoolData.carpoolName
                )}`
            );
        } catch (error: unknown) {
            console.error("Error submitting form:", error);
            setError("Internal Server Error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Code Entry
    if (step === "codeEntry") {
        return (
            <div className="w-full h-full">
                {/* Back Button first to align with header*/}
                <div className="flex justify-start items-start w-11/12 mx-auto px-1">
                    <BackButton onClick={handleBackClick} />
                </div>
                <div className="h-auto flex flex-col w-10/12 max-w-2xl mx-auto p-4 gap-6 items-center justify-center">
                    <div className="text-black text-2xl font-bold font-['Open Sans']">
                        Join a Carpool
                    </div>
                    <p className="text-black text-lg font-bold font-['Open Sans']">
                        Enter a Join Code
                    </p>
                    <p className="text-black text-lg font-['Open Sans']">
                        Enter a code below to join a carpool organization
                    </p>
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                value={joinCode[index] || ""}
                                onChange={(e) => {
                                    const value = e.target.value.toLowerCase();
                                    if (
                                        /^[a-z0-9]$/.test(value) ||
                                        value === ""
                                    ) {
                                        const newCode =
                                            joinCode.substring(0, index) +
                                            value +
                                            joinCode.substring(index + 1);
                                        setJoinCode(newCode);
                                        if (value && index < 5) {
                                            const nextInput =
                                                document.getElementById(
                                                    `code-input-${index + 1}`
                                                );
                                            nextInput?.focus();
                                        }
                                    }
                                }}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const pastedValue = e.clipboardData
                                        .getData("text")
                                        .toLowerCase();
                                    const sanitizedValue = pastedValue
                                        .split("")
                                        .filter((char) =>
                                            /^[a-z0-9]$/.test(char)
                                        )
                                        .slice(0, 6)
                                        .join("");
                                    setJoinCode(sanitizedValue);
                                }}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Backspace" &&
                                        !joinCode[index] &&
                                        index > 0
                                    ) {
                                        const prevInput =
                                            document.getElementById(
                                                `code-input-${index - 1}`
                                            );
                                        prevInput?.focus();
                                    }
                                }}
                                id={`code-input-${index}`}
                                className="w-12 h-16 border-2 border-gray text-center text-2xl font-bold font-['Open Sans']"
                            />
                        ))}
                    </div>
                    {fetchError && (
                        <p className="text-red text-sm text-center">
                            {fetchError}
                        </p>
                    )}
                    {isEnterVisible && carpoolDoc && (
                        <div className="flex justify-center">
                            <button
                                onClick={handleEnterClick}
                                className="px-6 py-2 bg-blue rounded-md border border-blue text-white text-lg md:text-xl font-semibold font-['Open Sans']"
                            >
                                Enter
                            </button>
                        </div>
                    )}
                    {loading && (
                        <div className="flex justify-center">
                            <Loading />
                        </div>
                    )}
                    {/* Confirmation Modal */}
                    <AddModal
                        isOpen={isConfirmModalOpen}
                        text="Join Carpool?"
                        onClose={handleConfirmNo}
                    >
                        <div className="flex flex-col gap-4">
                            <p className="text-black font-bold font-['Open Sans']">
                                {carpoolDoc?.createCarpoolData.carpoolName}
                            </p>
                            <p className="text-black font-normal font-['Open Sans']">
                                Occurs Every:{" "}
                                {decodeDays(
                                    carpoolDoc?.createCarpoolData.carpoolDays ||
                                        []
                                )}
                                <br />
                                Time:{" "}
                                {parseTimeFromNotes(
                                    carpoolDoc?.createCarpoolData.notes || ""
                                )}
                            </p>
                            <div className="flex justify-end gap-4">
                                <Button
                                    text="No"
                                    type="aysbutton"
                                    onClick={handleConfirmNo}
                                />
                                <Button
                                    text="Yes"
                                    type="primary"
                                    onClick={handleConfirmYes}
                                />
                            </div>
                        </div>
                    </AddModal>
                    {/* Back Confirmation Modal */}
                    <AddModal
                        isOpen={isBackModalOpen}
                        text="Are you sure?"
                        onClose={handleCancelBack}
                    >
                        <div className="flex flex-col gap-4">
                            <p className="text-black">
                                Returning to the previous page will lose all
                                progress. The join code for this carpool will
                                not be saved.
                            </p>
                            <div className="flex justify-end gap-4">
                                <Button
                                    text="No, continue"
                                    type="aysbutton"
                                    onClick={handleCancelBack}
                                />
                                <Button
                                    text="Yes, go back"
                                    type="primary"
                                    onClick={handleConfirmBack}
                                />
                            </div>
                        </div>
                    </AddModal>
                </div>
            </div>
        );
    }

    // Step 2: Join Form
    return (
        <>
            <div className="w-11/12 mx-auto px-1">
                <BackButton onClick={handleBackClick} />
            </div>
            <div className="flex flex-col w-full p-4 gap-6 items-center">
                <h1 className="text-gray text-2xl font-bold font-['Open Sans']">
                    Join {carpoolDoc?.createCarpoolData.carpoolName}
                </h1>
                <p className="text-gray text-lg font-bold font-['Open Sans']">
                    Add Ride Information
                </p>
                <div className="bg-white rounded-md p-4 flex flex-col gap-4 w-10/12">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-6 w-full sm:flex-row justify-center"
                    >
                        {/* Riders */}
                        <div className="flex flex-col gap-6 w-full sm:w-1/2">
                            <div className="flex flex-col gap-1">
                                <label className="text-gray text-xl font-bold font-['Open Sans']">
                                    Riders <span className="text-red">*</span>
                                </label>
                                <div className="flex gap-4">
                                    {riders.map((rider) => (
                                        <label
                                            key={rider.id}
                                            className="flex items-center gap-1 font-['Open Sans']"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={rider.selected}
                                                onChange={() =>
                                                    handleRiderToggle(rider.id)
                                                }
                                                className="form-checkbox h-5 w-5 text-blue"
                                            />
                                            <span className="text-black">
                                                {rider.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {/* Your Address */}
                            <div className="flex flex-col gap-1">
                                <label className="text-gray text-xl font-bold font-['Open Sans']">
                                    Your Address{" "}
                                    <span className="text-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="p-2 border border-gray rounded-md text-black"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="p-2 border border-gray rounded-md text-black"
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={stateField}
                                    onChange={(e) =>
                                        setStateField(e.target.value)
                                    }
                                    className="p-2 border border-gray rounded-md text-black"
                                />
                                <input
                                    type="text"
                                    placeholder="Zip Code"
                                    value={zip}
                                    onChange={(e) => setZip(e.target.value)}
                                    className="p-2 border border-gray rounded-md text-black"
                                />
                            </div>
                            {/* Carpool Info */}
                            <div className="flex flex-col gap-1">
                                <label className="text-gray text-xl font-bold font-['Open Sans']">
                                    {carpoolDoc?.createCarpoolData.carpoolName}{" "}
                                    Information
                                </label>
                                <p className="text-black">
                                    Occurs Every:{" "}
                                    {decodeDays(
                                        carpoolDoc?.createCarpoolData
                                            .carpoolDays || []
                                    )}
                                    <br />
                                    Time:{" "}
                                    {parseTimeFromNotes(
                                        carpoolDoc?.createCarpoolData.notes ||
                                            ""
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6 w-full sm:w-1/2">
                            {/* Driving Availability */}
                            <div className="flex flex-col gap-1">
                                <label className="text-gray text-xl font-bold font-['Open Sans']">
                                    Your Driving Availability{" "}
                                    <span className="text-red">*</span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {DAYS_OF_WEEK.map((day) => {
                                        const selected =
                                            drivingAvailability.includes(
                                                day.value
                                            );
                                        return (
                                            <div
                                                key={day.value}
                                                onClick={() =>
                                                    toggleAvailability(
                                                        day.value
                                                    )
                                                }
                                                className={`flex items-center justify-center rounded-full cursor-pointer text-lg ${
                                                    selected
                                                        ? "bg-blue text-white"
                                                        : "bg-white border border-gray text-black"
                                                }`}
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                }}
                                            >
                                                {day.label}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* Car Capacity */}
                            <div className="flex flex-col gap-1">
                                <label className="text-gray text-xl font-bold font-['Open Sans']">
                                    Car Capacity{" "}
                                    <span className="text-red">*</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter capacity (max 8)"
                                    value={carCapacity}
                                    onChange={(e) =>
                                        setCarCapacity(e.target.value)
                                    }
                                    className="p-2 border border-gray rounded-md text-black"
                                    max={8}
                                />
                            </div>
                            {/* Additional Notes */}
                            <div className="flex flex-col gap-1">
                                <label className="text-gray text-xl font-bold font-['Open Sans']">
                                    Additional Notes
                                </label>
                                <textarea
                                    placeholder="Enter comments, accommodations, etc."
                                    value={additionalNotes}
                                    onChange={(e) =>
                                        setAdditionalNotes(e.target.value)
                                    }
                                    className="p-2 border border-gray rounded-md text-black"
                                    rows={3}
                                />
                            </div>
                            {error && (
                                <p className="text-red text-sm">{error}</p>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className={`px-6 py-2 rounded-md text-white text-lg md:text-xl font-semibold font-['Open Sans'] ${
                                    isSubmitDisabled
                                        ? "bg-lightblue cursor-not-allowed"
                                        : "bg-blue border border-blue"
                                }`}
                            >
                                {!loading ? (
                                    <span>Continue</span>
                                ) : (
                                    <span>Loading...</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                {/* Back Confirmation Modal */}
                <AddModal
                    isOpen={isBackModalOpen}
                    text="Are you sure?"
                    onClose={handleCancelBack}
                >
                    <div className="flex flex-col gap-4">
                        <p className="text-black">
                            Returning to the previous page will lose all
                            progress. The information for this carpool will not
                            be saved.
                        </p>
                        <div className="flex justify-end gap-4">
                            <Button
                                text="No, continue"
                                type="aysbutton"
                                onClick={handleCancelBack}
                            />
                            <Button
                                text="Yes, go back"
                                type="primary"
                                onClick={handleConfirmBack}
                            />
                        </div>
                    </div>
                </AddModal>
            </div>
        </>
    );
}
