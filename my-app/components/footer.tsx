import React from "react";

const Footer: React.FC = () => {
    return (
        <footer className="w-full flex flex-col md:flex-row justify-between items-center text-gray-700 bg-gradient-to-r from-gray-200 to-gray-400 py-6 px-10 shadow-lg border-t border-gray-300">
            <div className="text-sm font-semibold">
                © {new Date().getFullYear()} Poolerz. All rights reserved.
            </div>
            <div className="text-sm mt-4 md:mt-0">
                <span className="font-medium">Powered by</span>{" "}
                <span className="text-blue-600 font-bold">JDA @ GT</span>
            </div>
        </footer>
    );
};

export default Footer;
