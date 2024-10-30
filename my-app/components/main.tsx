import React from "react";
import Test from "./test";

interface MainProps {
    userId: string;
}

const Main: React.FC<MainProps> = ({ userId }) => {
    return (
        <div className="flex items-center justify-center flex-col h-full w-full bg-w p-5 overflow-y-auto">
            main code: {userId}
            <Test/>
        </div>
        
        
    );
};


export default Main;
