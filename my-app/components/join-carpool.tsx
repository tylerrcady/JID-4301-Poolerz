"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddModal from "@/components/modals/add-modal";
import Button from "@/components/atoms/Button";

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
    carpoolDays: number[]; // stored as integers, e.g. [1,3,5]
    notes: string; // e.g. "Times: 08:00. Additional Notes: Some note"
    carpoolMembers: string[];
  };
}

// Parse "Times: ..." from notes
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

  // Step control: "codeEntry" or "form"
  const [step, setStep] = useState<"codeEntry" | "form">("codeEntry");

  // 1) Code Entry state
  const [joinCode, setJoinCode] = useState("");
  const [carpoolDoc, setCarpoolDoc] = useState<CarpoolDoc | null>(null);
  const [isEnterVisible, setIsEnterVisible] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // 2) Join Form state
  const [riders, setRiders] = useState<{ id: string; name: string; selected: boolean }[]>([]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateField, setStateField] = useState("");
  const [zip, setZip] = useState("");
  const [drivingAvailability, setDrivingAvailability] = useState<string[]>([]);
  const [carCapacity, setCarCapacity] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  // --- Fetch the user's children from /api/user-form-data?userId=...
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
        // The endpoint returns an object with a nested structure:
        // { userFormData: { userFormData: { children: [...] }, ... } }
        const doc = data.userFormData;
        const children = doc?.userFormData?.children || [];
        const mapped = children.map((child: any, idx: number) => ({
          id: child.id || `child-${idx}`,
          name: child.name,
          selected: false,
        }));
        setRiders(mapped);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load children from profile.");
      });
  }, [userId]);

  // If joinCode length is 6, fetch the carpool doc from the DB
  useEffect(() => {
    setFetchError("");
    setCarpoolDoc(null);
    if (joinCode.length === 6) {
      fetch(`/api/create-carpool-data?carpoolId=${joinCode}`)
        .then((res) => {
          if (!res.ok) throw new Error("Carpool not found or server error");
          return res.json();
        })
        .then((data) => {
          if (!data.createCarpoolData || data.createCarpoolData.length === 0) {
            throw new Error("Carpool not found for that code");
          }
          const doc = Array.isArray(data.createCarpoolData)
            ? data.createCarpoolData[0]
            : data.createCarpoolData;
          setCarpoolDoc(doc);
          setIsEnterVisible(true);
        })
        .catch((err) => {
          console.error(err);
          setFetchError("No carpool found for that code.");
          setIsEnterVisible(false);
        });
    } else {
      setIsEnterVisible(false);
    }
  }, [joinCode]);

  const handleEnterClick = () => {
    if (!carpoolDoc) return;
    setIsConfirmModalOpen(true);
  };

  const handleConfirmNo = () => {
    setIsConfirmModalOpen(false);
  };

  const handleConfirmYes = () => {
    setIsConfirmModalOpen(false);
    setStep("form");
  };

  // Toggle child's selected state
  const handleRiderToggle = (id: string) => {
    setRiders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  // Toggle driving availability
  const toggleAvailability = (day: string) => {
    setDrivingAvailability((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Enable/disable submit
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
    e.preventDefault();
    if (!carpoolDoc) {
      setError("Carpool data not loaded. Please try again.");
      return;
    }

    // map days to int
    const selectedDaysAsInt = drivingAvailability
    .map(dayAbbr => DAYS_OF_WEEK.find(day => day.value === dayAbbr)?.number)
    .filter((num): num is number => num !== undefined);

    // get selected riders
    const selectedRiderNames: string[] = riders
    .filter(rider => rider.selected) // Keep only selected riders
    .map(rider => rider.name);       // Step 2: Extract names

    // convert joinData into JoinCarpoolData
    const joinUserData: JoinCarpoolData = {
      userLocation: {
          address,
          city,
          state: stateField,
          zipCode: zip
      },
      drivingAvailability: selectedDaysAsInt, // Example hours available for driving
      carCapacity: Number(carCapacity),
      carpoolId: carpoolDoc.carpoolID,
      riders: selectedRiderNames,
      notes: additionalNotes
    };
    console.log("Join Carpool Data:", joinUserData);

    // add member
    carpoolDoc.createCarpoolData.carpoolMembers.push(userId || "");

    try {
      // reformat so that's similar to createCarpoolData
      const combine = {
        userId: userId,
        createCarpoolData: carpoolDoc.createCarpoolData,
        joinData: joinUserData
      }
      
      const response = await fetch("/api/join-carpool-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // API expects the carpool data under the key "joinCarpoolData"
        body: JSON.stringify({ joinCarpoolData: combine }),
      });

      const result = await response.json();
      if (!response) {
        setError(result.error || "Failed to add member to carpool.");
        return;
      }
      // In production, perform an API call to store join data
      router.push(
        `/carpool-joined?joinCode=${joinCode}&poolName=${encodeURIComponent(
          carpoolDoc.createCarpoolData.carpoolName
        )}`
      );
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      setError("Internal Server Error. Please try again.");
    }
  };

  // Step 1: Code Entry
  if (step === "codeEntry") {
    return (
      <div className="flex flex-col w-10/12 max-w-2xl mx-auto p-4 gap-6">
        {/* Back Button */}
        <div>
          <button onClick={() => router.back()} className="text-b text-lg md:text-2xl">
            Back
          </button>
        </div>
        {/* Title */}
        <h1 className="text-black text-2xl font-bold font-['Open Sans']">Join a Carpool</h1>
        {/* Instructions */}
        <p className="text-black text-lg font-bold font-['Open Sans']">Enter a Join Code</p>
        <p className="text-black text-lg font-['Open Sans']">
          Enter a code below to join a carpool organization
        </p>
        {/* Join Code Input */}
        <div className="flex justify-center">
          <input
            type="text"
            maxLength={6}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="______"
            className="text-center text-2xl font-bold font-['Open Sans'] border-b-2 border-black focus:outline-none"
          />
        </div>
        {fetchError && <p className="text-red-500 text-sm text-center">{fetchError}</p>}
        {/* Enter Button */}
        {isEnterVisible && carpoolDoc && (
          <div className="flex justify-center">
            <button
              onClick={handleEnterClick}
              className="px-6 py-2 bg-[#4b859f] rounded-md border border-[#4b859f] text-white text-lg md:text-xl font-semibold font-['Open Sans']"
            >
              Enter
            </button>
          </div>
        )}
        {/* Confirmation Modal */}
        <AddModal isOpen={isConfirmModalOpen} text="Join Carpool?" onClose={handleConfirmNo}>
          <div className="flex flex-col gap-4">
            <p className="text-black font-bold font-['Open Sans']">
              {carpoolDoc?.createCarpoolData.carpoolName}
            </p>
            <p className="text-black font-normal font-['Open Sans']">
              Occurs Every: {decodeDays(carpoolDoc?.createCarpoolData.carpoolDays || [])} <br />
              Time: {parseTimeFromNotes(carpoolDoc?.createCarpoolData.notes || "")}
            </p>
            <div className="flex justify-end gap-4">
              <Button text="No" type="secondary" onClick={handleConfirmNo} />
              <Button text="Yes" type="primary" onClick={handleConfirmYes} />
            </div>
          </div>
        </AddModal>
      </div>
    );
  }

  // Step 2: Join Form
  return (
    <div className="flex flex-col w-10/12 max-w-2xl mx-auto p-4 gap-6">
      {/* Back Button */}
      <div>
        <button onClick={() => setStep("codeEntry")} className="text-b text-lg md:text-2xl">
          Back
        </button>
      </div>
      <h1 className="text-black text-2xl font-bold font-['Open Sans']">
        Join {carpoolDoc?.createCarpoolData.carpoolName}
      </h1>
      <p className="text-black text-lg font-bold font-['Open Sans']">Add Ride Information</p>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-md shadow-md p-4 flex flex-col gap-4"
      >
        {/* Riders */}
        <div className="flex flex-col gap-1">
          <label className="text-black text-xl font-bold font-['Open Sans']">Riders</label>
          <div className="flex gap-4">
            {riders.map((rider) => (
              <label key={rider.id} className="flex items-center gap-1 font-['Open Sans']">
                <input
                  type="checkbox"
                  checked={rider.selected}
                  onChange={() => handleRiderToggle(rider.id)}
                  className="form-checkbox h-5 w-5 text-[#4b859f]"
                />
                <span className="text-black">{rider.name}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Your Address */}
        <div className="flex flex-col gap-1">
          <label className="text-black text-xl font-bold font-['Open Sans']">Your Address</label>
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="p-2 border border-[#666666] rounded-md text-black"
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="p-2 border border-[#666666] rounded-md text-black"
          />
          <input
            type="text"
            placeholder="State"
            value={stateField}
            onChange={(e) => setStateField(e.target.value)}
            className="p-2 border border-[#666666] rounded-md text-black"
          />
          <input
            type="text"
            placeholder="Zip Code"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="p-2 border border-[#666666] rounded-md text-black"
          />
        </div>
        {/* Carpool Info */}
        <div className="flex flex-col gap-1">
          <label className="text-black text-xl font-bold font-['Open Sans']">
            {carpoolDoc?.createCarpoolData.carpoolName} Information
          </label>
          <p className="text-black">
            Occurs Every: {decodeDays(carpoolDoc?.createCarpoolData.carpoolDays || [])} <br />
            Time: {parseTimeFromNotes(carpoolDoc?.createCarpoolData.notes || "")}
          </p>
        </div>
        {/* Driving Availability */}
        <div className="flex flex-col gap-1">
          <label className="text-black text-xl font-bold font-['Open Sans']">
            Your Driving Availability
          </label>
          <div className="flex flex-wrap gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const selected = drivingAvailability.includes(day.value);
              return (
                <div
                  key={day.value}
                  onClick={() => toggleAvailability(day.value)}
                  className={`flex items-center justify-center rounded-full cursor-pointer text-lg ${
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
        {/* Car Capacity */}
        <div className="flex flex-col gap-1">
          <label className="text-black text-xl font-bold font-['Open Sans']">
            Car Capacity
          </label>
          <input
            type="number"
            placeholder="Enter capacity (max 8)"
            value={carCapacity}
            onChange={(e) => setCarCapacity(e.target.value)}
            className="p-2 border border-[#666666] rounded-md text-black"
            max={8}
          />
        </div>
        {/* Additional Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-black text-xl font-bold font-['Open Sans']">
            Additional Notes
          </label>
          <textarea
            placeholder="Enter comments, accommodations, etc."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="p-2 border border-[#666666] rounded-md text-black"
            rows={3}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`px-6 py-2 rounded-md text-white text-lg md:text-xl font-semibold font-['Open Sans'] ${
            isSubmitDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#4b859f] border border-[#4b859f]"
          }`}
        >
          Continue
        </button>
      </form>
    </div>
  );
}