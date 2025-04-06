import * as React from "react";

const Loading = () => (
    <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
    >
        <style>{`
            .spinner_ajPY {
                transform-origin: center;
                animation: spinner_AtaB 0.75s infinite linear;
            }
            @keyframes spinner_AtaB {
                100% {
                    transform: rotate(360deg);
                }
            }
        `}</style>
        <path
            d="M24,2A22,22,0,1,0,46,24,22,22,0,0,0,24,2Zm0,38a16,16,0,1,1,16-16A16,16,0,0,1,24,40Z"
            opacity=".25"
        />
        <path
            d="M20.28,2.32a22,22,0,0,0-18,17.84A3.18,3.18,0,0,0,4.92,24a3.04,3.04,0,0,0,3.7-2.6,16,16,0,0,1,13.32-13.22A2.84,2.84,0,0,0,24,5.38h0A3.14,3.14,0,0,0,20.28,2.32Z"
            className="spinner_ajPY"
        />
    </svg>
);

export default Loading;
