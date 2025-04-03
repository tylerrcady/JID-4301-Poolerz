import { MouseEventHandler } from "react";
import Image from "next/image";

interface Props {
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
}

export default function BackButton({ onClick, disabled }: Props) {
    return (
        <button
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 shadow-sm text-b`}
            onClick={onClick}
            disabled={disabled}
        >
            <Image
                src="/back-arrow2.svg"
                alt="Back arrow"
                width={20}
                height={20}
                className={`mr-1.5 filter-blue`}
            />

            <div
                className={`text-sm font-medium text-blue-500 group-hover:text-blue-700 text-b`}
            >
                Back
            </div>
        </button>
    );
}
