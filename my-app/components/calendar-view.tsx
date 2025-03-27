"use client";

import React from "react";

interface CalendarViewProps {
    userId: string | undefined;
}

// A simple interface for our hardcoded events
interface CalendarEvent {
    day: string;      // e.g. "Mon 25"
    start: number;    // e.g. 9 for 9:00 AM
    end: number;      // e.g. 11 for 11:00 AM
    title: string;
    color: string;    // Tailwind class, e.g. "bg-green-300"
  }
  
  const CalendarView: React.FC<CalendarViewProps> = ({ userId }) => {
    // Days in our schedule (matching the screenshot’s format)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
    // Hourly timeslots from 9:00 to 14:00 (9 AM – 2 PM)
    // (Change or expand for half-hour increments or a longer day)
    const times = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  
    // Hardcoded sample events. 
    // "start" and "end" are in “whole hours,” so rowSpan = end - start
    const events: CalendarEvent[] = [
      { day: "Sun", start: 9, end: 10, title: "Book Flights", color: "bg-pink-200" },
      { day: "Mon", start: 9, end: 11, title: "Website Redesign", color: "bg-green-200" },
      { day: "Mon", start: 11, end: 13, title: "Approve Layouts", color: "bg-orange-200" },
      { day: "Wed", start: 9, end: 10, title: "Install New Server", color: "bg-green-200" },
      { day: "Wed", start: 11, end: 12, title: "Client Call", color: "bg-orange-200" },
      { day: "Fri", start: 12, end: 14, title: "Final Budget Review", color: "bg-purple-200" },
    ];
  
    // We'll track which cells are already "occupied" by a multi-hour event,
    // so we don’t render overlapping <td> cells.
    // skipMap[day][rowIndex] = true means “this row is occupied/skipped.”
    const skipMap: Record<string, boolean[]> = {};
    days.forEach((day) => {
      skipMap[day] = Array(times.length).fill(false);
    });
  
    // A helper to find an event that starts at (day, hour).
    function findEvent(day: string, hour: number): CalendarEvent | undefined {
      return events.find((ev) => ev.day === day && ev.start === hour);
    }
  
    return (
        <div className="p-4">
          {/* HEADER SECTION */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-700 font-semibold text-lg">
              Carpooling Schedule
            </div>
            <div className="flex items-center space-x-2">
              <button className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-sm md:text-base">
                Toggle View
              </button>
            </div>
          </div>
    
          {/* WRAPPER WITH HORIZONTAL SCROLL FOR TABLE */}
          <div className="w-full overflow-x-auto">
            <table className="table-auto w-full min-w-max border-collapse">
              {/* Table Header with Days */}
              <thead>
                <tr className="bg-gray-100 text-sm md:text-base">
                  <th className="border p-2 w-16 text-right"></th>
                  {days.map((day) => (
                    <th key={day} className="border p-2 text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
    
              {/* Table Body with Time Rows */}
              <tbody>
                {times.map((hour, rowIndex) => (
                  <tr key={hour} className="text-sm md:text-base">
                    {/* Left Column: Time Label */}
                    <td className="border p-2 w-16 text-right align-top">
                      {`${hour}:00`}
                    </td>
    
                    {/* Day Columns */}
                    {days.map((day) => {
                      // If we already marked this row as occupied for this day, skip
                      if (skipMap[day][rowIndex]) {
                        return null;
                      }
    
                      // Check if there's an event that starts at this day & hour
                      const event = findEvent(day, hour);
                      if (event) {
                        // Calculate how many hours the event spans
                        const rowSpan = event.end - event.start;
    
                        // Mark subsequent rows as occupied
                        for (let i = 0; i < rowSpan; i++) {
                          if (rowIndex + i < times.length) {
                            skipMap[day][rowIndex + i] = true;
                          }
                        }
    
                        // Render a cell that spans multiple rows
                        return (
                          <td
                            key={day}
                            rowSpan={rowSpan}
                            className={`border p-2 align-top ${event.color} relative`}
                          >
                            <div className="font-semibold">{event.title}</div>
                            <div className="text-xs text-gray-700">
                              {`${event.start}:00 - ${event.end}:00`}
                            </div>
                          </td>
                        );
                      } else {
                        // No event at this time → render an empty cell
                        return <td key={day} className="border p-2" />;
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };
    
    export default CalendarView;