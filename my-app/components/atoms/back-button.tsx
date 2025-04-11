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
                width={25}
                height={25}
                className={`filter-blue`}
            />

            <div
                className={`text-lg font-medium text-blue group-hover:text-blue text-blue`}
            >
                Back
            </div>
        </button>
    );
}
