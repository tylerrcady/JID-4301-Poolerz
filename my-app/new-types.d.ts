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

interface CreateCarpoolData {
    creatorId: string; // owner's user ID
    times: Availability[]; // same thing thing with above comment
    notes: string;
    members: string[];
}

//separate interface for the database document structure 
interface UserDocument {
    userId: string;
    userFormData: UserFormData;
    isFormComplete: boolean;
}

