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
}

interface SharedLocation extends UserLocation {
    name: string;
}

interface Carpool {
    carpoolId: string;
    riders: string[];
    notes: string;
}

interface JoinCarpoolData {
    userLocation: UserLocation,
    drivingAvailability: number[],
    carCapacity: number,
    carpools: Carpool[]
}

interface CreateCarpoolData {
    creatorId: string; // person who creates carpool
    carpoolName: string;
    carpoolLocation: SharedLocation;
    carpoolDays: number[];
    notes: string;
    carpoolMembers: string[];
}

//separate interface for the database document structure 
interface UserDocument {
    userId: string;
    userFormData: UserFormData;
    isFormComplete: boolean;
}

