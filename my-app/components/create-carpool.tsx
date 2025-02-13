"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AddModal from "@/components/modals/add-modal";
import Button from "@/components/atoms/Button";

interface CreateCarpoolProps {
  userId: string;
}

const DAYS_OF_WEEK = [
  { label: "Sunday", value: "U" },
  { label: "Monday", value: "M" },
  { label: "Tuesday", value: "T" },
  { label: "Wednesday", value: "W" },
  { label: "Thursday", value: "R" },
  { label: "Friday", value: "F" },
  { label: "Saturday", value: "S" },
];

const CreateCarpool: React.FC<CreateCarpoolProps> = ({ userId }) => {
  const router = useRouter();

  // Form state
  const [poolName, setPoolName] = useState("");
  const [sharedLocation, setSharedLocation] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [error, setError] = useState("");
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);

  // Toggle day selection
  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
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

  // Handle form submission and connect to the database via API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (
      !poolName.trim() ||
      !sharedLocation.trim() ||
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
  
    const formData = {
      creatorId: userId,
      times,
      notes: `Pool Name: ${poolName}; Shared Location: ${sharedLocation}`,
      members: [userId],
    };
  
    try {
      const response = await fetch("/api/create-carpool-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Our API expects the carpool data under the key "createCarpoolData"
        body: JSON.stringify({ createCarpoolData: formData }),
      });
  
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to create carpool.");
        return;
      }
      // Assuming the API now returns a JSON including { joinCode: "actual_code" }
      router.push(
        `/carpool-created?joinCode=${result.joinCode}&poolName=${encodeURIComponent(poolName)}`
      );
    } catch (error: any) {
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
              placeholder="Enter shared location"
              value={sharedLocation}
              onChange={(e) => setSharedLocation(e.target.value)}
              className="w-full p-2 border border-[#666666] rounded-md focus:outline-none focus:border-[#4b859f] text-black placeholder:text-black"
            />
          </div>
          {/* Days Available */}
          <div className="flex flex-col gap-1">
            <label className="text-black text-xl font-bold font-['Open Sans']">
              Days Available <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <label
                  key={day.value}
                  className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer font-['Open Sans']"
                >
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    className="form-checkbox h-5 w-5 text-[#4b859f]"
                  />
                  <span className="text-black">{day.label}</span>
                </label>
              ))}
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