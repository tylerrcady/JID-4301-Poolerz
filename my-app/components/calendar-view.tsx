"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Loading from "./icons/Loading";
import AgendaSection from "@/components/agenda-view";

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
    userId: string | undefined;
}

interface CarpoolOptMapping {
    carpoolId: string;
    data: TransformedResults;
}

const CalendarView: React.FC<CalendarViewProps> = ({ userId }) => {
    const [events, setEvents] = useState<CarpoolCalendarEvent[]>([]);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [view, setView] = useState<View>(Views.WEEK);
    const WEEKS_TO_GENERATE = 16; // hardcoded but represents how many weeks this carpool will take place
    const defaultStartTime = "00:00";
    const defaultEndTime = "01:00";
    const [loading, setLoading] = useState<boolean>(true);

    // Get Handler for receiving all the carpoolIDs from user-carpool-data
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
                const foundCarpools =
                    data?.createCarpoolData?.[0]?.userData?.carpools || [];
                const filterCarpoolIds: string[] = foundCarpools.map(
                    (cp: any) => cp.carpoolId
                );
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
        const carpoolIds = await handleUserDataGet(); // Gets carpoolIds belonging to user
        if (!carpoolIds || carpoolIds.length === 0) {
            return;
        }

        // For each carpoolId, fetch the optimization results
        const carpoolPromises = carpoolIds.map(async (carpoolId) => {
            const result = await checkCarpoolWithOptResults(carpoolId);
            if (result) {
                // Return an object {carpoolId, data: ...}
                return {
                    carpoolId,
                    data: result,
                } as CarpoolOptMapping;
            }
            return null;
        });

        const resolved = await Promise.all(carpoolPromises);

        // Filter out null entries (where result === null)
        const finalCarpools = resolved.filter(
            (item): item is CarpoolOptMapping => item !== null
        );
        console.log(finalCarpools);
        return finalCarpools;
    }, []);

    // If you want the result type to be { carpoolId: string, schedule: Record<string, string> }[]
    type SchedulesMapping = Array<{
        carpoolId: string;
        schedule: Record<string, string>;
    }>;

    // Helper method that fetches driving schedules from user's carpool groups
    const receiveDrivingSchedules = (
        results: CarpoolOptMapping[] | undefined
    ): SchedulesMapping | undefined => {
        if (!results) return undefined;

        // ex. schedules looks like: { carpoolId: "abc123", schedule: { "1": "userId", "2": "otherUserId", ... } }
        const schedules: SchedulesMapping = [];

        console.log("Carpools we are extracting from: ", results);

        for (const result of results) {
            const { carpoolId, data } = result;

            for (const carpool of data.carpools || []) {
                const userIsInCarpool = carpool.members?.some(
                    (memberPair) => memberPair[0] === userId
                );

                if (userIsInCarpool) {
                    schedules.push({
                        carpoolId,
                        schedule: carpool.driverSchedule,
                    });
                    break; // move on to next result after finding the first match
                }
            }
        }

        console.log("Driving Schedules: ", schedules);
        return schedules;
    };

    // Method takes in the schedule and transforms it into a calendar event
    const createCarpoolCalendarEvents = async (
        schedules: SchedulesMapping | undefined
    ) => {
        if (schedules) {
            const newEvents: CarpoolCalendarEvent[] = [];
            let colorIndex = 0;
            for (const schedule of schedules || []) {
                console.log(schedule.schedule);

                // creates event based on schedule using helper method
                const event = await helperCreateEvent(
                    schedule.schedule,
                    schedule.carpoolId,
                    colorIndex
                );
                newEvents.push(...event);
                colorIndex += 1;
            }
            setEvents(newEvents);
        }
    };

    // Gets Carpool Name and start/end time given carpoolId
    async function fetchCarpoolMeta(carpoolId: string) {
        try {
            const response = await fetch(
                `/api/create-carpool-data?carpoolId=${carpoolId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                const foundData = data?.createCarpoolData[0].createCarpoolData;
                console.log(foundData);
                let name = foundData.carpoolName;
                let start = foundData.startTime || defaultStartTime;
                let end = foundData.endTime || defaultEndTime;

                return [name, start, end];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    const optimizerDayMap: Record<string, number> = {
        "0": 0,
        "1": 1, // Monday
        "2": 2, // Tuesday
        "3": 3, // Wednesday
        "4": 4, // Thursday
        "5": 5, // Friday
        "6": 6, // Saturday
        "7": 0, // Sunday (0 in moment)
    };

    const availableColors = [
        "skyblue",
        "#6BCB77", // green
        "#A66DD4",
        "pink",
        "#FF6B6B", // red-ish
        "#FFD93D", // yellow
        "#FF8C42", // orange
    ];

    // Helper method to create calendar event
    const helperCreateEvent = async (
        schedule: Record<string, string>,
        carpoolID: string,
        colorIndex: number
    ): Promise<CarpoolCalendarEvent[]> => {
        const resultEvents: CarpoolCalendarEvent[] = [];

        // receive carpoolName and start/end time if applicable
        const [carpoolName, startTime, endTime] = (await fetchCarpoolMeta(
            carpoolID
        )) ?? ["", defaultStartTime, defaultEndTime];
        console.log(carpoolName);
        console.log(startTime);

        // parse time into hours and minutes
        const [hoursStr, minutesStr] = startTime.split(":");
        const hoursStart = parseInt(hoursStr, 10);
        const minutesStart = parseInt(minutesStr, 10);

        const [hours2Str, minutes2Str] = endTime.split(":");
        const hoursEnd = parseInt(hours2Str, 10);
        const minutesEnd = parseInt(minutes2Str, 10);

        console.log(hoursStart, minutesStart);
        console.log(hoursEnd, minutesEnd);

        Object.keys(schedule).forEach((dayKey) => {
            const dayOfWeek = optimizerDayMap[dayKey];
            const assignedColor =
                availableColors[colorIndex % availableColors.length];
            for (let i = 0; i < WEEKS_TO_GENERATE; i++) {
                let base = moment().startOf("day");
                let eventDate = base.clone().day(dayOfWeek).add(i, "weeks");

                const start = eventDate
                    .clone()
                    .hour(hoursStart)
                    .minute(minutesStart)
                    .toDate();
                const end = eventDate
                    .clone()
                    .hour(hoursEnd)
                    .minute(minutesEnd)
                    .toDate();

                const userDriving: boolean =
                    userId === schedule[dayKey] ? true : false;
                // console.log(userDriving);
                resultEvents.push({
                    title: carpoolName,
                    start,
                    end,
                    color: assignedColor,
                    isDriving: userDriving,
                });
            }
        });

        return resultEvents;
    };

    // Handler receives the driving schedules
    useEffect(() => {
        const receiveEvents = async () => {
            setLoading(true);
            const finalCarpools = await fetchCarpoolsWithOpt(); // Gets carpool data with optimization results
            const schedules = receiveDrivingSchedules(finalCarpools);
            await createCarpoolCalendarEvents(schedules);
            setLoading(false);
        };
        receiveEvents();
        console.log(events);
    }, []);

    // Custom event styling using eventPropGetter -- helps us add color
    const eventStyleGetter = (event: CarpoolCalendarEvent) => {
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

    // Callback when an event is clicked -- will later handle this more elegantly
    const onSelectEvent = (event: CarpoolCalendarEvent) => {
        alert(`Selected event: ${event.title}`);
    };

    // Keep calendar navigation in sync with our state -- Responsible for Back and Next Events working
    const handleNavigate = (newDate: Date) => {
        setCurrentDate(newDate);
    };

    // Default start times to display
    const scrollToTime = moment().startOf("day").hour(8).toDate();

    return (
        <div className="flex flex-col w-full h-full px-4 md:px-8">
            {!loading ? (
                <div className="flex justify-center items-center w-full flex-grow">
                    <Loading />
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-6 h-full">
                    <div className="mt-5 w-full md:w-3/5 lg:w-2/3 h-[50vh] md:h-[85vh] scrollbar-custom">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            views={[Views.MONTH, Views.WEEK, Views.DAY]}
                            defaultView={view}
                            view={view}
                            onView={(view) => setView(view)}
                            date={currentDate}
                            onNavigate={handleNavigate}
                            eventPropGetter={eventStyleGetter}
                            onSelectEvent={onSelectEvent}
                            style={{ height: "100%", color: "#000000" }}
                            scrollToTime={scrollToTime}
                        />
                    </div>
                    <div className="w-full md:w-2/5 overflow-hidden mt-5 md:mt-0 mb-5 h-full">
                        <AgendaSection events={events} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
