"use client";

import React from "react";
import { runOptimizer } from "../../lib/example-usage"; // Adjust the import path as necessary

const OptimizerPage: React.FC = () => {
    const handleRunOptimizer = () => {
        console.log("Optimizer is running...");
        runOptimizer();
    };

    return (
        <div>
            <h1>Optimizer Page</h1>
            <button onClick={handleRunOptimizer}>Run Optimizer</button>
        </div>
    );
};

export default OptimizerPage;
