import { MouseEventHandler } from "react";

interface ToggleProps {
    enabled: boolean;
    onToggle: () => void;
}

export default function Toggle({ enabled, onToggle }: ToggleProps) {
    return (
        <div className="relative flex flex-col items-center justify-center">
            <div className="flex">
                <label className="inline-flex relative items-center mr-5 cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={enabled}
                        readOnly
                    />
                    <div
                        onClick={onToggle}
                        className={`w-11 h-6 bg-gray rounded-full peer peer-focus:ring-blue peer-checked:after:translate-x-full peer-checked:after:border-white 
                            after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                enabled ? "peer-checked:bg-blue" : ""
                            }`}
                    ></div>
                    <span className="ml-2 text-sm font-medium text-gray">
                        {enabled ? "Close Now" : "Open Now"}
                    </span>
                </label>
            </div>
        </div>
    );
}