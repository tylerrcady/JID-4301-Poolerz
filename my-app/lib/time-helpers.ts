// Time display helper functions (made to display start and end times respectively in the optimization results)

/**
 * Extracts start and end time information from a given carpool document.
 *
 * This function first checks for direct time fields ("startTime" and "endTime") within the carpool document.
 * If these fields exist, it uses their values. If they are absent, it then checks if a "notes" field is available
 * and attempts to parse a time range from it using a regular expression.
 *
 * @param carpoolDoc - the carpool document object that may include time information either as separate fields or embedded in the notes
 * @returns an object containing "startTime" and "endTime" as strings. If no valid time info is found, both strings will be empty
 */
export function getTimeInfo(carpoolDoc: any): { startTime: string, endTime: string } {
    let startTime = "";
    let endTime = "";
    
    if (carpoolDoc?.startTime && carpoolDoc?.endTime) {
        startTime = carpoolDoc.startTime;
        endTime = carpoolDoc.endTime;
    } else if (carpoolDoc?.notes) {
        // attempt to extract the time range from the "notes" field using regex pattern (probably don't need this especially once we figure out time formatting issue)
        try {
            const timeMatch = carpoolDoc.notes.match(/Times: [A-Za-z]+: (\d+:\d+)-(\d+:\d+)/);
            if (timeMatch && timeMatch.length >= 3) {
                startTime = timeMatch[1];
                endTime = timeMatch[2];
            }
        } catch (e) {
            console.error("Error extracting time from notes:", e);
        }
    }
    
    return { startTime, endTime };
}

/**
 * Formats the provided start and end time strings into a single display string.
 *
 * If both "startTime" and "endTime" are non-empty, it returns a concatenated string in the format "startTime - endTime".
 * If either time is missing, it returns a default message "Time not available" to indicate incomplete time data.
 *
 * @param startTime - the start time as a string (e.g., "08:00").
 * @param endTime - the end time as a string (e.g., "10:00").
 * @returns a formatted time range string or a fallback message if time information is incomplete
 */
export function formatTimeForDisplay(startTime?: string, endTime?: string): string {
    if (startTime && endTime) {
        return `${startTime} - ${endTime}`;
    }
    return "Time not available";
}

/**
 * Generates a formatted time display string directly from a carpool document.
 *
 * This helper function first extracts the time information from the carpool document by calling "getTimeInfo".
 * It then formats the extracted start and end times using "formatTimeForDisplay".
 * This abstraction simplifies obtaining a user-friendly time string from the raw carpool document.
 *
 * @param carpoolDoc - the carpool document that contains time details
 * @returns a formatted string representing the time range (or a default message if time data is missing)
 */
export function getCarpoolTimeDisplay(carpoolDoc: any): string {
    const { startTime, endTime } = getTimeInfo(carpoolDoc);
    return formatTimeForDisplay(startTime, endTime);
}