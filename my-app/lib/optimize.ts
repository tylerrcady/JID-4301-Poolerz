// example-usage.ts
import { optimizeCarpools } from "@/optimizer/optimizer";

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
                            carCapacity: formData.userFormData.carCapacity || 0, //! pulls from form data, not sure if we want from userCarpoolData
                            location: {
                                address:
                                    formData.userFormData.location?.address ||
                                    "",
                                city:
                                    formData.userFormData.location?.city || "",
                                state:
                                    formData.userFormData.location?.state || "",
                                zipCode:
                                    formData.userFormData.location?.zipCode ||
                                    "",
                            },
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
        return {
            initialClusters: results.initialClusters,
            validatedClusters: results.validatedClusters,
            finalClusters: results.finalClusters,
            unclusteredUsers: results.unclusteredUsers,
        };
    }

    const data = await getInput();
    return await run(data); // run the example and return the results
}
