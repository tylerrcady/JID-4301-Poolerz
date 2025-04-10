import { useState } from "react";
import CaretIcon from "./icons/CaretIcon";

const MyCarpoolMembers = ({
    members,
    userIdToNameMap,
    addressMap,
    phoneMap,
}: {
    members: string[];
    userIdToNameMap: Record<string, string>;
    addressMap: Record<string, string>;
    phoneMap: Record<string, string>;
}) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const toggleDropdown = (memberId: string) => {
        setOpenDropdown((prev) => (prev === memberId ? null : memberId));
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {members.map((memberId) => {
                const memberName = userIdToNameMap[memberId] || "Unknown Member";
                const phoneNumber = phoneMap[memberId] || "Phone number not available";
                const address = addressMap[memberId] || "Address not available";

                return (
                    <div
                        key={memberId}
                        className="border border-lightgray rounded-md shadow-md w-full"
                    >
                        {/* Dropdown Header */}
                        <div
                            className="flex justify-between items-center p-2 cursor-pointer bg-w hover:bg-lightgray"
                            onClick={() => toggleDropdown(memberId)}
                        >
                            <span
                                className={`font-regular text-base md:text-lg text-gray px-4 ${
                                    openDropdown === memberId ? "" : "truncate"
                                }`}
                            >
                                {memberName}
                            </span>
                            <div
                                style={{
                                    transform: openDropdown == memberId ? "rotate(180deg)" : "rotate(0deg)",
                                }}
                            >
                                <CaretIcon 
                                    className="stroke-blue hover:stroke-lightblue"
                                />
                            </div>
                        </div>

                        {/* Dropdown Content */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out`}
                        >
                            {openDropdown === memberId && (
                                <div className="p-4 bg-white">
                                    <div className="mb-4 px-2 grid grid-cols-1">
                                        <span className="font-semibold text-gray mb-2">
                                            Phone Number
                                        </span>
                                        <span className="text-gray">
                                            {phoneNumber}
                                        </span>
                                    </div>
                                    <div className="px-2 grid grid-cols-1">
                                        <span className="font-semibold text-gray mb-2">
                                            Address
                                        </span>
                                        <span className="text-gray">
                                            {address}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MyCarpoolMembers;