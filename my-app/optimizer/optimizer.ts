import { getCoordinatesFromAddress } from "../optimizer-helpers/coords";
import { haversineDistance } from "../optimizer-helpers/distance-fn";

interface Location {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    name?: string;
}

interface User {
    userId: string;
    name: string;
    numchildren: number;
    children: string[];
    carCapacity: number;
    location: Location;
}

interface Availability {
    userId: string;
    availability: number[];
}

interface Coordinates {
    lat: number;
    lng: number;
}

interface UserWithCoords extends User {
    coordinates: Coordinates;
    availability: number[];
}

interface CarpoolInput {
    carpoolId: string;
    carpoolName: string;
    carpoolLocation: Location;
    carpoolDays: number[];
    carpoolMembers: number[];
    availabilities: Availability[];
    users: User[];
}

interface Cluster {
    users: UserWithCoords[];
    centroid: Coordinates;
}

export class CarpoolOptimizer {
    private users: UserWithCoords[] = [];
    private carpoolDays: number[] = [];
    private unclusteredUsers: UserWithCoords[] = [];
    private readonly apiKey: string;
    private static readonly MAX_CLUSTER_SIZE = 6;
    private static readonly MIN_CLUSTER_SIZE = 2;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async optimize(input: CarpoolInput): Promise<{
        initialClusters: Cluster[];
        validatedClusters: Cluster[];
        finalClusters: Cluster[];
        unclusteredUsers: UserWithCoords[];
    }> {
        await this.initializeUsers(input);
        this.carpoolDays = input.carpoolDays;

        const eps = this.findOptimalEpsilon();
        const initialClusters = this.runDBSCAN(
            eps,
            CarpoolOptimizer.MIN_CLUSTER_SIZE
        );

        const validatedClusters =
            this.validateAndSplitClusters(initialClusters);
        const finalResults = this.finalizeAndCorrectClusters(validatedClusters);

        return {
            initialClusters,
            validatedClusters,
            finalClusters: finalResults.finalClusters,
            unclusteredUsers: finalResults.unclusteredUsers,
        };
    }

    private async initializeUsers(input: CarpoolInput): Promise<void> {
        for (const user of input.users) {
            const coords = await getCoordinatesFromAddress(
                user.location.address,
                user.location.city,
                user.location.state,
                user.location.zipCode,
                this.apiKey
            );

            const userAvailability = input.availabilities.find(
                (a) => a.userId === user.userId
            );

            this.users.push({
                ...user,
                coordinates: coords,
                availability: userAvailability?.availability || [],
            });
        }
    }

    private findOptimalEpsilon(): number {
        const distances: number[] = [];
        for (let i = 0; i < this.users.length; i++) {
            for (let j = i + 1; j < this.users.length; j++) {
                distances.push(
                    haversineDistance(
                        this.users[i].coordinates.lat,
                        this.users[i].coordinates.lng,
                        this.users[j].coordinates.lat,
                        this.users[j].coordinates.lng
                    )
                );
            }
        }
        distances.sort((a, b) => a - b);
        console.log(distances);
        const index = Math.floor(distances.length * 0.1);
        console.log("Opt. Eps: ", distances[index]);
        return distances[index];
    }

    private runDBSCAN(eps: number, minPts: number): Cluster[] {
        const visited = new Set<string>();
        const clusters: Cluster[] = [];
        this.unclusteredUsers = [];

        for (const user of this.users) {
            if (visited.has(user.userId)) continue;
            visited.add(user.userId);

            const neighbors = this.getNeighbors(user, eps);
            if (neighbors.length < minPts - 1) {
                this.unclusteredUsers.push(user);
                continue;
            }

            const cluster: UserWithCoords[] = [user];
            this.expandCluster(neighbors, cluster, eps, minPts, visited);

            clusters.push({
                users: cluster,
                centroid: this.calculateCentroid(cluster),
            });
        }

        return clusters;
    }

    private getNeighbors(user: UserWithCoords, eps: number): UserWithCoords[] {
        return this.users.filter(
            (other) =>
                user.userId !== other.userId &&
                haversineDistance(
                    user.coordinates.lat,
                    user.coordinates.lng,
                    other.coordinates.lat,
                    other.coordinates.lng
                ) <= eps
        );
    }

    private expandCluster(
        neighbors: UserWithCoords[],
        cluster: UserWithCoords[],
        eps: number,
        minPts: number,
        visited: Set<string>
    ): void {
        const queue = [...neighbors];

        while (queue.length > 0) {
            const current = queue.shift()!;

            if (!visited.has(current.userId)) {
                visited.add(current.userId);
                const newNeighbors = this.getNeighbors(current, eps);

                if (newNeighbors.length >= minPts - 1) {
                    queue.push(
                        ...newNeighbors.filter(
                            (n) =>
                                !visited.has(n.userId) &&
                                !queue.some((q) => q.userId === n.userId)
                        )
                    );
                }
            }

            if (!cluster.some((u) => u.userId === current.userId)) {
                cluster.push(current);
            }
        }
    }

    private calculateCentroid(users: UserWithCoords[]): Coordinates {
        const sum = users.reduce(
            (acc, user) => ({
                lat: acc.lat + user.coordinates.lat,
                lng: acc.lng + user.coordinates.lng,
            }),
            { lat: 0, lng: 0 }
        );

        return {
            lat: sum.lat / users.length,
            lng: sum.lng / users.length,
        };
    }

