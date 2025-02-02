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
    owner: string;
    location: UserLocation; // should I re-use that interface to keep it consistent, or should it be a string, or diff type of object?
    times: Availability[]; // same thing thing with above comment
    notes: string;
}

//separate interface for the database document structure 
interface UserDocument {
    userId: string;
    userFormData: UserFormData;
    isFormComplete: boolean;
}

