import moment from "moment";

const AgendaSection = ({ events }: { events: CarpoolCalendarEvent[] }) => {
    const today = moment();
    const oneWeekFromNow = moment().add(6, "days");

    // 2) Filter events to only those in [today, today+14days]
    const upcomingEvents = events
        .filter((event) => {
            const eventStart = moment(event.start);
            // Include event if it starts on or after today AND on/before oneWeekFromNow
            return (
                eventStart.isSameOrAfter(today, "day") &&
                eventStart.isSameOrBefore(oneWeekFromNow, "day")
            );
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime());
    console.log(upcomingEvents);

    // 3) Group by date key
    const groupedEvents = upcomingEvents.reduce((acc, event) => {
        const dateKey = moment(event.start).format("YYYY-MM-DD");
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(event);
        return acc;
    }, {} as Record<string, CarpoolCalendarEvent[]>);


    return (
        <div className="w-full md:w-2/5 mt-6 md:mt-0 bg-white rounded-lg px-4 py-4 font-sans text-black">
            <h2 className="text-2xl font-semibold mb-4 text-black">Upcoming Weeks</h2>

            <div className="flex flex-col gap-6 overflow-y-scroll h-96">
                {Object.entries(groupedEvents).map(([date, dailyEvents], index) => (
                    <div key={index} className="flex flex-col gap-4">
                        {/* Date heading */}
                        <div className="text-left text-sm font-semibold leading-tight">
                            <div>{moment(date).format("MMMM D")}</div>
                            <div className="text-xs font-normal">
                                {moment(date).format("dddd")}
                            </div>
                        </div>

                        {/* Events for this day */}
                        {dailyEvents.map((event, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: event.color || "#ccc" }}
                                        />
                                        <span className="text-sm font-semibold">{event.title}</span>
                                    </div>
                                    <span className="text-xs font-normal">
                                        {moment(event.start).format("h:mm")} - {moment(event.end).format("h:mm a")}
                                    </span>
                                </div>

                                {/* Driving role (if needed) */}
                                {event.isDriving && (
                                    <div className="text-xs text-black">You are Driving</div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgendaSection;