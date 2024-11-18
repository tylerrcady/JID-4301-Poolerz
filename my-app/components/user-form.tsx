// "use client";

// import React, { useState } from "react";



// interface UserFormProps {
//     userId: string | undefined;
// }


// const UserForm: React.FC<UserFormProps> = ({ userId }) => {
    
//     //interface for questions
//     interface Question {
//         id: string;
//         label: string;
//         type: string;
//         options?: string[];
//         page: number;
//     }

    
//     // questions for the form
//     const questions: Question[] = [
//         { id: "name", label: "Name", type: "text", page: 1 },
//         { id: "carModel", label: "Car Model", type: "text", page: 1 },
//         { id: "carCapacity", label: "Total Car Capacity", type: "number", page: 1 },
//         { id: "homeLocation", label: "Home Location", type: "text", page: 1 },
//     ]


    
    
//     // state variables
//     const [userFormData, setUserFormData] = useState("");
//     //const [userFormData, setUserFormData] = useState<Record<string, string | number>>({});
//     const [isLoading, setIsLoading] = useState(false);

//     //New state for dynamic form handling
//     const [currentPage, setCurrentPage] = useState(1);

//     const [dynamicFormData, setDynamicFormData] = useState<Record<string, string | number>>({});

    

    
//     //handle dynamic input changes
//     const handleDynamicInputChange = (id: string, value: string | number) => {
//         setDynamicFormData((prev) => ({ ...prev, [id]: value }));
//     };

//     // Handle input changes for all fields
//     // const handleInputChange = (id: string, value: string | number) => {
//     //     setUserFormData((prev) => ({ ...prev, [id]: value }));
//     // };



//     // POST user-form-data handler
//     const handleUserFormPost = async () => {
//         try {

//             const response = await fetch("/api/user-form-data", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     userId,
//                     userFormData,
//                     //dynamicFormData,
//                 }),
//             });

//             if (response.ok) {
//                 console.log("Success");
//                 console.log(dynamicFormData) //prints user form data still
//             } else {
//                 console.error("Failure: ", response.statusText);
//             }
//         } catch (error) {
//             console.error("Error: ", error);
//         }
//     };

//     const currentQuestions = questions.filter((q) => q.page === currentPage);

//     return (
//         <div className="flex items-center justify-center flex-col h-full w-full bg-w p-5 overflow-y-auto">
//             <h1>form for {userId}</h1>
//             {userId && (
//                 <>
//                     <input
//                         type="text"
//                         className="border"
//                         onChange={(e) => setUserFormData(e.target.value)}
//                     />


//                     {/* Dynamic form inputs */}
//                     {currentQuestions.map((q) => (
//                         <div key={q.id} className="mb-4">
//                             <label className="block text-sm font-medium mb-2">{q.label}</label>
//                             <input
//                                 type={q.type}
//                                 className="border p-2 w-full"
//                                 onChange={(e) => handleDynamicInputChange(q.id, e.target.value)}
//                             />
//                         </div>
//                     ))}

//                     {/* Navigation and submission buttons */}
//                     {/* <div className="flex justify-between w-full mt-4">
//                         {currentPage > 1 && (
//                         <button
//                             onClick={() => setCurrentPage((prev) => prev - 1)}
//                             className="px-4 py-2 bg-gray-300 rounded"
//                         >
//                             Previous
//                         </button>
//                         )}
//                         {currentPage < Math.max(...questions.map((q) => q.page)) && (
//                         <button
//                             onClick={() => setCurrentPage((prev) => prev + 1)}
//                             className="px-4 py-2 bg-blue-500 text-white rounded"
//                         >
//                             Next
//                         </button>
//                         )}
//                         {currentPage === Math.max(...questions.map((q) => q.page)) && (
//                         <button
//                             onClick={async (e) => {
//                             e.preventDefault();
//                             setIsLoading(true);
//                             await handleUserFormPost();
//                             setIsLoading(false);
//                             }}
//                             className="px-4 py-2 bg-green-500 text-white rounded"
//                         >
//                             {isLoading ? "Submitting..." : "Submit"}
//                         </button>
//                         )}
//                     </div> */}


//                     {!isLoading && (
//                         <button
//                             onClick={async (e) => {
//                                 e.preventDefault();
//                                 setIsLoading(true);
//                                 await handleUserFormPost();
//                                 setIsLoading(false);
//                             }}
//                         >
//                             post
//                         </button>
//                     )}
//                     {isLoading && <p>loading</p>}
//                 </>
//             )}
//         </div>
//     );
// };

// export default UserForm;

"use client";

import React, { useState } from "react";

