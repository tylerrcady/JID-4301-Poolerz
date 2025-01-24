import React, { useState } from "react";
import ErrorText from "./error-text";
import keyboardScroll from "@lib/keyboard-scroll";

interface Props {
    label?: string;
    disabled?: boolean;
    onChange?: (value: number) => void;
    formValue?: React.InputHTMLAttributes<HTMLInputElement>;
    currentValue?: number;
    placeholder?: string;
    error?: string;
    inputType?: "number"; // Fix to number
    key?: string;
    required?: boolean;
    min?: number; // Minimum value for the input
    max?: number; // Maximum value for the input
    step?: number; // Step size for the input
}

export default function NumberInput({
    label = "",
    disabled = false,
    onChange,
    formValue = {},
    currentValue = 0,
    placeholder = "",
    error = "",
    inputType = "number",
    key = "",
    required = false,
    min,
    max,
    step,
}: Props) {
    const [value, setValue] = useState(currentValue);

    return (
        <div className="flex flex-col w-full">
            {label && (
                <label
                    className="text-black text-base font-normal leading-normal"
                    htmlFor={formValue ? formValue.name : undefined}
                >
                    {label}
                    {required && (
                        <span className="text-asterisks-red text-sm">*</span>
                    )}
                </label>
            )}
            <input
                key={key}
                type={inputType}
                onFocus={(e) => keyboardScroll(e)}
                {...formValue}
                className={`w-full py-2.5 px-2 bg-lightgray items-center border rounded ${
                    disabled ? "!bg-black" : "!bg-secondary-background"
                } ${error ? "border-red" : "border-black"} text-black`}
                onClick={(event) => {
                    event.stopPropagation();
                }}
                onChange={(event) => {
                    const newValue = parseFloat(event.target.value);
                    setValue(newValue);
                    if (onChange) {
                        onChange(newValue);
                    }
                }}
                placeholder={placeholder}
                value={value.toString()} // NaN issue
                disabled={disabled}
                min={min}
                max={max}
                step={step}
            />
            <ErrorText error={error} />
        </div>
    );
}
