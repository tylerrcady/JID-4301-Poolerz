"use client";

import React, { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  userId: string | undefined;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

// Helper function to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const CalendarView: React.FC<CalendarViewProps> = ({ userId }) => {
  // Set default date to the current date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Hardcoded events with an optional color property
  const events: CalendarEvent[] = [
    {
      title: "SkyZone",
      start: new Date(2025, 2, 29, 20, 0),
      end: new Date(2025, 2, 29, 22, 0),
      color: "orange",
    },
    {
      title: "Lunch",
      start: new Date(2025, 2, 31, 12, 0),
      end: new Date(2025, 2, 31, 13, 0),
      color: "skyblue",
    },
    // Add more events here...
  ];

  // Custom event styling using eventPropGetter
  const eventStyleGetter = (
    event: CalendarEvent,
  ) => {
    const backgroundColor = event.color || "#3174ad";
    const style = {
      backgroundColor,
      borderRadius: "5px",
      opacity: 0.8,
      color: "black",
      border: "0",
      display: "block",
    };
    return { style };
  };

  // Callback when an event is clicked
  const onSelectEvent = (event: CalendarEvent) => {
    alert(`Selected event: ${event.title}`);
  };

  // Keep calendar navigation in sync with our state
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  return (
    <div className="p-4">
      {/* Calendar Component */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK}
        date={currentDate}
        onNavigate={handleNavigate}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEvent}
        style={{ height: 500 }}
      />
    </div>
  );
};

export default CalendarView;