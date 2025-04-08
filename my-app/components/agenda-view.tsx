import moment from "moment";
import React from "react";

const AgendaSection = ({ events }: { events: CarpoolCalendarEvent[] }) => {
    // Group events by day
    const upcomingEvents = events
        .filter((event) => event.start >= new Date())
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    const groupedEvents = upcomingEvents.reduce((acc, event) => {
        const dayKey = moment(event.start).format("YYYY-MM-DD");
        if (!acc[dayKey]) acc[dayKey] = [];
        acc[dayKey].push(event);
        return acc;
    }, {} as Record<string, CarpoolCalendarEvent[]>);

    return (
        <div className="w-full md:w-1/3 bg-gray-100 p-4 rounded-lg max-h-[500px] overflow-y-auto">
            <div className="text-center text-black text-2xl font-semibold mb-6">
                This Week
            </div>

            <div className="flex flex-col gap-8">
                {Object.entries(groupedEvents).map(([date, dailyEvents]) => (
                    <div key={date} className="flex flex-col gap-6">
                        <div className="text-xs font-semibold">
                            <span className="block text-black">
                                {moment(date).format("MMMM D")}
                            </span>
                            <span className="block text-[10px] font-normal text-black">
                                {moment(date).format("dddd")}
                            </span>
                        </div>

                        {dailyEvents.map((event, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col gap-2 border-b pb-2"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    event.color || "#ccc",
                                            }}
                                        />
                                        <div className="text-sm font-semibold text-black">
                                            {event.title}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-black">
                                        {moment(event.start).format("h")} -{" "}
                                        {moment(event.end).format("h a")}
                                    </div>
                                </div>
                                <div className="text-[10px] text-black">
                                    You are driving
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default AgendaSection;
