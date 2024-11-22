import React from "react";

interface MainProps {
    userName: string | null | undefined;
}

const Main: React.FC<MainProps> = ({ userName }) => {
    return (
        <div className="flex items-center flex-col h-auto w-full bg-w p-5 overflow-y-auto gap-4 text-center">
            <h1 className="text-4xl font-bold mb-4">
                Welcome to Poolerz, {userName}!
            </h1>
            <p className="text-lg mb-4">
                Connecting Families, One Carpool at a Time
            </p>
            <p className="mb-4">
                Tired of ducking out early to drive kids to after school
                programs? Struggling to manage a complex carpool group?
                Uncertain about the commitment and etiquette of starting a
                carpool with nearby families?​​ ​ Poolerz can help!​
            </p>
            <p className="mb-4">
                Poolerz partners with your club, camp, or school and resolves
                those issues with just a few targeted questions. Our secret
                sauce is our data-driven optimizer, putting technology to use
                doing what it does best: crunching numbers and producing
                hyper-efficient assignments, routes, and schedules so families
                don’t have to.
            </p>
            <h2 className="text-2xl font-semibold">How it Works</h2>
            <button className="bg-b-500 hover:bg-b-700 text-w font-bold rounded mb-2">
                <a
                    href="mailto:latesummergroup+connect@gmail.com"
                    className="text-b"
                >
                    JOIN OUR WAITLIST
                </a>
            </button>
            <h2 className="text-2xl font-semibold mb-2">About Us</h2>
            <p className="mb-4">
                At Poolerz, we are passionate about simplifying the process of
                creating carpools and connecting families. Founded by a busy
                Atlanta mom in 2024, we&apos;re built by parents for parents;
                our service is designed to support and enhance the lives of
                working professionals and families.
            </p>
            <h2 className="text-2xl font-semibold">Connect</h2>
            <button className="bg-b-500 hover:bg-b-700 text-w font-bold rounded">
                <a
                    href="mailto:latesummergroup+connect@gmail.com"
                    className="text-b"
                >
                    Contact Us
                </a>
            </button>
        </div>
    );
};

export default Main;
