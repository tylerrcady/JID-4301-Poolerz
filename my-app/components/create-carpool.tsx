"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddModal from "@/components/modals/add-modal";
import Button from "@/components/atoms/Button";
import BackButton from "@/components/atoms/back-button";

interface CreateCarpoolProps {
    userId: string;
}

const DAYS_OF_WEEK = [
    { label: "Su", value: "Su", number: 0 },
    { label: "M", value: "M", number: 1 },
    { label: "T", value: "T", number: 2 },
    { label: "W", value: "W", number: 3 },
    { label: "Th", value: "Th", number: 4 },
    { label: "F", value: "F", number: 5 },
    { label: "S", value: "S", number: 6 },
];

const CreateCarpool: React.FC<CreateCarpoolProps> = ({ userId }) => {
    const router = useRouter();

    const [poolName, setPoolName] = useState("");
    const [sharedLocation, setSharedLocation] = useState<SharedLocation>({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
    });
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [stateField, setStateField] = useState("");
    const [zip, setZip] = useState("");
    const [riders, setRiders] = useState<
        { id: string; name: string; selected: boolean }[]
    >([]);
    const [drivingAvailability, setDrivingAvailability] = useState<string[]>(
        []
    );
    const [carCapacity, setCarCapacity] = useState("");
    const [error, setError] = useState("");
    const [isBackModalOpen, setIsBackModalOpen] = useState(false);
    const [additionalNotes, setAdditionalNotes] = useState("");
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
                const children = doc?.[0]?.userFormData?.children || [];
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

    // toggle day selection
    const handleDayToggle = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
        console.log(selectedDays);
    };

    const toggleAvailability = (day: string) => {
        setDrivingAvailability((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleRiderToggle = (id: string) => {
        setRiders((prev) =>
            prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
        );
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
        setIsSubmitDisabled(true);
        e.preventDefault();
        setError("");

        if (
            !poolName.trim() ||
            !sharedLocation.name.trim() ||
            !sharedLocation.address.trim() ||
            !sharedLocation.city.trim() ||
            !sharedLocation.state.trim() ||
            !sharedLocation.zipCode.trim() ||
            selectedDays.length === 0 ||
            !startTime ||
            !endTime
        ) {
            setError("Please fill in all required fields!");
            return;
        }

        const times = selectedDays.map((day) => ({
            day,
            timeRange: `${startTime}-${endTime}`,
        }));

        const formattedTimes = times
            .map(({ day, timeRange }) => `${day}: ${timeRange}`)
            .join(", ");

        // map days to int
        const selectedDaysAsInt = selectedDays
            .map(
                (dayAbbr) =>
                    DAYS_OF_WEEK.find((day) => day.value === dayAbbr)?.number
            )
            .filter((num): num is number => num !== undefined)
            .sort((a, b) => a - b);

        // LOOK INTO: why this is needed for app to run
        const notesWithTime = additionalNotes
            ? `Times: ${formattedTimes}. Additional Notes: ${additionalNotes}`
            : `Times: ${formattedTimes}`;

        const formData = {
            creatorId: userId,
            carpoolName: poolName,
            carpoolLocation: sharedLocation,
            carpoolDays: selectedDaysAsInt,
            startTime: startTime,
            endTime: endTime,
            notes: notesWithTime,
            carpoolMembers: [userId],
            isClosed: false,
        };

        try {
            const response = await fetch("/api/create-carpool-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ createCarpoolData: formData }),
            });

            const result = await response.json();
            if (!response.ok) {
                setError(result.error || "Failed to create carpool.");
                return;
            }
            router.push(
                `/carpool-created?joinCode=${
                    result.joinCode
                }&poolName=${encodeURIComponent(poolName)}`
            );
            // now post to user-carpool data
            const joinUserData: JoinCarpoolData = {
                userLocation: {
                    address,
                    city,
                    state: stateField,
                    zipCode: zip,
                },
                carpools: [
                    {
                        carpoolId: result.joinCode,
                        riders: riders
                            .filter((rider) => rider.selected)
                            .map((rider) => rider.name),
                        notes: additionalNotes,
                        drivingAvailability: selectedDaysAsInt,
                        carCapacity: Number(carCapacity),
                    },
                ],
            };
            console.log("Join Carpool Data:", joinUserData);
            const combine = {
                userId: userId,
                createCarpoolData: formData,
                joinData: joinUserData,
            };
            const response2 = await fetch("/api/join-carpool-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ joinCarpoolData: combine }),
            });
            const result2 = await response2.json();
            if (!response2.ok) {
                setError(result2.error || "Failed to create carpool.");
                return;
            }
        } catch (error: unknown) {
            console.error("Error submitting form:", error);
            setError("Internal Server Error. Please try again.");
        } finally {
            setLoading(false);
            setIsSubmitDisabled(false);
        }
    };

    return (
        <>
            {/* Back Button first to align with header*/}
            <div className="w-11/12 mx-auto px-1">
                <BackButton onClick={handleBackClick} />
            </div>
            <div className="flex flex-col w-full p-4 gap-6 items-center">
                {/* Title */}
                <div className="w-10/12 flex justify-start flex-col gap-2">
                    <div className="justify-center text-gray text-2xl font-bold font-['Open Sans']">
                        Create Carpool
                    </div>
                    <div className="justify-center text-gray text-xl font-normal font-['Open Sans']">
                        Add Carpool Information
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-md p-4 flex flex-col gap-4 w-10/12">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-10 w-full sm:flex-row justify-center"
                    >
                        <div className="flex flex-col gap-10 w-full sm:w-1/2">
                            {/* Pool Name Field */}
                            <div className="flex flex-col gap-4">
                                <label className="text-gray text-xl font-bold font-['Open Sans']">
                                    Pool Name{" "}
                                    <span className="text-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter pool name"
                                    value={poolName}
                                    onChange={(e) =>
                                        setPoolName(e.target.value)
                                    }
                                    className="w-full p-2 border border-gray rounded-md focus:outline-none focus:border-[#4b859f] text-black placeholder:text-gray"
                                />
                            </div>
                            {/* Shared Location Field */}
                            <div className="flex flex-col gap-4">
                                <label className="text-gray text-xl font-bold font-['Open Sans']">
                                    Shared Location{" "}
                                    <span className="text-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter location name"
                                    value={sharedLocation.name}
                                    onChange={(e) =>
                                        setSharedLocation({
                                            ...sharedLocation,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border border-gray rounded-md focus:outline-none focus:border-blue text-black placeholder:text-gray"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter address"
                                    value={sharedLocation.address}
                                    onChange={(e) =>
                                        setSharedLocation({
                                            ...sharedLocation,
                                            address: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border border-gray rounded-md focus:outline-none focus:border-blue text-black placeholder:text-gray"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter city"
                                    value={sharedLocation.city}
                                    onChange={(e) =>
                                        setSharedLocation({
                                            ...sharedLocation,
                                            city: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border border-gray rounded-md focus:outline-none focus:border-blue text-black placeholder:text-gray"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter state"
                                    value={sharedLocation.state}
                                    onChange={(e) =>
                                        setSharedLocation({
                                            ...sharedLocation,
                                            state: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border border-gray rounded-md focus:outline-none focus:border-blue text-black placeholder:text-gray"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter zip code"
                                    value={sharedLocation.zipCode}
                                    onChange={(e) =>
                                        setSharedLocation({
                                            ...sharedLocation,
                                            zipCode: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border border-gray rounded-md focus:outline-none focus:border-blue text-black placeholder:text-gray"
                                />
                            </div>
                            {/* Days Available - New UI as clickable circles */}
                            <div className="flex flex-col gap-1">
                                <label className="text-gray text-xl font-bold font-['Open Sans']">
                                    Carpool Days{" "}
                                    <span className="text-red">*</span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {DAYS_OF_WEEK.map((day) => {
                                        const selected = selectedDays.includes(
                                            day.value
                                        );
                                        return (
                                            <div
                                                key={day.value}
                                                onClick={() =>
                                                    handleDayToggle(day.value)
                                                }
                                                className={`flex items-center justify-center rounded-full cursor-pointer font-['Open Sans'] text-lg ${
                                                    selected
                                                        ? "bg-blue text-white"
                                                        : "bg-white border border-gray text-gray"
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
                            {/* Start Time Field */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full justify-between">
                                <div className="flex flex-col gap-1 w-full">
                                    <label className="text-gray text-xl font-bold font-['Open Sans']">
                                        Start Time{" "}
                                        <span className="text-red">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) =>
                                            setStartTime(e.target.value)
                                        }
                                        className="w-full p-2 border border-gray rounded-md focus:outline-none focus:border-blue text-black placeholder:text-gray"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                    <label className="text-gray text-xl font-bold font-['Open Sans']">
                                        End Time{" "}
                                        <span className="text-red">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) =>
                                            setEndTime(e.target.value)
                                        }
                                        className="w-full p-2 border border-gray rounded-md focus:outline-none focus:border-blue text-black placeholder:text-gray"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-10 w-full sm:w-1/2">
                            <div className="flex flex-col gap-1">
                                <label className="text-gray text-xl font-bold font-['Open Sans']">
                                    Your Driving Availability{" "}
                                    <span className="text-red">*</span>
                                </label>
                                <div className="flex flex-wrap gap-3 text-gray">
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
                                                        : "bg-white border border-gray text-gray"
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
                                    className="p-2 border border-gray rounded-md text-black placeholder:text-gray"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="p-2 border border-gray rounded-md text-black placeholder:text-gray"
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={stateField}
                                    onChange={(e) =>
                                        setStateField(e.target.value)
                                    }
                                    className="p-2 border border-gray rounded-md text-black placeholder:text-gray"
                                />
                                <input
                                    type="text"
                                    placeholder="Zip Code"
                                    value={zip}
                                    onChange={(e) => setZip(e.target.value)}
                                    className="p-2 border border-gray rounded-md text-black placeholder:text-gray"
                                />
                            </div>
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
                                                className={`form-checkbox h-5 w-5 ${
                                                    rider.selected
                                                        ? "text-green-500"
                                                        : "text-blue-500"
                                                }`}
                                            />
                                            <span className="text-gray">
                                                {rider.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
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
                                    className="p-2 border border-gray rounded-md text-black placeholder:text-gray"
                                    max={8}
                                />
                            </div>
                            {/* Additional Notes Field */}
                            <div className="flex flex-col gap-1">
                                <label className="text-gray text-xl font-bold font-['Open Sans']">
                                    Additional Notes
                                </label>
                                <textarea
                                    placeholder="Enter any additional notes (optional)"
                                    value={additionalNotes}
                                    onChange={(e) =>
                                        setAdditionalNotes(e.target.value)
                                    }
                                    className="w-full p-2 border border-gray rounded-md focus:outline-none focus:border-blue text-black placeholder:text-gray"
                                    rows={3}
                                />
                            </div>
                            {error && (
                                <p className="text-red text-med">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className={`px-6 py-2 rounded-md text-white text-lg md:text-xl font-semibold font-['Open Sans'] text-center ${
                                    isSubmitDisabled
                                        ? "bg-lightblue cursor-not-allowed"
                                        : "bg-blue border border-blue"
                                }`}
                            >
                                {!loading ? (
                                    <span>Submit</span>
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
};

export default CreateCarpool;
