import React from "react";
import Image from "next/image";

interface MainProps {
    userName: string | null | undefined;
}

const Main: React.FC<MainProps> = ({ /*userName*/ }) => {
    return (
        <div className="flex items-center flex-col h-auto w-full gap-12 bg-w p-5 overflow-y-auto text-center">
            <div className="relative w-full max-w-xs">
                <Image
                    layout="responsive"
                    width={245}
                    height={42}
                    src="/poolerz.jpg"
                    alt="Poolerz logo"
                />
            </div>
            <div className="flex-col w-3/5 justify-start items-center flex gap-10">
                <div className="text-blue text-4xl font-bold font-['Open Sans']">Connecting Families,<br/>One Carpool at a Time</div>
                <div className="self-stretch text-center text-gray text-xl font-normal font-['Open Sans'] leading-10">
                    Tired of ducking out early to drive kids to after school programs?<br/>
                    Struggling to manage a complex carpool group?<br/>
                    Uncertain about the commitment and etiquette of starting a carpool with nearby families?​</div>
                <div className="self-stretch flex-col justify-start items-center gap-6 flex">
                    <div className="self-stretch text-center text-blue text-4xl font-bold font-['Open Sans']">Poolerz Can Help!</div>
                    <div className="self-stretch text-center text-gray text-xl font-normal font-['Open Sans'] leading-10">
                        Poolerz partners with your club, camp, or school and resolves those issues with just a few targeted questions. 
                        Our secret sauce is our data-driven optimizer, putting technology to use doing what it does best: crunching numbers and producing 
                        hyper-efficient assignments, routes, and schedules so families don’t have to.</div>
                </div>
                <div className="self-stretch flex-col justify-start items-center gap-6 flex">
                    <div className="self-stretch text-center text-blue text-4xl font-bold font-['Open Sans']">About Us</div>
                    <div className="self-stretch text-center text-gray text-xl font-normal font-['Open Sans'] leading-10">
                        At Poolerz, we are passionate about simplifying the process of creating carpools and connecting families. 
                        Founded by a busy Atlanta mom in 2024, our service is designed to support and enhance the lives of working professionals and families.</div>
                </div>   
            </div>
            <div className="self-stretch text-center text-blue text-4xl py-2 font-bold font-['Open Sans']">Contact Us</div>
            <div className="self-stretch flex flex-wrap justify-center px-6 items-start gap-10">
                <div className="w-full md:w-1/5 flex flex-col gap-4">
                    <h2 className="text-gray text-xl font-semibold">Have a Question? Get in Touch!</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="First Name"
                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue"
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full col-span-1 sm:col-span-2 p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue"
                        />
                        <input
                            type="text"
                            placeholder="Subject"
                            className="w-full col-span-1 sm:col-span-2 p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue"
                        />
                    </div>
                    <textarea
                        placeholder="Message"
                        className="w-full h-32 p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue resize-none"
                    ></textarea>
                    <button
                        type="submit"
                        className="w-full sm:w-auto bg-blue text-white px-6 py-3 rounded hover:bg-blue transition"
                    >
                        Send Message
                    </button>
                </div>
                <div className="w-full md:w-1/5 flex flex-col gap-4">
                    <h2 className="text-gray text-xl font-semibold">Join our Mailing List</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                    <button
                        type="submit"
                        className="w-full sm:w-auto bg-blue text-white px-6 py-3 rounded hover:bg-blue transition"
                    >
                        Subscribe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Main;
