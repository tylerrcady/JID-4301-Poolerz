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
        <div className="flex items-center flex-col h-full w-full gap-6 bg-w py-5 text-center">
            <div className="relative w-full max-w-xs">
                <Image
                    layout="responsive"
                    width={400}
                    height={68}
                    src="/Poolerz.io.png"
                    alt="Poolerz logo"
                />
            </div>
            <div className="flex-col m-4 w-6/12 justify-start items-center flex gap-20">
                <div className="text-blue text-4xl font-bold font-['Open Sans']">
                    Connecting Families, <br />
                    One Carpool at a Time
                </div>
                <div className="self-stretch text-center text-gray text-2xl font-normal font-['Open Sans'] leading-10">
                    Tired of ducking out early to drive kids to after school
                    programs?
                    <br />
                    Struggling to manage a complex carpool group?
                    <br />
                    Uncertain about the commitment and etiquette of starting a
                    carpool with nearby families?​
                </div>
                <div className="self-stretch flex-col justify-start items-center gap-6 flex">
                    <div className="self-stretch text-center text-blue text-4xl font-bold font-['Open Sans']">
                        Poolerz Can Help!
                    </div>
                    <div className="self-stretch text-center text-gray text-2xl font-normal font-['Open Sans'] leading-10">
                        Poolerz partners with your club, camp, or school and
                        resolves those issues with just a few targeted
                        questions. Our secret sauce is our data-driven
                        optimizer, putting technology to use doing what it does
                        best: crunching numbers and producing hyper-efficient
                        assignments, routes, and schedules so families don’t
                        have to.
                    </div>
                </div>
                <div className="self-stretch flex-col justify-start items-center gap-6 flex">
                    <div className="self-stretch text-center text-blue text-4xl font-bold font-['Open Sans']">
                        About Us
                    </div>
                    <div className="self-stretch text-center text-gray text-2xl font-normal font-['Open Sans'] leading-10">
                        At Poolerz, we are passionate about simplifying the
                        process of creating carpools and connecting families.
                        Founded by a busy Atlanta mom in 2024, our service is
                        designed to support and enhance the lives of working
                        professionals and families.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;
