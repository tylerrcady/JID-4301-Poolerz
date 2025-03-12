import { MouseEventHandler } from "react";
import Image from "next/image";

interface Props {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export default function BackButton({ onClick, disabled}: Props) {
  return (
    <button //cremove text-base after [2px]
      className={`group flex items-center gap-[2px] font-normal text-blue`}
      onClick={onClick}
      disabled={disabled}
    >
      {/* <svg //!MIGHT WANT TO FIGURE THIS OUT FOR LATER BECAUSE OF SCALING
        xmlns="/back-arrow.svg"
        //xmlns="http://www.w3.org/2000/svg"
        width="24" //24 before
        height="24" //24 before
        viewBox="0 0 24 24"
        fill="none"
        className="mr-1" // margin for space between arrow and text
      >
        <path
          d="M15 18L9 12L15 6"
          className={`${!darkerColor ? "stroke-medium-gray" : "stroke-primary-text group-hover:stroke-dark-gray"} ${disabled ? "stroke-dark-gray" : "group-hover:stroke-dark-gray"}`}
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
      </svg> */}

      <Image 
        src="/back-arrow2.svg"
        alt="Back arrow"
        width={30}
        height={30}
        className={`mr-1`}
      />

      <div
        className={`text-xl md:text-2xl ${disabled ? "text-blue" : "group-hover:text-blue"}`}
      >
        Back
      </div>
    </button>
  );
}