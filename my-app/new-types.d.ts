interface Availability {
    day: string;
    timeRange: string;
}

interface UserFormData {
    numChildren: number;
    children: { name: string }[];
    carCapacity: number;
    availabilities: Availability[];
}