const UserForm: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1); // Start with page 1
    const [numChildren, setNumChildren] = useState<number>(0); // Number of children
    const [childrenNames, setChildrenNames] = useState<string[]>([]); // Array to store children's names
    const [carCapacity, setCarCapacity] = useState<number>(0); // Total car capacity
    const [availabilities, setAvailabilities] = useState<{ day: string; timeRange: string }[]>([]); // Array to store availabilities


    // Handle changes for the number of children
    const handleNumChildrenChange = (value: string) => {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num >= 0 && num <= 5) {
            setNumChildren(num);
            setChildrenNames(Array(num).fill("")); // Initialize empty name fields
        }
    };

    // Handle changes for individual children's names
    const handleChildNameChange = (index: number, value: string) => {
        const updatedNames = [...childrenNames];
        updatedNames[index] = value;
        setChildrenNames(updatedNames);
    };

    // Handle car capacity input
    const handleCarCapacityChange = (value: string) => {
        const capacity = parseInt(value, 10);
        if (!isNaN(capacity) && capacity >= 0) {
            setCarCapacity(capacity);
        }
    };

    // Add a new availability entry
    const addAvailability = () => {
        setAvailabilities((prev) => [...prev, { day: "", timeRange: "" }]);
    };

    // Update a specific availability entry
    const updateAvailability = (index: number, key: "day" | "timeRange", value: string) => {
        const updatedAvailabilities = [...availabilities];
        updatedAvailabilities[index][key] = value;
        setAvailabilities(updatedAvailabilities);
    };

    // Move to the next page
    const handleContinue = () => {
        if (currentPage === 1 && numChildren === 0) {
            alert("Please enter a valid number of children.");
            return;
        }
        setCurrentPage(currentPage + 1);
    };

    return (
        <div className="flex items-center justify-center flex-col h-full w-full bg-gray-100 p-5">
            {currentPage === 1 && (
                <>
                    <h1 className="text-2xl font-bold mb-4">How many children do you have?</h1>
                    <input
                        type="number"
                        placeholder="Enter number of children"
                        className="border mb-4 p-2 w-full"
                        onChange={(e) => handleNumChildrenChange(e.target.value)}
                    />
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded w-full"
                        onClick={handleContinue}
                    >
                        Continue
                    </button>
                </>
            )}

            {currentPage === 2 && (
                <>
                    <h1 className="text-2xl font-bold mb-4">Enter your children's names</h1>
                    {Array.from({ length: numChildren }, (_, index) => (
                        <div key={index} className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Child {index + 1} Name
                            </label>
                            <input
                                type="text"
                                placeholder={`Child ${index + 1} Name`}
                                className="border p-2 w-full"
                                value={childrenNames[index] || ""}
                                onChange={(e) =>
                                    handleChildNameChange(index, e.target.value)
                                }
                            />
                        </div>
                    ))}
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded w-full"
                        onClick={handleContinue}
                    >
                        Continue
                    </button>
                </>
            )}

            {currentPage === 3 && (
                <>
                    <h1 className="text-2xl font-bold mb-4">Enter Car Details</h1>
                    <input
                        type="number"
                        placeholder="Enter car capacity"
                        className="border mb-4 p-2 w-full"
                        onChange={(e) => handleCarCapacityChange(e.target.value)}
                    />

                    <h2 className="text-xl font-bold mb-4">Add Availability</h2>
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded w-full mb-4"
                        onClick={addAvailability}
                    >
                        Add Availability
                    </button>

                    {availabilities.map((availability, index) => (
                        <div key={index} className="mb-4">
                            <label className="block text-sm font-medium mb-2">Day</label>
                            <select
                                className="border p-2 w-full mb-2"
                                value={availability.day}
                                onChange={(e) =>
                                    updateAvailability(index, "day", e.target.value)
                                }
                            >
                                <option value="">Select a day</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
                            </select>

                            <label className="block text-sm font-medium mb-2">Time Range</label>
                            <input
                                type="text"
                                placeholder="Enter time range (e.g., 9 AM - 5 PM)"
                                className="border p-2 w-full"
                                value={availability.timeRange}
                                onChange={(e) =>
                                    updateAvailability(index, "timeRange", e.target.value)
                                }
                            />
                        </div>
                    ))}

                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded w-full"
                        onClick={() => {
                            console.log("Form submitted:", {
                                numChildren,
                                childrenNames,
                                carCapacity,
                                availabilities,
                            });
                            alert("Form submitted! Check the console for details.");
                        }}
                    >
                        Submit
                    </button>
                </>
            )}

        </div>
    );
};

export default UserForm;

