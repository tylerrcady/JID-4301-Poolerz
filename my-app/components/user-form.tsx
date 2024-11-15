"use client";

import React, { useState } from "react";

interface UserFormProps {
    userId: string | undefined;
}

const UserForm: React.FC<UserFormProps> = ({ userId }) => {
    // state variables
    const [userFormData, setUserFormData] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
                }),
            });

            if (response.ok) {
                console.log("Success");
            } else {
                console.error("Failure: ", response.statusText);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    };

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
