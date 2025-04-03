"use client";

import React, { useState } from "react";
import Image from "next/image";

interface MainProps {
    userName: string | null | undefined;
}

const Main: React.FC<MainProps> = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
        subscribeEmail: "",
    });

    return (
        <div className="flex items-center flex-col h-auto min-h-screen w-full gap-6 bg-w py-2 px-10 text-center">
            <div className="relative w-full max-w-xs">
                <Image
                    layout="responsive"
                    width={400}
                    height={68}
                    src="/Poolerz.io.png"
                    alt="Poolerz logo"
                />
            </div>
            <div className="w-full bg-blue-100 p-6 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold text-blue-800 mb-4">
                    Problem Statement
                </h2>
                <p className="text-md text-gray-700">
                    Managing carpools can be a daunting task for busy families.
                    From coordinating schedules to ensuring fairness and
                    efficiency, the process often leads to frustration and
                    wasted time. Poolerz aims to solve these challenges by
                    providing a seamless, technology-driven solution.
                </p>
            </div>
            <div className="flex flex-row justify-center items-center gap-10 flex-wrap md:flex-nowrap">
                {[
                    {
                        title: "Connecting Families, One Carpool at a Time",
                        content: `Tired of ducking out early to drive kids to after school programs?
                Struggling to manage a complex carpool group?
                Uncertain about the commitment and etiquette of starting a carpool with nearby families?​`,
                        footer: "Join us today and simplify your carpooling experience!",
                    },
                    {
                        title: "Poolerz Can Help!",
                        content: `Poolerz partners with your club, camp, or school and resolves those issues with just a few targeted questions. Our secret sauce is our data-driven optimizer, putting technology to use doing what it does best: crunching numbers and producing hyper-efficient assignments, routes, and schedules so families don’t have to.`,
                        footer: "Experience the power of technology-driven carpooling!",
                    },
                    {
                        title: "About Us",
                        content: `At Poolerz, we are passionate about simplifying the process of creating carpools and connecting families. Founded by a busy Atlanta mom in 2024, our service is designed to support and enhance the lives of working professionals and families.`,
                        footer: "Learn more about our mission and values.",
                    },
                ].map((card, index) => (
                    <div
                        key={index}
                        className="flex flex-col justify-start items-center gap-4 p-6 bg-white shadow-lg rounded-lg transform transition-transform hover:scale-105 w-full md:w-1/3"
                    >
                        <div className="text-center text-blue text-xl font-bold font-['Open Sans']">
                            {card.title}
                        </div>
                        <div className="text-center text-gray text-md font-normal font-['Open Sans'] leading-6">
                            {card.content}
                        </div>
                        <div className="text-center text-sm text-gray-500 font-['Open Sans']">
                            {card.footer}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Main;
