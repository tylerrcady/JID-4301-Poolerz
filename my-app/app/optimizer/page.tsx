"use client";

import React, { useState } from "react";
import { runOptimizer } from "../../lib/example-usage"; // get the optimizer

const OptimizerPage: React.FC = () => {
    const [results, setResults] = useState<any>(null);
    const [td, setTd] = useState<number>(4); // default value

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        setTd(value);
    };

    const handleRunOptimizer = async () => {
        try {
            const optimizerResults = await runOptimizer(td); // run the optimizer on button press
            console.log(optimizerResults);
            setResults(optimizerResults); // store the results in the state
        } catch (error) {
            console.error("Error running optimizer:", error);
        }
    };

    const renderClusters = (clusters: any[], title: string) => (
        <div style={{ marginBottom: "20px" }}>
            <h1 className="text-lg">{title}</h1>
            {clusters.map((cluster: any, index: number) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                    <h4>Cluster {index}</h4>
                    <h5>Users:</h5>
                    <ul
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            listStyleType: "none",
                            padding: 0,
                        }}
                    >
                        {cluster.users.map((user: any) => (
                            <li
                                key={user.userId}
                                style={{ marginRight: "10px" }}
                            >
                                {user.userId}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ padding: "20px" }}>
            <h1>Optimizer Page</h1>
            <div style={{ marginBottom: "20px" }}>
                {/* <label>
                    <input
                        type="radio"
                        value={1}
                        checked={td === 1}
                        onChange={handleRadioChange}
                    />
                    1
                </label> */}
                <label style={{ marginLeft: "10px" }}>
                    <input
                        type="radio"
                        value={4}
                        checked={td === 4}
                        onChange={handleRadioChange}
                    />
                    4
                </label>
                {/* <label style={{ marginLeft: "10px" }}>
                    <input
                        type="radio"
                        value={3}
                        checked={td === 3}
                        onChange={handleRadioChange}
                    />
                    3
                </label> */}
            </div>
            <button
                onClick={handleRunOptimizer}
                style={{ marginBottom: "20px" }}
            >
                Run Optimizer
            </button>
            {results && (
                <div>
                    {renderClusters(
                        results.initialClusters || [],
                        "Initial Clusters"
                    )}
                    {renderClusters(
                        results.validatedClusters || [],
                        "Validated Clusters"
                    )}
                    {renderClusters(
                        results.finalClusters || [],
                        "Final Clusters"
                    )}
                    <div>
                        <h1 className="text-lg">Unclustered Users</h1>
                        <ul
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                listStyleType: "none",
                                padding: 0,
                            }}
                        >
                            {results.unclusteredUsers?.map((user: any) => (
                                <li
                                    key={user.userId}
                                    style={{ marginRight: "10px" }}
                                >
                                    {user.userId}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            <iframe
                src={`/test_map.html?input=${td}`}
                style={{ width: "100%", height: "600px", border: "none" }}
                title="Test Map"
            ></iframe>
        </div>
    );
};

export default OptimizerPage;
