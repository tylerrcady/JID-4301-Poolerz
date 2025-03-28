"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import BackButton from "@/components/atoms/back-button";
import { Optimizer } from "@/lib/optimize";

interface UserWithCoords {
    userId: string;
    name: string;
    children?: string[];
    coordinates: {
        lat: number;
        lng: number;
    };
}

interface ClusterWithSchedule {
    users: UserWithCoords[];
    centroid: {
        lat: number;
        lng: number;
    };
    drivingSchedule: Record<string, string>; // day -> driver name
}

interface OptimizerResults {
    initialClusters: any[];
    validatedClusters: any[];
    finalClusters: ClusterWithSchedule[];
    unclusteredUsers: UserWithCoords[];
    timeInfo?: {
        startTime: string;
        endTime: string;
    };
}

interface TransformedCarpool {
    id: number;
    members: string[];
    memberIds: string[];
    riders: string[];
    driverSchedule: Record<string, string> | any; // Use any temporarily to resolve type issue
    totalDistance: number;
    startTime?: string;
    endTime?: string;
}

interface TransformedResults {
    carpools: TransformedCarpool[];
    unassignedMembers: string[];
    unassignedMemberIds: string[];
    metrics: {
        totalClusters: number;
        totalMembers: number;
        unassignedCount: number;
    };
}

interface PoolInfoProps {
    userId: string | undefined;
    index: string;
}

const DAYS_OF_WEEK = [
    { label: "Su", value: "Su", number: 0 },
    { label: "M", value: "M", number: 1 },
    { label: "T", value: "T", number: 2 },
    { label: "W", value: "W", number: 3 },
    { label: "Th", value: "Th", number: 4 },
    { label: "F", value: "F", number: 5 },
    { label: "S", value: "S", number: 6 },
];

