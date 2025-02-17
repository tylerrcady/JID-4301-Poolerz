"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AddModal from "@/components/modals/add-modal";
import Button from "@/components/atoms/Button";

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

  // Form state
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
  const [error, setError] = useState("");
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Toggle day selection
  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    console.log(selectedDays);
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

  // Handle form submission and connect to the database via API
  const handleSubmit = async (e: React.FormEvent) => {
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
      !startTime
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const times = selectedDays.map((day) => ({
      day,
      timeRange: startTime,
    }));

    // Format the times array into a readable string
    const formattedTimes = times
    .map(({ day, timeRange }) => `${day}: ${timeRange}`)
    .join(", ");

    // map days to int
    const selectedDaysAsInt = selectedDays
    .map(dayAbbr => DAYS_OF_WEEK.find(day => day.value === dayAbbr)?.number)
    .filter((num): num is number => num !== undefined);

    const formData = {
      creatorId: userId,
      carpoolName: poolName,
      carpoolLocation: sharedLocation,
      carpoolDays: selectedDaysAsInt,
      notes: additionalNotes
        ? `Times: ${formattedTimes}. Additional Notes: ${additionalNotes}`
        : `Times: ${formattedTimes}`,
      carpoolMembers: [userId],
    };

    try {
      const response = await fetch("/api/create-carpool-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // API expects the carpool data under the key "createCarpoolData"
        body: JSON.stringify({ createCarpoolData: formData }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to create carpool.");
        return;
      }
      // This should work if API returns a JSON including { joinCode: "actual_code" }
      router.push(
        `/carpool-created?joinCode=${result.joinCode}&poolName=${encodeURIComponent(
          poolName
        )}`
      );
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      setError("Internal Server Error. Please try again.");
    }
  };

  return (
    <div className="flex flex-col w-10/12 max-w-2xl mx-auto p-4 gap-6">
      {/* Title */}
      <h1 className="text-black text-2xl font-bold font-['Open Sans']">
        Create Carpool
      </h1>
      {/* Back Button */}
      <div>
        <button
          onClick={handleBackClick}
          className="text-b text-lg md:text-2xl"
        >
          Back
        </button>
      </div>
      {/* Form Card */}
      <div className="bg-white rounded-md shadow-md p-4 flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Pool Name Field */}
          <div className="flex flex-col gap-1">
            <label className="text-black text-xl font-bold font-['Open Sans']">
              Pool Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter pool name"
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
              className="w-full p-2 border border-[#666666] rounded-md focus:outline-none focus:border-[#4b859f] text-black placeholder:text-black"
            />
          </div>
          {/* Shared Location Field */}
          <div className="flex flex-col gap-1">
            <label className="text-black text-xl font-bold font-['Open Sans']">
              Shared Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter location name"
              value={sharedLocation.name}
              onChange={(e) =>
                setSharedLocation({ ...sharedLocation, name: e.target.value })
              }
              className="w-full p-2 border border-[#666666] rounded-md focus:outline-none focus:border-[#4b859f] text-black placeholder:text-black"
            />
            <input
              type="text"
              placeholder="Enter address"
              value={sharedLocation.address}
              onChange={(e) =>
                setSharedLocation({ ...sharedLocation, address: e.target.value })
              }
              className="w-full p-2 border border-[#666666] rounded-md focus:outline-none focus:border-[#4b859f] text-black placeholder:text-black"
            />
            <input
              type="text"
              placeholder="Enter city"
              value={sharedLocation.city}
              onChange={(e) =>
                setSharedLocation({ ...sharedLocation, city: e.target.value })
              }
              className="w-full p-2 border border-[#666666] rounded-md focus:outline-none focus:border-[#4b859f] text-black placeholder:text-black"
            />
            <input
              type="text"
              placeholder="Enter state"
              value={sharedLocation.state}
              onChange={(e) =>
                setSharedLocation({ ...sharedLocation, state: e.target.value })
              }
              className="w-full p-2 border border-[#666666] rounded-md focus:outline-none focus:border-[#4b859f] text-black placeholder:text-black"
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
              className="w-full p-2 border border-[#666666] rounded-md focus:outline-none focus:border-[#4b859f] text-black placeholder:text-black"
            />
          </div>
          {/* Days Available - New UI as clickable circles */}
          <div className="flex flex-col gap-1">
            <label className="text-black text-xl font-bold font-['Open Sans']">
              Carpool Days <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {DAYS_OF_WEEK.map((day) => {
                const selected = selectedDays.includes(day.value);
                return (
                  <div
                    key={day.value}
                    onClick={() => handleDayToggle(day.value)}
                    className={`flex items-center justify-center rounded-full cursor-pointer font-['Open Sans'] text-lg ${
                      selected
                        ? "bg-[#4b859f] text-white"
                        : "bg-white border border-[#666666] text-black"
                    }`}
                    style={{ width: "40px", height: "40px" }}
                  >
                    {day.label}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Start Time Field */}
          <div className="flex flex-col gap-1">
            <label className="text-black text-xl font-bold font-['Open Sans']">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-[#666666] rounded-md focus:outline-none focus:border-[#4b859f] text-black placeholder:text-black"
            />
          </div>
          {/* Additional Notes Field */}
          <div className="flex flex-col gap-1">
            <label className="text-black text-xl font-bold font-['Open Sans']">
              Additional Notes
            </label>
            <textarea
              placeholder="Enter any additional notes (optional)"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full p-2 border border-[#666666] rounded-md focus:outline-none focus:border-[#4b859f] text-black placeholder:text-black"
              rows={3}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="px-6 py-2 bg-[#4b859f] rounded-md border border-[#4b859f] text-white text-lg md:text-xl font-semibold font-['Open Sans']"
          >
            Continue
          </button>
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
            Returning to the previous page will lose all progress. The information for this carpool will not be saved.
          </p>
          <div className="flex justify-end gap-4">
            <Button text="No, continue" type="secondary" onClick={handleCancelBack} />
            <Button text="Yes, go back" type="primary" onClick={handleConfirmBack} />
          </div>
        </div>
      </AddModal>
    </div>
  );
};

export default CreateCarpool;