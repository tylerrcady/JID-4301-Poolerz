"use client";

import React, { useState } from "react";
import Button from "@components/atoms/Button";

interface CarpoolsProps {
    userId: string | undefined;
}

const Carpools: React.FC<CarpoolsProps> = ({ userId }) => {
     
    return (
     <div className="max-w-md w-full p-6 md:p-8 bg-white rounded-md shadow-lg flex flex-col items-center md:items-start gap-6 overflow-hidden">
        <div className="w-full">
            <div className="text-black text-xl md:text-2xl font-bold font-['Open Sans'] text-center md:text-left">
                Create Carpool
            </div>
            <div className="text-gray-600 text-lg md:text-xl font-normal font-['Open Sans'] text-center md:text-left mt-2">
                Start a new carpool and manage families within the group
            </div>
        </div>
        <button className="w-full md:w-auto px-6 py-3 bg-[#4b859f] rounded-md border border-[#4b859f] text-white text-lg md:text-xl font-semibold font-['Open Sans'] leading-[35px]">
            Create
        </button>
    </div>


    )
}
export default Carpools;