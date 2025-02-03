"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface CreateCarpoolProps {
    userId: string | undefined;
    // may add more variables if necessary, like in user-profile.tsx
}

const CreateCarpool: React.FC<CreateCarpoolProps> = () => {
    const router = useRouter();
    return (
        <div className="flex flex-col w-10/12 max-w-md gap-6 p-4">
            {/* Back Button */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="text-b text-lg md:text-2xl font-normal"
                >
                    Back
                </button>
            </div>
            {/* Pool Name Field */}
            <div className="flex flex-col gap-2">
                <label className="text-d text-lg md:text-xl font-normal">
                    Pool Name <span className="text-d">*</span>
                </label>
                <input
                    type="text"
                    className="w-full h-10 rounded-md border border-d px-3 py-2 outline-none"
                    placeholder="Enter pool name"
                />
            </div>

            {/* Shared Location Field */}
            <div className="flex flex-col gap-2">
                <label className="text-d text-lg md:text-xl font-normal">
                    Shared Location <span className="text-d">*</span>
                </label>
                <input
                    type="text"
                    className="w-full h-10 rounded-md border border-d px-3 py-2 outline-none"
                    placeholder="Enter shared location"
                />
            </div>

            {/* Continue Button */}
            <div>
                <button className="w-full md:w-auto px-6 py-3 bg-b rounded-lg text-w text-lg md:text-xl font-normal">
                    Continue
                </button>
            </div>
        </div>
    );
};
export default CreateCarpool;
