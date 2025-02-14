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
    creatorId: string; // person who creates carpool
    carpoolName: string;
    carpoolLocation: UserLocation;
    carpoolDays: number[];
    notes: string;
    carpoolMembers: [creatorId]; // initializes members[0] = creatorId
}

//separate interface for the database document structure 
interface UserDocument {
    userId: string;
    userFormData: UserFormData;
    isFormComplete: boolean;
}

