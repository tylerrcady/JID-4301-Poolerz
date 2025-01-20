"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation';

interface CreateCarpoolProps {
    userId: string | undefined;
    // may add more variables if necessary, like in user-profile.tsx
}

const CreateCarpool: React.FC<CreateCarpoolProps> = ({ userId }) => {
    const router = useRouter();
    return (
    <div className="flex flex-col w-full max-w-md gap-6 p-4">
        {/* Back Button */}
        <div>
          <button
          onClick={() => router.back()} 
          className="text-[#4b859f] text-xl md:text-2xl font-normal font-['Outfit']">
            Back
          </button>
        </div>
        {/* Pool Name Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[#575757] text-lg md:text-xl font-normal font-['Open Sans']">
            Pool Name <span className="text-[#ad3232]">*</span>
          </label>
          <input
            type="text"
            className="w-full h-10 rounded-md border border-[#575757] px-3 py-2 outline-none"
            placeholder="Enter pool name"
          />
        </div>
      
        {/* Shared Location Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[#575757] text-lg md:text-xl font-normal font-['Open Sans']">
            Shared Location <span className="text-[#ad3232]">*</span>
          </label>
          <input
            type="text"
            className="w-full h-10 rounded-md border border-[#575757] px-3 py-2 outline-none"
            placeholder="Enter shared location"
          />
        </div>
      
        {/* Continue Button */}
        <div>
          <button className="w-full md:w-auto px-6 py-3 bg-[#a5c2cf] rounded-lg text-white text-lg md:text-xl font-normal font-['Outfit']">
            Continue
          </button>
        </div>
      </div>
      );
}
export default CreateCarpool;