    private validateCluster(cluster: Cluster): boolean {
        const totalMembers = cluster.users.length;

        const hasValidCapacity = cluster.users.some((user) => {
            return user.carCapacity >= totalMembers;
        });

        if (!hasValidCapacity) {
            return false;
        }

        return this.carpoolDays.every((day) =>
            cluster.users.some((user) => user.availability.includes(day))
        );
    }

    private validateAndSplitClusters(clusters: Cluster[]): Cluster[] {
        const validatedClusters: Cluster[] = [];

        for (const cluster of clusters) {
            if (cluster.users.length > CarpoolOptimizer.MAX_CLUSTER_SIZE) {
                const subClusters = this.splitLargeCluster(cluster.users);
                validatedClusters.push(...subClusters);
            } else if (this.validateCluster(cluster)) {
                validatedClusters.push(cluster);
            } else {
                this.unclusteredUsers.push(...cluster.users);
            }
        }

        return validatedClusters;
    }

    private finalizeAndCorrectClusters(clusters: Cluster[]): {
        finalClusters: Cluster[];
        unclusteredUsers: UserWithCoords[];
    } {
        const finalClusters: Cluster[] = [];
        const processedUnclusteredUsers = [...this.unclusteredUsers];

        for (const cluster of clusters) {
            if (this.validateCluster(cluster)) {
                finalClusters.push(cluster);
            } else {
                processedUnclusteredUsers.push(...cluster.users);
            }
        }

        return {
            finalClusters,
            unclusteredUsers: processedUnclusteredUsers,
        };
    }

    private splitLargeCluster(cluster: UserWithCoords[]): Cluster[] {
        const TARGET_SIZE = 3;
        const subClusters: Cluster[] = [];
        let remainingUsers = [...cluster];

        while (remainingUsers.length >= CarpoolOptimizer.MIN_CLUSTER_SIZE) {
            if (remainingUsers.length <= TARGET_SIZE) {
                const newCluster = {
                    users: remainingUsers,
                    centroid: this.calculateCentroid(remainingUsers),
                };

                if (this.validateCluster(newCluster)) {
                    subClusters.push(newCluster);
                    remainingUsers = [];
                } else {
                    this.unclusteredUsers.push(...remainingUsers);
                    remainingUsers = [];
                }
                break;
            }

            let bestCenter = remainingUsers[0];
            let minTotalDistance = Infinity;

            for (const potentialCenter of remainingUsers) {
                const distances = remainingUsers
                    .filter((u) => u.userId !== potentialCenter.userId)
                    .map((other) =>
                        haversineDistance(
                            potentialCenter.coordinates.lat,
                            potentialCenter.coordinates.lng,
                            other.coordinates.lat,
                            other.coordinates.lng
                        )
                    );

                const totalDistance = distances.reduce(
                    (sum, dist) => sum + dist,
                    0
                );
                if (totalDistance < minTotalDistance) {
                    minTotalDistance = totalDistance;
                    bestCenter = potentialCenter;
                }
            }

            const distances = remainingUsers
                .filter((u) => u.userId !== bestCenter.userId)
                .map((user) => ({
                    user,
                    distance: haversineDistance(
                        bestCenter.coordinates.lat,
                        bestCenter.coordinates.lng,
                        user.coordinates.lat,
                        user.coordinates.lng
                    ),
                }))
                .sort((a, b) => a.distance - b.distance);

            const clusterUsers = [
                bestCenter,
                ...distances.slice(0, TARGET_SIZE - 1).map((d) => d.user),
            ];

            const newCluster = {
                users: clusterUsers,
                centroid: this.calculateCentroid(clusterUsers),
            };

            if (this.validateCluster(newCluster)) {
                subClusters.push(newCluster);
                remainingUsers = remainingUsers.filter(
                    (user) =>
                        !clusterUsers.some((u) => u.userId === user.userId)
                );
            } else {
                remainingUsers = remainingUsers.filter(
                    (user) => user.userId !== bestCenter.userId
                );
                this.unclusteredUsers.push(bestCenter);
            }
        }

        if (remainingUsers.length > 0) {
            this.unclusteredUsers.push(...remainingUsers);
        }

        return subClusters;
    }

    private logClusters(clusters: Cluster[]): string {
        return JSON.stringify(
            clusters.map((cluster) => ({
                size: cluster.users.length,
                users: cluster.users.map((u) => ({
                    name: u.name,
                    capacity: u.carCapacity,
                    children: u.numchildren,
                })),
            })),
            null,
            2
        );
    }

    private logUnclusteredUsers(users: UserWithCoords[]): string {
        return JSON.stringify(
            users.map((u) => ({
                name: u.name,
                capacity: u.carCapacity,
                children: u.numchildren,
            })),
            null,
            2
        );
    }
}

export async function optimizeCarpools(input: CarpoolInput, apiKey: string) {
    console.log("Optimizer is running...");
    const optimizer = new CarpoolOptimizer(apiKey);
    const result = await optimizer.optimize(input);

    // console.log("\nFinal Results Summary:");
    // console.log(`Initial clusters: ${result.initialClusters.length}`);
    // console.log(`Validated clusters: ${result.validatedClusters.length}`);
    // console.log(`Final clusters: ${result.finalClusters.length}`);
    // console.log(`Unclustered users: ${result.unclusteredUsers.length}`);

    return result;
}
