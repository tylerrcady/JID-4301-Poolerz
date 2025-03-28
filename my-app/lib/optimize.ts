// example-usage.ts
import { optimizeCarpools } from "@/optimizer/optimizer";

export function extractTimeInfo(carpoolDoc: any) {
    let startTime = "";
    let endTime = "";
    
    if (carpoolDoc?.startTime && carpoolDoc?.endTime) {
        startTime = carpoolDoc.startTime;
        endTime = carpoolDoc.endTime;
    } else if (carpoolDoc?.notes) {
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

export async function Optimizer(carpoolId: string) {
    async function getInput() {
        try {
            const carpoolResponse = await fetch(
                `/api/create-carpool-data?carpoolId=${carpoolId}`
            );
            if (!carpoolResponse.ok) {
                throw new Error("Failed to fetch carpool data");
            }

            const carpoolData = await carpoolResponse.json();

            const docArray = carpoolData.createCarpoolData;
            if (!Array.isArray(docArray) || docArray.length === 0) {
                throw new Error(
                    "No documents found in createCarpoolData array"
                );
            }

            const doc = docArray[0];
            if (!doc) {
                throw new Error("Carpool doc is missing");
            }

            if (!doc.createCarpoolData) {
                throw new Error("doc.createCarpoolData is missing");
            }

            const ccd = doc.createCarpoolData;

            if (!Array.isArray(ccd.carpoolMembers)) {
                throw new Error("Carpool members missing or invalid");
            }
            const members = ccd.carpoolMembers;

            // Extract time information using our helper
            const { startTime, endTime } = extractTimeInfo(ccd);

            // access user-carpool-data
            const userCarpoolPromises = members.map(async (userId: string) => {
                const userCarpoolResponse = await fetch(
                    `/api/join-carpool-data?userId=${userId}`
                );
                if (!userCarpoolResponse.ok) {
                    throw new Error(`Failed to fetch user data for ${userId}`);
                }
                return userCarpoolResponse.json();
            });
            const userCarpoolResults = await Promise.all(userCarpoolPromises);

            // acces user-data
            const formPromises = members.map(async (userId: string) => {
                const formResponse = await fetch(
                    `/api/user-form-data?userId=${userId}`
                );
                if (!formResponse.ok) {
                    throw new Error(`Failed to fetch user data for ${userId}`);
                }
                return formResponse.json();
            });
            const formResults = await Promise.all(formPromises);

            const optimizerInput = {
                carpoolId: doc.carpoolID,
                carpoolName: ccd.carpoolName,
                carpoolLocation: ccd.carpoolLocation || {},
                carpoolDays: ccd.carpoolDays || [],
                startTime,
                endTime,
                carpoolMembers: members.map(
                    (member: string, i: number) => i + 1
                ),

                availabilities: members.map((member: string, i: number) => {
                    const userCarpoolData =
                        userCarpoolResults[i]?.createCarpoolData?.userData;
                    if (!userCarpoolData) {
                        return {
                            userId: members[i],
                            availability: [],
                        };
                    }

                    // search users carpools to find this carpool
                    const matchingCarpool = userCarpoolData.carpools?.find(
                        (c: any) => c.carpoolId === doc.carpoolID
                    );

                    // if found, take the driving availability
                    const availability =
                        matchingCarpool?.drivingAvailability || [];

                    return {
                        userId: members[i],
                        availability,
                    };
                }),
                users: await Promise.all(
                    members.map(async (member: string, i: number) => {
                        const userCarpoolData =
                            userCarpoolResults[i]?.createCarpoolData?.userData || {};
                        const formData = formResults[i]?.userFormData || {};

                        const nameResponse = await fetch(
                            `/api/name?userId=${member}`
                        );
                        if (!nameResponse.ok) {
                            throw new Error(
                                `Failed to fetch name for ${member}`
                            );
                        }
                        const nameData = await nameResponse.json();

                        const matchingCarpool = userCarpoolData.carpools?.find(
                            (c: any) => c.carpoolId === doc.carpoolID
                        );
                
                        // Extract carCapacity and location from the matching carpool
                        const carCapacity = matchingCarpool?.carCapacity || 0;
                        const location = {
                            address: userCarpoolData?.userLocation?.address || "",
                            city: userCarpoolData?.userLocation?.city || "",
                            state: userCarpoolData?.userLocation?.state || "",
                            zipCode: userCarpoolData?.userLocation?.zipCode || "",
                        };

                        return {
                            userId: formData.userId,
                            name: nameData.name,
                            numchildren: formData.userFormData.numChildren || 0,
                            children: Array.isArray(
                                formData.userFormData.children
                            )
                                ? formData.userFormData.children.map(
                                      (child: any) => child.name
                                  )
                                : [],
                            //carCapacity: userCarpoolData.carCapacity || 0, //! pulls from form data, not sure if we want from userCarpoolData
                            carCapacity,
                            location
                        };
                    })
                ),
            };

            return JSON.parse(JSON.stringify(optimizerInput));
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function run(data: any) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // update to utilize env var instead of raw string
        if (!apiKey) {
            throw new Error('Google Maps API key is not configured');
        }
        const results = await optimizeCarpools(data, apiKey); // call and return the optimizer & its outputs
        
        // Add time information to the results without changing optimizer logic
        return {
            ...results,
            timeInfo: {
                startTime: data.startTime || "",
                endTime: data.endTime || ""
            }
        };
    }

    const data = await getInput();
    console.log("Data:", data);
    return await run(data); // run the example and return the results
}
