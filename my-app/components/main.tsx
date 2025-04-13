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
        <div className="flex items-center flex-col h-auto min-h-screen w-full gap-6 bg-w text-center">
            <div className="w-full flex justify-center">
            <Image
                src="/Hero.svg"
                alt="Hero graphic"
                width={1200}
                height={100}
                className="w-full"
            />
            </div>
            <div className="flex px-10 gap-6 flex-col">
                <div className="w-full bg-w py-6 px-2 md:px-20 text-center">
                    <h2 className="text-3xl font-bold italic text-blue mb-4">
                        Solving the Daily Drive
                    </h2>
                    <p className="text-lg text-gray">
                        Managing carpools can be a daunting task for busy
                        families. From coordinating schedules to ensuring
                        fairness and efficiency, the process often leads to
                        frustration and wasted time. Poolerz aims to solve these
                        challenges by providing a seamless, technology-driven
                        solution.
                    </p>
                </div>
                <div className="flex flex-row justify-center items-center md:px-20 gap-10 flex-wrap md:flex-nowrap mb-10">
                    {[
                        {
                            title: "How It Works",
                            content: `Poolerz partners with your club, camp, or school to streamline transportation logistics with just a few smart questions. Our secret? A powerful data-driven optimizer that does the heavy lifting so families can focus on what truly matters.​`,
                        },
                        {
                            title: "About Us",
                            content: `At Poolerz, we are passionate about simplifying the process of creating carpools and connecting families. Founded by a busy Atlanta mom in 2024, our service is designed to support and enhance the lives of working professionals and families.`,
                        },
                    ].map((card, index) => (
                        <div
                            key={index}
                            className="flex flex-col justify-start items-center gap-4 p-6 bg-white border border-lightgray shadow-lg rounded-lg transform transition-transform hover:scale-105 w-full md:w-1/2"
                        >
                            <div className="text-center text-blue text-xl font-bold font-['Open Sans']">
                                {card.title}
                            </div>
                            <div className="text-center text-gray text-md font-normal font-['Open Sans'] leading-6">
                                {card.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Main;
