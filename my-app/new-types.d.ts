interface Availability {
    day: string;
    timeRange: string;
}

interface UserLocation {
    address: string;
    city: string;
    state: string;
    zipCode: string;
}

interface UserFormData {
    numChildren: number;
    children: { name: string }[];
    carCapacity: number;
    availabilities: Availability[];
    location: UserLocation;
    phoneNumber: string;
}

interface SharedLocation extends UserLocation {
    name: string;
}

interface Carpool {
    carpoolId: string;
    riders: string[];
    notes: string;
    drivingAvailability: number[];
    carCapacity: number;
}

interface JoinCarpoolData {
    userLocation: UserLocation,
    carpools: Carpool[]
}

interface CreateCarpoolData {
    creatorId: string; // person who creates carpool
    carpoolName: string;
    carpoolLocation: SharedLocation;
    carpoolDays: number[];
    startTime: string;
    endTime: string;
    notes: string;
    carpoolMembers: string[];
}

//separate interface for the database document structure 
interface UserDocument {
    userId: string;
    userFormData: UserFormData;
    isFormComplete: boolean;
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

