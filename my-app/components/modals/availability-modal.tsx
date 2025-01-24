import React, { useState } from "react";

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (day: string, timeRange: string) => void;
}

const AvailabilityModal: React.FC<AvailabilityModalProps> = ({ isOpen, onClose, onSave }) => {
  const [day, setDay] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>("09:00-17:00");

  const handleSave = () => {
    if (day.trim() && timeRange.trim()) {
      onSave(day, timeRange);
      setDay("");
      setTimeRange("09:00-17:00");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-1/3 p-6 rounded shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-black">Add Availability</h3>
          <button
            onClick={onClose}
            className="text-black bg-transparent border-none text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Day</label>
          <select
            className="border p-2 w-full mb-2 rounded"
            value={day}
            onChange={(e) => setDay(e.target.value)}
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
          {day.trim() === "" && (
            <p className="block text-sm font-medium text-red-500">
              Please select a day.
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Time Range</label>
          <input
            type="text"
            placeholder="HH:MM - HH:MM"
            className="border p-2 w-full rounded"
            value={timeRange}
            pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$"
            title="Please enter a time range in the format HH:MM-HH:MM (e.g., 09:00-17:00)"
            onChange={(e) => setTimeRange(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="text-black bg-transparent border py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;