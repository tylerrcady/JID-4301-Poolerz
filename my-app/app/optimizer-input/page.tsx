"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";


export default function OptimizerInput() {
  const [carpoolId, setCarpoolId] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const carpoolResponse = await fetch(`/api/create-carpool-data?carpoolId=${carpoolId}`);
      if (!carpoolResponse.ok) {
        throw new Error("Failed to fetch carpool data");
      }

      const carpoolData = await carpoolResponse.json();
      //console.log("Raw carpoolData from API:", carpoolData);

      
      const docArray = carpoolData.createCarpoolData;
      if (!Array.isArray(docArray) || docArray.length === 0) {
        throw new Error("No documents found in createCarpoolData array");
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
        const userCarpoolResponse = await fetch(`/api/join-carpool-data?userId=${userId}`);
        if (!userCarpoolResponse.ok) {
          throw new Error(`Failed to fetch user data for ${userId}`);
        }
        return userCarpoolResponse.json();
      });
      const userCarpoolResults = await Promise.all(userCarpoolPromises);
      //console.log(userResults)

      // acces user-data
      const formPromises = members.map(async (userId: string) => {
        const formResponse = await fetch(`/api/user-form-data?userId=${userId}`);
        if (!formResponse.ok) {
          throw new Error(`Failed to fetch user data for ${userId}`);
        }
        return formResponse.json();
      });
      const formResults = await Promise.all(formPromises);
      //console.log(formResults)

    
      const optimizerInput = {
        carpoolId: doc.carpoolID,
        carpoolName: ccd.carpoolName,
        carpoolLocation: ccd.carpoolLocation || {},
        carpoolDays: ccd.carpoolDays || [],
        carpoolMembers: members.map((member: string, i: number) => i + 1),
        
        availabilities: members.map((member: string, i: number) => {
            const userCarpoolData = userCarpoolResults[i]?.createCarpoolData?.userData;
            if (!userCarpoolData) {
              return {
                userId: members[i],
                availability: []
              };
            }
          
            // search users carpools to find this carpool
            const matchingCarpool = userCarpoolData.carpools?.find(
              (c: any) => c.carpoolId === doc.carpoolID
            );
          
            // if found, take the driving availability
            const availability = matchingCarpool?.drivingAvailability || [];
          
            return {
              userId: members[i], 
              availability
            };
          }),
        users: members.map((member: string, i: number) => {
          const formData = formResults[i]?.userFormData || {};
          
          return {
            userId: formData.userId, 
            name: session?.user?.name,
            numchildren: formData.userFormData.numChildren || 0,
            children: Array.isArray(formData.userFormData.children)
                ? formData.userFormData.children.map((child: any) => child.name)
                : [],
            carCapacity:  formData.userFormData.carCapacity || 0, //! pulls from form data, not sure if we want from userCarpoolData
            location: {
              address: formData.userFormData.location?.address || "",
              city: formData.userFormData.location?.city || "",
              state: formData.userFormData.location?.state || "",
              zipCode: formData.userFormData.location?.zipCode || ""
            }
          };
        })
      };

      
      console.log("Optimizer Input:", JSON.parse(JSON.stringify(optimizerInput)));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Optimizer Input Generator</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="carpoolId" className="block text-sm font-medium text-gray-700">
                Carpool ID
              </label>
              <input
                type="text"
                id="carpoolId"
                value={carpoolId}
                onChange={(e) => setCarpoolId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter carpool ID"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Loading..." : "Generate Optimizer Input"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
