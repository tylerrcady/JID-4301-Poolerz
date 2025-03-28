"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { RRule } from "rrule";

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  userId: string | undefined;
}

// created to match hardcoded event
interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  color?: string;
  rRule?: string,
}

// carpool calendar event
interface CarpoolCalendarEvent {
  title: string;
  day: Number;
}

// Helper function to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const CalendarView: React.FC<CalendarViewProps> = ({ userId }) => {
  // Set default date to the current date
  userId = "67d3358e45ee3c027f8e59ce"; // DELETE line later, will use for testing rn
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Get Handler for receiving all the carpools from user-carpool-data
  const handleUserDataGet = useCallback(async () => {
    try {
        const response = await fetch(
            `/api/join-carpool-data?userId=${userId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (response.ok) {
            const data = await response.json();
            const foundCarpools = data?.createCarpoolData.userData.carpools || [];
            // extract the carpoolIds
            const filterCarpoolIds: string[] = foundCarpools.map((cp: any) => cp.carpoolId);
            console.log(filterCarpoolIds);
            return filterCarpoolIds;
        } else {
            console.error("Failed to fetch data:", response.statusText);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
  }, [userId]);

  // Handler returns optimizer results found from given carpoolId
  const checkCarpoolWithOptResults = useCallback(
    async (carpoolId: string) => {
        try {
            const response = await fetch(
                `/api/optimization-results?carpoolId=${carpoolId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                //console.log(data?.results); // Return the fetched data
                if (!data?.results) {
                  return null;
                }  
                return data?.results;
            }
        } catch (error) {
            console.error(
                `Error fetching data for carpoolId ${carpoolId}:`,
                error
            );
        }
        return null; // Return null if there's an error
    },
    []
  );

  // Method coordinates receiving the carpools with optimization results
  const fetchCarpoolsWithOpt = useCallback(async () => {
    const carpoolIds = await handleUserDataGet();

    if (!carpoolIds || carpoolIds.length === 0) {
      return;
    }

    // Filter so that only carpoolIds with opt results remain
    const carpoolPromises = carpoolIds.map(async (carpoolId) => {
      const result = await checkCarpoolWithOptResults(carpoolId);
      return result || null;
    });

    const resolved = await Promise.all(carpoolPromises);

    const finalCarpools = resolved.filter(
      (res): res is TransformedResults => res !== null
    );

    return finalCarpools;
  }, []);

  // Helper method that fetches driving schedules from user's carpool groups
  const receiveDrivingSchedules = (results: TransformedResults[] | undefined): Record<string, string>[] | null => {
    const schedules: Record<string, string>[] = [];
    console.log("Carpools we are extracting from: ", results);
    for (const result of results || []) {
      for (const carpool of result.carpools || []) {
        const userIsInCarpool = carpool.members?.some(
          (memberPair) => memberPair[0] === userId
        );
    
        if (userIsInCarpool) {
          schedules.push(carpool.driverSchedule);
          break; // move on to next result after finding the first match
        }
      }
    }
    console.log("Driving Schedules: ", schedules);
    return schedules;
  }

  // Handler receives the driving schedules
  useEffect(() => {
    const receiveEvents = async () => {
      const finalCarpools = await fetchCarpoolsWithOpt();
      const schedules = receiveDrivingSchedules(finalCarpools); // consider making results a local non-State variable
    };

    receiveEvents();
  }, []);


  // Hardcoded events with an optional color property
  const events: CalendarEvent[] = [
    {
      title: "SkyZone",
      start: new Date(2025, 2, 28, 20, 0),
      end: new Date(2025, 2, 28, 22, 0),
      color: "orange",
      rRule: 'RRULE:FREQ=WEEKLY;BYDAY=FR',
    },
    {
      title: "Lunch",
      start: new Date(2025, 2, 26, 12, 0),
      end: new Date(2025, 2, 26, 13, 0),
      color: "skyblue",
      rRule: 'RRULE:FREQ=WEEKLY;BYDAY=WE',
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