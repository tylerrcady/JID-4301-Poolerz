"use client";

import React, { useState } from "react";



interface UserFormProps {
    userId: string | undefined;
}


const UserForm: React.FC<UserFormProps> = ({ userId }) => {
    
    // interface for questions
    interface Question {
        id: string;
        label: string;
        type: string;
        options?: string[];
        page: number;
    }
    
    // questions for the form
    const questions: Question[] = [
        { id: "name", label: "Name", type: "text", page: 1 },
        { id: "carModel", label: "Car Model", type: "text", page: 1 },
        { id: "carCapacity", label: "Total Car Capacity", type: "number", page: 1 },
        { id: "homeLocation", label: "Home Location", type: "text", page: 1 },
    ]
    
    
    // state variables
    const [userFormData, setUserFormData] = useState("");
    //const [userFormData, setUserFormData] = useState<Record<string, string | number>>({});
    const [isLoading, setIsLoading] = useState(false);

    //New state for dynamic form handling
    const [currentPage, setCurrentPage] = useState(1);
    const [dynamicFormData, setDynamicFormData] = useState<Record<string, string | number>>({});

    
    //handle dynamic input changes
    const handleDynamicInputChange = (id: string, value: string | number) => {
        setDynamicFormData((prev) => ({ ...prev, [id]: value }));
    };

    // Handle input changes for all fields
    // const handleInputChange = (id: string, value: string | number) => {
    //     setUserFormData((prev) => ({ ...prev, [id]: value }));
    // };



    // POST user-form-data handler
    const handleUserFormPost = async () => {
        try {

            const response = await fetch("/api/user-form-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    userFormData,
                    //dynamicFormData,
                }),
            });

            if (response.ok) {
                console.log("Success");
                console.log(dynamicFormData) //prints user form data still
            } else {
                console.error("Failure: ", response.statusText);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    const currentQuestions = questions.filter((q) => q.page === currentPage);

    return (
        <div className="flex items-center justify-center flex-col h-full w-full bg-w p-5 overflow-y-auto">
            <h1>form for {userId}</h1>
            {userId && (
                <>
                    <input
                        type="text"
                        className="border"
                        onChange={(e) => setUserFormData(e.target.value)}
                    />


                    {/* Dynamic form inputs */}
                    {currentQuestions.map((q) => (
                        <div key={q.id} className="mb-4">
                            <label className="block text-sm font-medium mb-2">{q.label}</label>
                            <input
                                type={q.type}
                                className="border p-2 w-full"
                                onChange={(e) => handleDynamicInputChange(q.id, e.target.value)}
                            />
                        </div>
                    ))}

                    {/* Navigation and submission buttons */}
                    {/* <div className="flex justify-between w-full mt-4">
                        {currentPage > 1 && (
                        <button
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            className="px-4 py-2 bg-gray-300 rounded"
                        >
                            Previous
                        </button>
                        )}
                        {currentPage < Math.max(...questions.map((q) => q.page)) && (
                        <button
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Next
                        </button>
                        )}
                        {currentPage === Math.max(...questions.map((q) => q.page)) && (
                        <button
                            onClick={async (e) => {
                            e.preventDefault();
                            setIsLoading(true);
                            await handleUserFormPost();
                            setIsLoading(false);
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded"
                        >
                            {isLoading ? "Submitting..." : "Submit"}
                        </button>
                        )}
                    </div> */}


                    {!isLoading && (
                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                setIsLoading(true);
                                await handleUserFormPost();
                                setIsLoading(false);
                            }}
                        >
                            post
                        </button>
                    )}
                    {isLoading && <p>loading</p>}
                </>
            )}
        </div>
    );
};

export default UserForm;
