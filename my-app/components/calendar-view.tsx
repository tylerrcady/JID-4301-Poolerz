"use client";

import React, { useState } from "react";

interface CalendarViewProps {
    userId: string | undefined;
}

interface Event {
    id: number;
    day: string;
    time: string;
    title: string;
  }

const CalendarView: React.FC<CalendarViewProps> = ({ userId }) => {
    // Hardcoded sample events
    const events: Event[] = [
      { id: 1, day: "Monday", time: "09:00", title: "Team Meeting" },
      { id: 2, day: "Wednesday", time: "11:00", title: "Client Call" },
      { id: 3, day: "Friday", time: "14:00", title: "Project Review" },
    ];
  
    // Define the days of the week and time slots
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
  
    // State to track the currently selected event
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Scheduler</h1>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Time</th>
              {days.map((day) => (
                <th key={day} className="border p-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr key={time}>
                <td className="border p-2">{time}</td>
                {days.map((day) => {
                  // Check if there is an event for this day and time
                  const event = events.find((e) => e.day === day && e.time === time);
                  return (
                    <td key={day} className="border p-2">
                      {event ? (
                        <div
                          className="bg-blue-500 text-white p-1 rounded cursor-pointer"
                          onClick={() => setSelectedEvent(event)}
                        >
                          {event.title}
                        </div>
                      ) : (
                        <div className="h-8" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {selectedEvent && (
          <div className="mt-4 p-2 border rounded">
            <h2 className="font-bold">Event Details</h2>
            <p>Title: {selectedEvent.title}</p>
            <p>
              Scheduled on: {selectedEvent.day} at {selectedEvent.time}
            </p>
            <button
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    );
  };
  
  export default CalendarView;