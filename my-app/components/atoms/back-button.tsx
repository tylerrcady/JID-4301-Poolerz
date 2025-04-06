import { MouseEventHandler } from "react";
import Image from "next/image";

interface Props {
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
}

export default function BackButton({ onClick, disabled }: Props) {
    return (
        <button
            className={`group flex items-center transition-all duration-200 text-b`}
            onClick={onClick}
            disabled={disabled}
        >
            <Image
                src="/back-arrow2.svg"
                alt="Back arrow"
                width={20}
                height={20}
                className={`filter-blue`}
            />

            <div
                className={`text-sm font-medium text-blue-500 group-hover:text-blue-700 text-b`}
            >
                Back
            </div>
        </button>
    );
}
