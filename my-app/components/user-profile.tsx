"use client";

import React, { useCallback, useEffect, useState } from "react";

interface UserProfileProps {
    userId: string | undefined;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
    // state variables
    const [userFormData, setUserFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // GET user-form-data handler
    const handleUserFormGet = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/user-form-data?userId=${userId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                setUserFormData(
                    data && data.userFormData
                        ? data.userFormData.userFormData
                        : ""
                ); // update variable with returned data
            } else {
                console.error("Failed to fetch data:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setIsLoading(false);
    }, [userId]);

    // get userFormData handler/caller useEffect
    useEffect(() => {
        handleUserFormGet();
    }, [userId, handleUserFormGet]);

    return (
        <div className="flex items-center justify-center flex-col h-full w-full bg-w p-5 overflow-y-auto">
            <h1>profile for {userId}</h1>
            {!isLoading && <span>{userFormData}</span>}
            {isLoading && <span>loading</span>}
        </div>
    );
};

export default UserProfile;