const CarpoolPage: React.FC<PoolInfoProps> = ({ userId, index }) => {
    const [foundCarpool, setFoundCarpool] = useState<Carpool>(); // found in user-carpool-data
    const [carpoolOrgInfo, setCarpoolOrgInfo] = useState<CreateCarpoolData>();
    const [isOwner, setIsOwner] = useState(false);
    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const [carpoolDays, setCarpoolDays] = useState<string>(); // found from create-carpool
    const [startTime, setStartTime] = useState<string>(); // start time from carpoolOrgInfo
    const [endTime, setEndTime] = useState<string>(); // end time from carpoolOrgInfo
    const [drivingAvailability, setDrivingAvailability] = useState<string>(); // found from user-carpool-data
    const [riders, setRiders] = useState<string>(); // found from user-carpool-data
    const [userLocation, setUserLocation] = useState<UserLocation>();
    const [userChildren, setUserChildren] = useState<{id: string; name: string}[]>([]);

    const [isEditingOrgInfo, setIsEditingOrgInfo] = useState(false);
    const [isEditingMyInfo, setIsEditingMyInfo] = useState(false);
    
    const [tempOrgInfo, setTempOrgInfo] = useState<any>(null);
    const [tempMyInfo, setTempMyInfo] = useState<any>(null);
    
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [tempStartTime, setTempStartTime] = useState<string>("");
    const [tempEndTime, setTempEndTime] = useState<string>("");
    
    const [tempDrivingDays, setTempDrivingDays] = useState<number[]>([]);
    const [tempDrivingAvailability, setTempDrivingAvailability] = useState<string[]>([]);
    const [tempRiders, setTempRiders] = useState<{id: string; name: string; selected: boolean}[]>([]);
    const [tempCarCapacity, setTempCarCapacity] = useState<number>(0);
    const [tempAddress, setTempAddress] = useState<string>("");
    const [tempCity, setTempCity] = useState<string>("");
    const [tempState, setTempState] = useState<string>("");
    const [tempZipCode, setTempZipCode] = useState<string>("");

    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [leaveError, setLeaveError] = useState<string | null>(null);
    const [isLeaving, setIsLeaving] = useState(false);

    const router = useRouter();

    const handleConfirmBack = () => {
        router.back();
    };

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<TransformedResults | null>(null);
    const [optimizerError, setOptimizerError] = useState<string | null>(null);

    const optimizerDayMap: Record<string, string> = {
        "1": "Monday",
        "2": "Tuesday",
        "3": "Wednesday",
        "4": "Thursday",
        "5": "Friday",
        "6": "Saturday",
        "7": "Sunday",
    };

    const processOptimizationResults = (data: any) => {
        try {
            if (!data?.results) {
                return null;
            }
            
            const results = JSON.parse(JSON.stringify(data.results));
            
            if (results.carpools && Array.isArray(results.carpools)) {
                results.carpools.forEach((carpool: TransformedCarpool) => {
                    if (carpool.driverSchedule) {
                        const userIdToNameMap: Record<string, string> = {};
                        
                        if (carpool.members && Array.isArray(carpool.members) && 
                            carpool.memberIds && Array.isArray(carpool.memberIds)) {
                            for (let i = 0; i < Math.min(carpool.memberIds.length, carpool.members.length); i++) {
                                userIdToNameMap[carpool.memberIds[i]] = carpool.members[i];
                            }
                        }
                        
                        const hasDriverTuples = Object.values(carpool.driverSchedule).some(driver => 
                            Array.isArray(driver) && driver.length === 2
                        );
                        
                        const hasDriverUserIds = Object.values(carpool.driverSchedule).some(driver => 
                            typeof driver === 'string' && 
                            (driver.length === 24 || driver.includes('-') || /^[a-zA-Z0-9]{10,}$/.test(driver))
                        );
                        
                        if (hasDriverTuples) {
                            const processedDriverSchedule: Record<string, string> = {};
                            
                            Object.entries(carpool.driverSchedule).forEach(([day, driver]: [string, any]) => {
                                if (Array.isArray(driver) && driver.length === 2) {
                                    processedDriverSchedule[day] = driver[1];
                                } else if (typeof driver === 'object' && driver !== null) {
                                    processedDriverSchedule[day] = driver.name || driver.userId || JSON.stringify(driver);
                                } else {
                                    processedDriverSchedule[day] = String(driver || "Unassigned");
                                }
                            });
                            
                            carpool.driverSchedule = processedDriverSchedule;
                        } else if (hasDriverUserIds && Object.keys(userIdToNameMap).length > 0) {
                            const processedDriverSchedule: Record<string, string> = {};
                            
                            Object.entries(carpool.driverSchedule).forEach(([day, driverId]: [string, any]) => {
                                if (typeof driverId === 'string' && userIdToNameMap[driverId]) {
                                    processedDriverSchedule[day] = userIdToNameMap[driverId];
                                } else if (typeof driverId === 'object' && driverId !== null) {
                                    processedDriverSchedule[day] = driverId.name || driverId.userId || JSON.stringify(driverId);
                                } else {
                                    processedDriverSchedule[day] = String(driverId || "Unassigned");
                                }
                            });
                            
                            carpool.driverSchedule = processedDriverSchedule;
                        } else {
                            Object.entries(carpool.driverSchedule).forEach(([day, driver]: [string, any]) => {
                                if (typeof driver === 'object' && driver !== null) {
                                    carpool.driverSchedule[day] = driver.name || driver.userId || JSON.stringify(driver);
                                }
                            });
                        }
                    }
                    
                    if (!carpool.startTime && startTime) {
                        carpool.startTime = startTime;
                    }
                    if (!carpool.endTime && endTime) {
                        carpool.endTime = endTime;
                    }
                    
                    if (carpool.members && Array.isArray(carpool.members)) {
                        const hasTuples = carpool.members.some((member: any) => 
                            Array.isArray(member) && member.length === 2
                        );
                        
                        if (hasTuples) {
                            const extractedIds: string[] = [];
                            const extractedNames: string[] = [];
                            
                            carpool.members.forEach((tuple: any) => {
                                if (Array.isArray(tuple) && tuple.length === 2) {
                                    extractedIds.push(tuple[0]);
                                    extractedNames.push(tuple[1]);
                                } else {
                                    const id = typeof tuple === 'string' ? tuple : 'unknown-id';
                                    extractedIds.push(id);
                                    extractedNames.push(`Member ${String(id).substring(0, 5)}...`);
                                }
                            });
                            
                            carpool.memberIds = extractedIds;
                            carpool.members = extractedNames;
                        } else {
                            const seemsLikeIds = carpool.members.some((member: string) => 
                                typeof member === 'string' && 
                                (member.length === 24 ||
                                 member.includes('-') ||
                                 /^[a-zA-Z0-9]{10,}$/.test(member))
                            );
                            
                            if (!carpool.memberIds && seemsLikeIds) {
                                carpool.memberIds = [...carpool.members];
                                
                                carpool.members = carpool.members.map((memberId: string) => {
                                    if (typeof memberId === 'string' && memberId.includes(' ')) {
                                        return memberId;
                                    }
                                    return `Member ${memberId.substring(0, 5)}...`;
                                });
                            }
                        }
                    }
                });
            }
            
            if (results.unassignedMembers && Array.isArray(results.unassignedMembers)) {
                const hasTuples = results.unassignedMembers.some((member: any) => 
                    Array.isArray(member) && member.length === 2
                );
                
                if (hasTuples) {
                    const extractedIds: string[] = [];
                    const extractedNames: string[] = [];
                    
                    results.unassignedMembers.forEach((tuple: any) => {
                        if (Array.isArray(tuple) && tuple.length === 2) {
                            extractedIds.push(tuple[0]);
                            extractedNames.push(tuple[1]);
                        } else {
                            const id = typeof tuple === 'string' ? tuple : 'unknown-id';
                            extractedIds.push(id);
                            extractedNames.push(`Member ${String(id).substring(0, 5)}...`);
                        }
                    });
                    
                    results.unassignedMemberIds = extractedIds;
                    results.unassignedMembers = extractedNames;
                } else {
                    const seemsLikeIds = results.unassignedMembers.some((member: string) => 
                        typeof member === 'string' && 
                        (member.length === 24 ||
                         member.includes('-') ||
                         /^[a-zA-Z0-9]{10,}$/.test(member))
                    );
                    
                    if (seemsLikeIds) {
                        results.unassignedMemberIds = [...results.unassignedMembers];
                        
                        results.unassignedMembers = results.unassignedMembers.map((memberId: string) => {
                            if (typeof memberId === 'string' && memberId.includes(' ')) {
                                return memberId;
                            }
                            return `Member ${memberId.substring(0, 5)}...`;
                        });
                    }
                }
            }
            
            return results;
        } catch (error) {
            console.error("Error processing optimization results:", error);
            return null;
        }
    };

    const fetchOptimizationResults = useCallback(async () => {
        try {
            const carpoolId = new URLSearchParams(window.location.search).get(
                "carpoolId"
            );
            if (carpoolId) {
                console.log("Fetching optimization results for carpoolId:", carpoolId);
                const response = await fetch(
                    `/api/optimization-results?carpoolId=${carpoolId}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                
                console.log("Optimization results response status:", response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("Optimization results data:", data);
                    
                    const processedResults = processOptimizationResults(data);
                    
                    if (processedResults) {
                        console.log("Setting processed optimization results:", processedResults);
                        setResults(processedResults);
                    } else {
                        console.log("No optimization results found");
                    }
                } else {
                    console.error("Failed to fetch optimization results:", response.statusText);
                }
            }
        } catch (error) {
            console.error("Error fetching optimization results:", error);
        }
    }, []);

    const runOptimizer = async () => {
        if (!isOwner) {
            console.error("Only the carpool owner can run the optimizer");
            return;
        }
        
        setLoading(true);
        
        setOptimizerError(null);

        try {
            const carpoolId = new URLSearchParams(window.location.search).get(
                "carpoolId"
            );
            if (carpoolId) {
                console.log("Running optimizer for carpoolId:", carpoolId);
                
                try {
                    const optimizerResults = await Optimizer(carpoolId);
                    
                    console.log("Raw optimizer results:", JSON.stringify(optimizerResults, null, 2));
                    
                    if (!optimizerResults) {
                        throw new Error("Optimizer returned no results");
                    }
                    
                    if (!optimizerResults.finalClusters || !Array.isArray(optimizerResults.finalClusters)) {
                        throw new Error("Optimizer results missing finalClusters array");
                    }
                    
                    if (optimizerResults.finalClusters && Array.isArray(optimizerResults.finalClusters)) {
                        console.log("Number of final clusters:", optimizerResults.finalClusters.length);
                        
                        if (optimizerResults.finalClusters.length > 0) {
                            console.log("First cluster structure:", JSON.stringify(optimizerResults.finalClusters[0], null, 2));
                            
                            const drivingSchedule = optimizerResults.finalClusters[0].drivingSchedule;
                            console.log("Driving schedule format:", typeof drivingSchedule, drivingSchedule);
                            
                            if (drivingSchedule) {
                                console.log("Driving schedule entries:", Object.entries(drivingSchedule));
                                
                                const firstEntry = Object.entries(drivingSchedule)[0];
                                if (firstEntry) {
                                    console.log("First driving schedule entry:", firstEntry);
                                    console.log("Driver value type:", typeof firstEntry[1]);
                                    console.log("Driver value structure:", JSON.stringify(firstEntry[1], null, 2));
                                }
                            }
                        }
                    }
                    
                    try {
                        const transformedResults = {
                            carpools: optimizerResults.finalClusters.map((cluster, index) => {
                                try {
                                    if (!cluster.users || !Array.isArray(cluster.users)) {
                                        console.error(`Cluster ${index} missing users array`);
                                        return {
                                            id: index,
                                            members: ["Invalid cluster data"],
                                            memberIds: [],
                                            riders: [],
                                            driverSchedule: { "Error": "Invalid data" },
                                            totalDistance: 0,
                                            startTime: optimizerResults.timeInfo?.startTime || carpoolOrgInfo?.startTime || "",
                                            endTime: optimizerResults.timeInfo?.endTime || carpoolOrgInfo?.endTime || ""
                                        };
                                    }
                                    
                                    const members = cluster.users.map(user => user.name || "Unknown user");
                                    const memberIds = cluster.users.map(user => user.userId || "unknown-id");
                                    
                                    const riders = cluster.users.flatMap(user => 
                                        user.children || []
                                    );
                                    
                                    const totalDistance = 0;
                                    
                                    console.log(`Cluster ${index} drivingSchedule:`, cluster.drivingSchedule);
                                    
                                    const driverSchedule: Record<string, string> = {};
                                    
                                    if (cluster.drivingSchedule) {
                                        console.log(`Raw driving schedule for cluster ${index}:`, cluster.drivingSchedule);
                                        
                                        if (Array.isArray(cluster.drivingSchedule)) {
                                            console.log("Driving schedule is an array of driver objects");
                                            
                                            (cluster.drivingSchedule as any[]).forEach((driverInfo: any) => {
                                                try {
                                                    if (driverInfo && typeof driverInfo === 'object' && 
                                                        driverInfo.userId && 
                                                        driverInfo.drivingDays && 
                                                        Array.isArray(driverInfo.drivingDays)) {
                                                        
                                                        const driverUser = cluster.users.find(u => u.userId === driverInfo.userId);
                                                        const driverName = driverUser?.name || driverInfo.userId;
                                                        
                                                        console.log(`Found driver ${driverName} with driving days:`, driverInfo.drivingDays);
                                                        
                                                        driverInfo.drivingDays.forEach((day: number) => {
                                                            driverSchedule[day.toString()] = driverName;
                                                            console.log(`Set driver for day ${day} to ${driverName}`);
                                                        });
                                                    }
                                                } catch (err) {
                                                    console.error("Error processing driver info:", err);
                                                }
                                            });
                                        } else if (typeof cluster.drivingSchedule === 'object') {
                                            Object.entries(cluster.drivingSchedule).forEach(([day, driver]: [string, any]) => {
                                                try {
                                                    console.log(`Processing day ${day}, driver:`, driver, typeof driver);
                                                    
                                                    if (typeof driver === 'object' && driver !== null) {
                                                        console.log(`Driver object for day ${day}:`, JSON.stringify(driver, null, 2));
                                                        
                                                        const driverUser = cluster.users.find(u => u.userId === driver.userId);
                                                        console.log(`Found driver user:`, driverUser);
                                                        
                                                        const driverName = driver.name || 
                                                            (driverUser?.name) || 
                                                            driver.userId || 
                                                            'Unknown driver';
                                                        
                                                        if (Array.isArray(day)) {
                                                            day.forEach(dayIdx => {
                                                                driverSchedule[dayIdx.toString()] = driverName;
                                                            });
                                                        } else {
                                                            driverSchedule[day] = driverName;
                                                        }
                                                        
                                                        console.log(`Set driver name for ${day} to:`, driverName);
                                                    } else {
                                                        if (typeof driver === 'string') {
                                                            const driverUser = cluster.users.find(u => u.userId === driver);
                                                            if (driverUser) {
                                                                driverSchedule[day] = driverUser.name || driver;
                                                            } else {
                                                                driverSchedule[day] = String(driver || "Unassigned");
                                                            }
                                                        } else {
                                                            driverSchedule[day] = String(driver || "Unassigned");
                                                        }
                                                        console.log(`Set driver name for ${day} to string:`, driverSchedule[day]);
                                                    }
                                                } catch (err) {
                                                    console.error(`Error processing driver for day ${day}:`, err);
                                                    driverSchedule[day] = "Error processing driver";
                                                }
                                            });
                                        }
                                    } else {
                                        console.log(`No driving schedule for cluster ${index}`);
                                    }
                                    
                                    console.log(`Final driverSchedule for cluster ${index}:`, driverSchedule);
                                    
                                    if (cluster.users) {
                                        cluster.users.forEach((user: any) => {
                                            if (user.drivingDays && Array.isArray(user.drivingDays)) {
                                                console.log(`User ${user.name} has drivingDays:`, user.drivingDays);
                                                user.drivingDays.forEach((day: number | string) => {
                                                    const dayKey = day.toString();
                                                    driverSchedule[dayKey] = user.name || user.userId || "Unknown Driver";
                                                    console.log(`Set driver for day ${dayKey} to ${driverSchedule[dayKey]} from user.drivingDays`);
                                                });
                                            }
                                            
                                            if (user.availability && Array.isArray(user.availability)) {
                                                console.log(`User ${user.name} has availability:`, user.availability);
                                                user.availability.forEach((day: number | string) => {
                                                    const dayKey = day.toString();
                                                    if (!driverSchedule[dayKey]) {
                                                        console.log(`Day ${dayKey} has no driver assigned yet, ${user.name} is available`);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                    
                                    return {
                                        id: index,
                                        members,
                                        memberIds,
                                        riders,
                                        driverSchedule,
                                        totalDistance,
                                        startTime: optimizerResults.timeInfo?.startTime || carpoolOrgInfo?.startTime || "",
                                        endTime: optimizerResults.timeInfo?.endTime || carpoolOrgInfo?.endTime || ""
                                    };
                                } catch (err) {
                                    console.error(`Error processing cluster ${index}:`, err);
                                    return {
                                        id: index,
                                        members: ["Error processing cluster"],
                                        memberIds: [],
                                        riders: [],
                                        driverSchedule: {},
                                        totalDistance: 0
                                    };
                                }
                            }),
                            unassignedMembers: optimizerResults.unclusteredUsers 
                                ? optimizerResults.unclusteredUsers.map(user => user.name || "Unknown user")
                                : [],
                            unassignedMemberIds: optimizerResults.unclusteredUsers 
                                ? optimizerResults.unclusteredUsers.map(user => user.userId || "unknown-id")
                                : [],
                            metrics: {
                                totalClusters: optimizerResults.finalClusters.length,
                                totalMembers: optimizerResults.finalClusters.reduce((total, cluster) => 
                                    total + (cluster.users ? cluster.users.length : 0), 0
                                ),
                                unassignedCount: optimizerResults.unclusteredUsers 
                                    ? optimizerResults.unclusteredUsers.length 
                                    : 0
                            }
                        };
                        
                        console.log("Transformed results:", transformedResults);
                        setResults(transformedResults);
                        
                        const dbResults = {
                            carpools: transformedResults.carpools.map(carpool => {
                                const memberTuples = carpool.memberIds.map((id, index) => [
                                    id,
                                    carpool.members[index] || "Unknown"
                                ]);
                                
                                const driverScheduleWithIds: Record<string, string> = {};
                                
                                Object.entries(carpool.driverSchedule).forEach(([day, driverName]) => {
                                    const driverIndex = carpool.members.findIndex(name => name === driverName);
                                    if (driverIndex >= 0 && driverIndex < carpool.memberIds.length) {
                                        driverScheduleWithIds[day] = carpool.memberIds[driverIndex];
                                    } else {
                                        driverScheduleWithIds[day] = "unknown-id";
                                    }
                                });
                                
                                const { memberIds, ...carpoolWithoutMemberIds } = carpool;
                                
                                return {
                                    ...carpoolWithoutMemberIds,
                                    members: memberTuples,
                                    driverSchedule: driverScheduleWithIds
                                };
                            }),
                            unassignedMembers: transformedResults.unassignedMemberIds.map((id, index) => [
                                id,
                                transformedResults.unassignedMembers[index] || "Unknown"
                            ]),
                            metrics: transformedResults.metrics
                        };

                        try {
                            const saveResponse = await fetch('/api/save-optimization', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    carpoolId,
                                    results: dbResults
                                }),
                            });
                            
                            if (!saveResponse.ok) {
                                const errorData = await saveResponse.json();
                                console.error("Error saving optimization results:", errorData);
                                setOptimizerError(`Failed to save results: ${errorData.error || 'Unknown error'}`);
                            }
                        } catch (error: any) {
                            console.error("Error saving optimization results:", error);
                            setOptimizerError(`Failed to save results: ${error.message || 'Unknown error'}`);
                        }
                    } catch (error: any) {
                        console.error("Error transforming optimization results:", error);
                        setOptimizerError(`Failed to process results: ${error.message || 'Unknown error'}`);
                    }
                } catch (error: any) {
                    console.error("Error running optimizer:", error);
                    setOptimizerError(`Optimizer error: ${error.message || 'Unknown error'}`);
                }
            } else {
                console.error("Carpool ID is null");
                setOptimizerError("Missing carpool ID");
            }
        } catch (error: any) {
            console.error("Unexpected error:", error);
            setOptimizerError(`Unexpected error: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const isNewPool = urlParams.get('newPool') === 'true';
        const newPoolParam = urlParams.get('newPool');
        
        console.log("URL params:", Object.fromEntries(urlParams.entries()));
        console.log("newPool param:", newPoolParam);
        
        if (isNewPool && userId) {
            console.log("This is a newly created pool. Setting owner to current user:", userId);
            setIsOwner(true);
            
            sessionStorage.setItem(`isOwner-${urlParams.get('carpoolId')}`, 'true');
        } else {
            const storedIsOwner = sessionStorage.getItem(`isOwner-${urlParams.get('carpoolId')}`);
            if (storedIsOwner === 'true') {
                console.log("Retrieved isOwner=true from session storage");
                setIsOwner(true);
            }
        }
    }, [userId]);

    const handleCarpoolsGet = useCallback(async () => {
        try {
            const carpoolId = new URLSearchParams(window.location.search).get(
                "carpoolId"
            );
            console.log("Fetching carpool data for carpoolId:", carpoolId);
            const response = await fetch(
                `/api/create-carpool-data?carpoolId=${carpoolId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                console.log("Full API response:", JSON.stringify(data, null, 2));
                
                let carpoolInfo = data?.createCarpoolData[0]?.createCarpoolData;
                if (!carpoolInfo) {
                    carpoolInfo = data?.createCarpoolData?.createCarpoolData;
                }
                if (!carpoolInfo) {
                    carpoolInfo = data?.createCarpoolData[0];
                }
                if (!carpoolInfo) {
                    carpoolInfo = data?.createCarpoolData;
                }
                
                console.log("Carpool info:", carpoolInfo);
                setCarpoolOrgInfo(carpoolInfo);
                
                console.log("User ID:", userId);
                
                const ownerId = carpoolInfo?.ownerId;
                const createdBy = carpoolInfo?.createdBy;
                const userId_ = carpoolInfo?.userId;
                const creatorId = carpoolInfo?.creatorId;
                
                console.log("Owner detection fields:", {
                    ownerId,
                    createdBy,
                    userId: userId_,
                    creatorId,
                    currentUserId: userId
                });
                
                if (
                    userId === ownerId || 
                    userId === createdBy || 
                    userId === userId_ ||
                    userId === creatorId
                ) {
                    console.log("Setting isOwner to true - matched field");
                    setIsOwner(true);
                } else if (carpoolInfo && !ownerId && !createdBy && !userId_ && !creatorId) {
                    console.log("No owner fields found - defaulting current user as owner");
                    setIsOwner(true);
                } else {
                    console.log("User is not the owner");
                }
                
                const selectedArray = carpoolInfo?.carpoolDays;
                const daysString = selectedArray?.length
                    ? selectedArray
                          .map((dayIndex: number) => daysOfWeek[dayIndex])
                          .join(", ")
                    : "";
                setCarpoolDays(daysString);
                
                if (carpoolInfo?.startTime && carpoolInfo?.endTime) {
                    setStartTime(carpoolInfo.startTime);
                    setEndTime(carpoolInfo.endTime);
                } else {
                    const notes = carpoolInfo?.notes;
                    if (notes && notes.includes("Times:")) {
                        try {
                            const timeMatch = notes.match(/Times: [A-Za-z]+: (\d+:\d+)-(\d+:\d+)/);
                            if (timeMatch && timeMatch.length >= 3) {
                                setStartTime(timeMatch[1]);
                                setEndTime(timeMatch[2]);
                            }
                        } catch (e) {
                            console.error("Error parsing time from notes:", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [userId]);

    const handleUserDataGet = useCallback(async () => {
        try {
            const targetId = new URLSearchParams(window.location.search).get(
                "carpoolId"
            );
            const response = await fetch(
                `/api/join-carpool-data?userId=${userId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                setUserLocation(data?.createCarpoolData.userData.userLocation);
                console.log(data?.createCarpoolData.userData.carpools);
                const foundCarpool = data?.createCarpoolData.userData.carpools.find((c: { carpoolId: any; }) => c.carpoolId === targetId);
                setFoundCarpool(foundCarpool);
                console.log(foundCarpool);
                const selectedArray = foundCarpool.drivingAvailability;
                const daysString = selectedArray?.length
                    ? selectedArray
                          .map((dayIndex: number) => daysOfWeek[dayIndex])
                          .join(", ")
                    : "";
                setDrivingAvailability(daysString);
                const ridersArray = foundCarpool.riders;
                setRiders(ridersArray.join(", "));
            } else {
                console.error("Failed to fetch data:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [userId]);

    useEffect(() => {
        handleCarpoolsGet();
        handleUserDataGet();
        fetchOptimizationResults();
        
        console.log("isOwner state:", isOwner);
    }, [userId, handleCarpoolsGet, handleUserDataGet, fetchOptimizationResults, isOwner]);

    const handleEditOrgInfo = () => {
        if (!isOwner) {
            alert("Only the carpool owner can edit organization information.");
            return;
        }
        
        setTempOrgInfo(carpoolOrgInfo);
        
        if (carpoolOrgInfo?.carpoolDays && Array.isArray(carpoolOrgInfo.carpoolDays)) {
            setSelectedDays(carpoolOrgInfo.carpoolDays);
        }
        
        setTempStartTime(startTime || "");
        setTempEndTime(endTime || "");
        
        setIsEditingOrgInfo(true);
    };
    
    const handleCancelOrgEdit = () => {
        setIsEditingOrgInfo(false);
    };
    
    const handleSaveOrgInfo = async () => {
        try {
            const carpoolId = new URLSearchParams(window.location.search).get("carpoolId");
            
            console.log("Starting organization info update");
            console.log("CarpoolId:", carpoolId);
            
            if (!carpoolOrgInfo) {
                console.error("Missing carpoolOrgInfo");
                alert("Cannot update: Missing carpool organization information");
                return;
            }
            
            console.log("Current org info:", JSON.stringify(carpoolOrgInfo));
            console.log("Selected days:", selectedDays);
            console.log("Time values:", { start: tempStartTime, end: tempEndTime });
            
            const updatedOrgInfo = {
                ...carpoolOrgInfo,
                carpoolDays: selectedDays,
                startTime: tempStartTime,
                endTime: tempEndTime
            };
            
            console.log("Sending updated org info:", JSON.stringify(updatedOrgInfo));
            
            const response = await fetch('/api/update-carpool', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    carpoolId,
                    carpoolData: updatedOrgInfo
                }),
            });
            
            console.log("Update response status:", response.status);
            
            if (response.ok) {
                setCarpoolOrgInfo(updatedOrgInfo);
                
                const sortedDays = selectedDays.sort((a, b) => a - b);
                const daysString = sortedDays.length
                    ? sortedDays.map((dayIndex) => daysOfWeek[dayIndex]).join(", ")
                    : "";
                setCarpoolDays(daysString);
                
                setStartTime(tempStartTime);
                setEndTime(tempEndTime);
                
                setIsEditingOrgInfo(false);
                
                alert("Organization information updated successfully!");
            } else {
                const errorText = await response.text();
                console.error("Failed to update organization information:", errorText);
                alert(`Failed to update organization information: ${errorText}`);
            }
        } catch (error) {
            console.error("Error updating organization information:", error);
            alert("An error occurred while updating organization information");
        }
    };
    
    const toggleDay = (dayIndex: number) => {
        setSelectedDays(prev => {
            if (prev.includes(dayIndex)) {
                return prev.filter(d => d !== dayIndex);
            } else {
                return [...prev, dayIndex];
            }
        });
    };
    
    const loadUserChildren = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await fetch(`/api/user-form-data?userId=${userId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user form data");
            }
            const data = await response.json();
            const doc = data.userFormData;
            if (doc && doc.userFormData && doc.userFormData.children) {
                const children = doc.userFormData.children || [];
                const mappedChildren = children.map((child: any, idx: number) => ({
                    id: child.id || `child-${idx}`,
                    name: child.name,
                }));
                setUserChildren(mappedChildren);
            }
        } catch (error) {
            console.error("Error loading user children:", error);
        }
    }, [userId]);

    useEffect(() => {
        loadUserChildren();
    }, [loadUserChildren]);

    const handleEditMyInfo = () => {
        if (foundCarpool) {
            if (foundCarpool.drivingAvailability) {
                setTempDrivingDays(foundCarpool.drivingAvailability);
                
                const dayValues = foundCarpool.drivingAvailability.map(dayNum => {
                    const day = DAYS_OF_WEEK.find(d => d.number === dayNum);
                    return day ? day.value : "";
                }).filter(value => value !== "");
                
                setTempDrivingAvailability(dayValues);
            }
            
            const selectedRiders = foundCarpool.riders || [];
            
            const riderSelections = userChildren.map(child => ({
                id: child.id,
                name: child.name,
                selected: selectedRiders.includes(child.name)
            }));
            
            setTempRiders(riderSelections);
            setTempCarCapacity(foundCarpool.carCapacity || 0);
        }
        
        if (userLocation) {
            setTempAddress(userLocation.address || "");
            setTempCity(userLocation.city || "");
            setTempState(userLocation.state || "");
            setTempZipCode(userLocation.zipCode || "");
        }
        
        setIsEditingMyInfo(true);
    };
    
    const handleCancelMyInfoEdit = () => {
        setIsEditingMyInfo(false);
    };
    
    const handleSaveMyInfo = async () => {
        try {
            const carpoolId = new URLSearchParams(window.location.search).get("carpoolId");
            
            if (!foundCarpool || !carpoolId) {
                alert("Cannot update: Missing carpool information");
                return;
            }
            
            const selectedRiderNames = tempRiders
                .filter(rider => rider.selected)
                .map(rider => rider.name);
            
            const drivingDaysAsNumbers = tempDrivingAvailability
                .map(dayValue => {
                    const day = DAYS_OF_WEEK.find(d => d.value === dayValue);
                    return day ? day.number : -1;
                })
                .filter(num => num !== -1)
                .sort((a, b) => a - b);
            
            const updatedUserInfo: Carpool = {
                ...foundCarpool,
                carpoolId: carpoolId,
                drivingAvailability: drivingDaysAsNumbers,
                riders: selectedRiderNames,
                carCapacity: tempCarCapacity,
                notes: foundCarpool.notes || ""
            };
            
            const updatedUserLocation: UserLocation = {
                address: tempAddress,
                city: tempCity,
                state: tempState,
                zipCode: tempZipCode
            };
            
            const response = await fetch('/api/update-user-carpool', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    carpoolId,
                    carpoolData: updatedUserInfo,
                    userLocation: updatedUserLocation
                }),
            });
            
            if (response.ok) {
                setFoundCarpool(updatedUserInfo);
                setUserLocation(updatedUserLocation);
                
                const daysString = drivingDaysAsNumbers?.length
                    ? drivingDaysAsNumbers
                          .map((dayIndex) => daysOfWeek[dayIndex])
                          .join(", ")
                    : "";
                setDrivingAvailability(daysString);
                
                setRiders(selectedRiderNames.join(", "));
                
                setIsEditingMyInfo(false);
                
                alert("Your information updated successfully!");
            } else {
                alert("Failed to update your information");
            }
        } catch (error) {
            console.error("Error updating your information:", error);
            alert("An error occurred while updating your information");
        }
    };
    
    const toggleAvailability = (dayValue: string) => {
        setTempDrivingAvailability(prev => 
            prev.includes(dayValue) 
                ? prev.filter(d => d !== dayValue) 
                : [...prev, dayValue]
        );
    };
    
    const handleRiderToggle = (id: string) => {
        setTempRiders(prev => 
            prev.map(rider => 
                rider.id === id ? { ...rider, selected: !rider.selected } : rider
            )
        );
    };
    
    const toggleMyAvailabilityDay = (dayIndex: number) => {
        setTempDrivingDays(prev => {
            if (prev.includes(dayIndex)) {
                return prev.filter(d => d !== dayIndex);
            } else {
                return [...prev, dayIndex];
            }
        });
    };

    // leaving carppol handlers
    const handleLeaveClick = () => {
        setIsLeaveModalOpen(true);
    };

    const handleCancelLeave = () => {
        setIsLeaveModalOpen(false);
    };

    const handleConfirmLeave = async () => {
        setIsLeaving(true);
        setLeaveError(null);
        
        try {
            const carpoolId = new URLSearchParams(window.location.search).get("carpoolId");
            if (!carpoolId || !userId) {
                throw new Error("Missing required information");
            }

            const response = await fetch("/api/leave-carpool", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    carpoolId,
                    userId,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to leave carpool");
            }

            // Redirect back to carpools page after successful leave
            router.push("/carpools");
        } catch (error: any) {
            console.error("Error leaving carpool:", error);
            setLeaveError(error.message || "Failed to leave carpool");
        } finally {
            setIsLeaving(false);
            setIsLeaveModalOpen(false);
        }
    };

    return (
        <>
            <div className="w-11/12 mx-auto px-1">
                <BackButton onClick={handleConfirmBack} />
            </div>
            <div className="justify-center flex flex-col w-6/12 mx-auto p-10 gap-6 rounded-md">
                <div className="flex-col justify-start items-start gap-5 flex">
                    <div className="text-black text-2xl font-bold font-['Open Sans']">
                        {carpoolOrgInfo?.carpoolName}
                    </div>
                    <div className="self-stretch justify-start items-start inline-flex gap-10">
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            Closes on March 4
                        </div>
                        <div className="text-blue text-xl font-bold font-['Open Sans']">
                            Close Now
                        </div>
                    </div>
                </div>
                <div className="py-10 flex-col justify-start items-start gap-5 flex">
                    <div className="self-stretch justify-between items-start inline-flex">
                        <div className="text-black text-xl font-bold font-['Open Sans']">
                            Organization Information
                        </div>
                        <div 
                            className="text-blue text-xl font-bold font-['Open Sans'] cursor-pointer" 
                            onClick={handleEditOrgInfo}
                        >
                            Edit
                        </div>
                    </div>
                    
                    {isEditingOrgInfo ? (
                        <div className="w-full p-4 border rounded-md bg-gray-50">
                            <div className="mb-4">
                                <div className="text-gray font-bold mb-2">Select Days</div>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day.number}
                                            className={`px-3 py-1 rounded ${
                                                selectedDays.includes(day.number)
                                                    ? "bg-blue text-white"
                                                    : "bg-gray-200 text-gray-700"
                                            }`}
                                            onClick={() => toggleDay(day.number)}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <div className="text-gray font-bold mb-2">Start Time</div>
                                <input
                                    type="time"
                                    className="border p-2 rounded w-full"
                                    value={tempStartTime}
                                    onChange={(e) => setTempStartTime(e.target.value)}
                                />
                            </div>
                            
                            <div className="mb-4">
                                <div className="text-gray font-bold mb-2">End Time</div>
                                <input
                                    type="time"
                                    className="border p-2 rounded w-full"
                                    value={tempEndTime}
                                    onChange={(e) => setTempEndTime(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    className="px-4 py-2 border rounded text-gray-700"
                                    onClick={handleCancelOrgEdit}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue rounded text-white"
                                    onClick={handleSaveOrgInfo}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex-col justify-start items-start gap-2.5 flex">
                                <div className="text-gray text-xl font-bold font-['Open Sans']">
                                    Location
                                </div>
                                <div className="text-gray text-xl font-normal font-['Open Sans']">{`${carpoolOrgInfo?.carpoolLocation.name}, ${carpoolOrgInfo?.carpoolLocation.address}, ${carpoolOrgInfo?.carpoolLocation.city}, ${carpoolOrgInfo?.carpoolLocation.state} ${carpoolOrgInfo?.carpoolLocation.zipCode}`}</div>
                            </div>
                            <div className="flex-col justify-start items-start gap-2.5 flex">
                                <div className="text-gray text-xl font-bold font-['Open Sans']">
                                    Occurs Every
                                </div>
                                <div className="text-gray text-xl font-normal font-['Open Sans']">
                                    {carpoolDays}
                                </div>
                            </div>
                            <div className="flex-col justify-start items-start gap-2.5 flex">
                                <div className="text-gray text-xl font-bold font-['Open Sans']">
                                    Time
                                </div>
                                <div className="text-gray text-xl font-normal font-['Open Sans']">
                                    {startTime && endTime ? `${startTime} - ${endTime}` : "Time not available"}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="w-8/12 flex-col justify-start items-start gap-5 flex">
                    <div className="self-stretch justify-start items-center gap-5 inline-flex">
                        <div className="text-black text-xl font-bold font-['Open Sans']">
                            Carpools
                        </div>
                        <div className="text-black">
                            {isOwner ? "(You are the owner)" : "(You are not the owner)"}
                        </div>
                        {isOwner && (
                            <div className="px-6 py-2 bg-blue rounded-md justify-center items-center inline-flex">
                                {!loading && (
                                    <button
                                        className="text-center text-white text-base font-normal font-['Open Sans']"
                                        onClick={runOptimizer}
                                    >
                                        Run Optimizer
                                    </button>
                                )}
                                {loading && (
                                    <div className="text-center text-white text-base font-normal font-['Open Sans']">
                                        Optimizing...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {optimizerError && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                            <p><strong>Error:</strong> {optimizerError}</p>
                        </div>
                    )}
                    
                    {!results && (
                        <div className="flex-col justify-start items-start gap-2.5 flex">
                            <div className="text-gray text-xl font-normal font-['Open Sans']">
                                {isOwner 
                                    ? "No pools yet - run the optimizer to create groupings!" 
                                    : "No pools yet - the carpool owner needs to run the optimizer."}
                            </div>
                        </div>
                    )}
                    
                    {results && (
                        <div className="w-full flex-col justify-start items-start gap-6 flex mt-4">
                            <div className="text-black text-lg font-semibold font-['Open Sans']">
                                Optimization Results
                            </div>
                            
                            {results.carpools && results.carpools.length > 0 ? (
                                results.carpools.map((carpool: any, index: number) => (
                                    <div key={index} className="w-full p-4 border border-gray-200 rounded-md shadow-sm">
                                        <div className="text-blue font-semibold text-lg mb-2">
                                            Carpool Group {index + 1}
                                        </div>
                                        
                                        <div className="text-black grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-gray font-bold text-md">Driver Schedule</div>
                                                <div className="mt-1">
                                                    {carpool.driverSchedule && Object.keys(carpool.driverSchedule).length > 0 ? (
                                                        Object.entries(carpool.driverSchedule)
                                                            .map(([day, driver]: [string, any]) => {
                                                                let dayIndex;
                                                                
                                                                if (/^\d+$/.test(day)) {
                                                                    dayIndex = parseInt(day, 10);
                                                                } else {
                                                                    const lowerDay = day.toLowerCase();
                                                                    for (let i = 0; i < daysOfWeek.length; i++) {
                                                                        if (daysOfWeek[i].toLowerCase() === lowerDay) {
                                                                            dayIndex = i;
                                                                            break;
                                                                        }
                                                                    }
                                                                    if (dayIndex === undefined) dayIndex = 999;
                                                                }
                                                                
                                                                return { day, driver, dayIndex };
                                                            })
                                                            .sort((a, b) => a.dayIndex - b.dayIndex)
                                                            .map(({ day, driver, dayIndex }, idx) => {
                                                                try {
                                                                    let displayDriver;
                                                                    if (typeof driver === 'object' && driver !== null) {
                                                                        displayDriver = (driver?.name || driver?.userId || JSON.stringify(driver));
                                                                    } else {
                                                                        displayDriver = String(driver || "Unassigned");
                                                                    }
                                                                    
                                                                    let dayName = day;
                                                                    if (/^\d+$/.test(day)) {
                                                                        if (optimizerDayMap[day]) {
                                                                            dayName = optimizerDayMap[day];
                                                                        } else {
                                                                            const dayIdx = parseInt(day, 10);
                                                                            if (dayIdx >= 0 && dayIdx < daysOfWeek.length) {
                                                                                dayName = daysOfWeek[dayIdx];
                                                                            }
                                                                        }
                                                                    }
                                                                    
                                                                    return (
                                                                        <div key={idx} className="flex justify-between items-center py-1">
                                                                            <span className="text-gray-600">{dayName}:</span>
                                                                            <span className="font-medium">{displayDriver}</span>
                                                                        </div>
                                                                    );
                                                                } catch (error) {
                                                                    console.error(`Error rendering driver for day ${day}:`, error);
                                                                    return (
                                                                        <div key={idx} className="flex justify-between items-center py-1">
                                                                            <span className="text-gray-600">{day}:</span>
                                                                            <span className="font-medium text-red-500">Error displaying driver</span>
                                                                        </div>
                                                                    );
                                                                }
                                                            })
                                                    ) : (
                                                        <div className="text-gray-500 italic">No driver schedule available</div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div className="text-gray font-bold text-md">Members</div>
                                                <div className="mt-1">
                                                    {carpool.members && carpool.members.length > 0 ? (
                                                        carpool.members.map((member: string, idx: number) => (
                                                            <div key={idx} className="py-1 text-gray-600">
                                                                {member}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-gray-500 italic">No members available</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {carpool.riders && carpool.riders.length > 0 && (
                                            <div className="mt-3">
                                                <div className="text-gray font-bold text-md">Riders</div>
                                                <div className="mt-1 text-gray-600">
                                                    {carpool.riders.join(", ")}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {carpool.totalDistance && (
                                            <div className="mt-3 text-sm text-gray-500">
                                                Total distance: {carpool.totalDistance.toFixed(2)} miles
                                            </div>
                                        )}
                                        
                                        {(carpool.startTime && carpool.endTime) ? (
                                            <div className="mt-3 text-sm text-gray-700">
                                                Time: {carpool.startTime} - {carpool.endTime}
                                            </div>
                                        ) : (
                                            startTime && endTime && (
                                                <div className="mt-3 text-sm text-gray-700">
                                                    Time: {startTime} - {endTime}
                                                </div>
                                            )
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 italic">No carpool groups were created by the optimizer</div>
                            )}
                            
                            {results.unassignedMembers && results.unassignedMembers.length > 0 && (
                                <div className="text-black w-full p-4 border border-gray rounded-md mt-4">
                                    <div className="text-red-500 font-semibold text-lg mb-2">
                                        Unassigned Members
                                    </div>
                                    <div className="text-gray-600">
                                        {results.unassignedMembers.join(", ")}
                                    </div>
                                </div>
                            )}

                            {results.metrics && (
                                <div className="text-black w-full p-4 border border-gray rounded-md mt-4">
                                    <div className="text-black font-semibold text-lg mb-2">
                                        Optimization Metrics
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(results.metrics).map(([key, value]: [string, any]) => (
                                            <div key={key} className="flex justify-between items-center py-1">
                                                <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                                                <span className="font-medium">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex-col justify-start items-start gap-2.5 flex mt-6">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            All Members
                        </div>
                        <div className="flex-col justify-start items-start gap-2.5 flex">
                            <div className="text-gray text-xl font-normal font-['Open Sans']">
                                Megan Wagner, Asha Vora, Tom Papa, Ben Aimasiko,
                                David Pursell, Bijoy Vallamattam, Lorie Langan,
                                Michael Li, Mary Rice, John Barry, Janice
                                McAniff, Nadia Lin
                            </div>
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            All Riders
                        </div>
                        <div className="flex-col justify-start items-start gap-2.5 flex">
                            <div className="text-gray text-xl font-normal font-['Open Sans']">
                                Lauren Wagner, Shivani Vora, Nathan Papa, Peter
                                Aimasiko, Benedict Pursell, Annie Vallamattam,
                                Grace Langan, Bryan Li, Thomas Rice, Patrick
                                Barry, Alex McAniff, Nathan Lin
                            </div>
                        </div>
                    </div>
                </div>
                <div className="py-10 flex-col justify-start items-start gap-5 flex">
                    <div className="self-stretch justify-between items-start inline-flex">
                        <div className="text-black text-xl font-bold font-['Open Sans']">
                            My Information
                        </div>
                        <div 
                            className="text-blue text-xl font-bold font-['Open Sans'] cursor-pointer"
                            onClick={handleEditMyInfo}
                        >
                            Edit
                        </div>
                    </div>
                    
                    {isEditingMyInfo ? (
                        <div className="w-full p-4 border rounded-md bg-gray-50">
                            <div className="mb-4">
                                <div className="text-gray font-bold mb-2">Address</div>
                                <input
                                    type="text"
                                    className="border p-2 rounded w-full mb-2"
                                    value={tempAddress}
                                    onChange={(e) => setTempAddress(e.target.value)}
                                    placeholder="Street Address"
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        className="border p-2 rounded"
                                        value={tempCity}
                                        onChange={(e) => setTempCity(e.target.value)}
                                        placeholder="City"
                                    />
                                    <input
                                        type="text"
                                        className="border p-2 rounded"
                                        value={tempState}
                                        onChange={(e) => setTempState(e.target.value)}
                                        placeholder="State"
                                    />
                                    <input
                                        type="text"
                                        className="border p-2 rounded"
                                        value={tempZipCode}
                                        onChange={(e) => setTempZipCode(e.target.value)}
                                        placeholder="Zip Code"
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <div className="text-gray font-bold mb-2">Driving Availability</div>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day.value}
                                            className={`px-3 py-1 rounded ${
                                                tempDrivingAvailability.includes(day.value)
                                                    ? "bg-blue text-white"
                                                    : "bg-gray-200 text-gray-700"
                                            }`}
                                            onClick={() => toggleAvailability(day.value)}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <div className="text-gray font-bold mb-2">Riders</div>
                                {tempRiders.length > 0 ? (
                                    <div className="space-y-2">
                                        {tempRiders.map(rider => (
                                            <div key={rider.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`rider-${rider.id}`}
                                                    checked={rider.selected}
                                                    onChange={() => handleRiderToggle(rider.id)}
                                                    className="mr-2"
                                                />
                                                <label htmlFor={`rider-${rider.id}`}>{rider.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 italic">No children added to your profile</div>
                                )}
                            </div>
                            
                            <div className="mb-4">
                                <div className="text-gray font-bold mb-2">Car Capacity</div>
                                <input
                                    type="number"
                                    className="border p-2 rounded w-full"
                                    value={tempCarCapacity}
                                    onChange={(e) => setTempCarCapacity(parseInt(e.target.value) || 0)}
                                    min="0"
                                    max="10"
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    className="px-4 py-2 border rounded text-gray-700"
                                    onClick={handleCancelMyInfoEdit}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue rounded text-white"
                                    onClick={handleSaveMyInfo}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex-col justify-start items-start gap-2.5 flex">
                                <div className="text-gray text-xl font-bold font-['Open Sans']">
                                    Location
                                </div>
                                <div className="text-gray text-xl font-normal font-['Open Sans']">{`${userLocation?.address}, ${userLocation?.city}, ${userLocation?.state} ${userLocation?.zipCode}`}</div>
                            </div>
                            <div className="flex-col justify-start items-start gap-2.5 flex">
                                <div className="text-gray text-xl font-bold font-['Open Sans']">
                                    Driving Availability
                                </div>
                                <div className="text-gray text-xl font-normal font-['Open Sans']">
                                    {drivingAvailability}
                                </div>
                            </div>
                            <div className="flex-col justify-start items-start gap-2.5 flex">
                                <div className="text-gray text-xl font-bold font-['Open Sans']">
                                    Rider(s)
                                </div>
                                <div className="text-gray text-xl font-normal font-['Open Sans']">
                                    {riders}
                                </div>
                            </div>
                            <div className="flex-col justify-start items-start gap-2.5 flex">
                                <div className="text-gray text-xl font-bold font-['Open Sans']">
                                    Car Capacity
                                </div>
                                <div className="text-gray text-xl font-normal font-['Open Sans']">
                                    {foundCarpool?.carCapacity}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex-col justify-start items-start gap-5 flex">
                    <div className="justify-start items-start gap-5 inline-flex">
                        <div className="text-black text-xl font-bold font-['Open Sans']">
                            My Carpool
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Members
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            Megan Wagner, Asha Vora, Tom Papa
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Driving Days
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            ?????
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Riders
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            Lauren Wagner, Shivani Vora, Nathan Papa
                        </div>
                    </div>
                    <div className="flex-col justify-start items-start gap-2.5 flex">
                        <div className="text-gray text-xl font-bold font-['Open Sans']">
                            Notes
                        </div>
                        <div className="text-gray text-xl font-normal font-['Open Sans']">
                            Asha Vora - my child has a peanut allergy!
                            <br />
                            Tom Papa - Nathan has an oversized backpack
                        </div>
                    </div>
                </div>
            </div>


            {!isOwner && (
                <div className="py-2 mt-0 flex justify-center">
                    <button
                        onClick={handleLeaveClick}
                        className="px-8 py-4 bg-red-600 text-red text-2xl font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Leave Carpool
                    </button>
                    {leaveError && (
                        <div className="mt-2 text-red-600">{leaveError}</div>
                    )}
                </div>
            )}

            {/* Leave Confirmation Modal */}
            {isLeaveModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-4 text-black">Leave Carpool</h2>
                        <p className="text-black text-lg mb-6">
                            Are you sure you want to leave this carpool? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleCancelLeave}
                                className="px-6 py-3 text-black text-lg hover:bg-gray-100 rounded-lg"
                                disabled={isLeaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmLeave}
                                className="px-6 py-3 bg-red-600 text-black text-lg font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400"
                                disabled={isLeaving}
                            >
                                {isLeaving ? "Leaving..." : "Leave"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CarpoolPage;
