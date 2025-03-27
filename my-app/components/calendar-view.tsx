"use client";

import React from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

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
    const events = [
        {
          title: 'Meeting',
          start: new Date(2025, 5, 25, 10, 0),
          end: new Date(2025, 5, 25, 11, 0),
        },
        // more events...
      ];
      return (
        <div style={{ height: 500 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView="week"
          />
        </div>
      );
    
    };
    
    export default CalendarView;