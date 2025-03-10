// import helper functions:
import { getCoordinatesFromAddress } from "../optimizer-helpers/coords";
import { haversineDistance } from "../optimizer-helpers/distance-fn";

// ! need more realistic data (w.r.t. availabilities) in my opinion and eps tuning

// define types:
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

interface DrivingSchedule {
    userId: string;
    drivingDays: number[];
}

// ! cluster with schedule (final output)
interface ClusterWithSchedule extends Cluster {
    drivingSchedule: DrivingSchedule[];
}

export class CarpoolOptimizer {
    // class variables:
    private users: UserWithCoords[] = [];
    private carpoolDays: number[] = [];
    private unclusteredUsers: UserWithCoords[] = [];
    private readonly apiKey: string;
    private static readonly MAX_CLUSTER_SIZE = 6; // ! this ensures a maximum cluster size
    private static readonly MIN_CLUSTER_SIZE = 2; // ! this ensures a minimum cluster size
    private static readonly DISTANCE_THRESHOLD_FACTOR = 2; // ! factor to multiply eps for distance validation

    // constructor:
    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    // main optimizer method (takes the JSON data as input):
    async optimize(input: CarpoolInput): Promise<{
        initialClusters: Cluster[];
        validatedClusters: Cluster[];
        finalClusters: ClusterWithSchedule[];
        unclusteredUsers: UserWithCoords[];
    }> {
        // 1. initialize users and carpool days:
        await this.initializeUsers(input);
        this.carpoolDays = input.carpoolDays;

        // ! 2. optimize eps (work in progress):
        const eps = this.findOptimalEpsilon();

        // 3. run dbscan based on optimized eps and min pts (based on coordinates):
        const initialClusters = this.runDBSCAN(
            eps,
            CarpoolOptimizer.MIN_CLUSTER_SIZE
        );

        // 4. validate the clusters and split large if necessary:
        const validatedClusters =
            this.validateAndSplitClusters(initialClusters);

        // 5. finalize and correct clusters if necessary:
        const finalResults = this.finalizeAndCorrectClusters(
            validatedClusters,
            eps
        );

        // 6. return output from all stages for testing:
        return {
            initialClusters,
            validatedClusters,
            finalClusters: finalResults.finalClusters,
            unclusteredUsers: finalResults.unclusteredUsers,
        };
    }

    // intialize users helper method:
    private async initializeUsers(input: CarpoolInput): Promise<void> {
        // for each user:
        for (const user of input.users) {
            // get coordinates based on their address (should ensure valid address in form later on):
            const coords = await getCoordinatesFromAddress(
                user.location.address,
                user.location.city,
                user.location.state,
                user.location.zipCode,
                this.apiKey
            );

            // associate users with their availabilities:
            const userAvailability = input.availabilities.find(
                (a) => a.userId === user.userId
            );

            // append both the coords and availabilities to the user in the input:
            this.users.push({
                ...user,
                coordinates: coords,
                availability: userAvailability?.availability || [],
            });
        }
    }

    // optimze eps helper method:
    private findOptimalEpsilon(): number {
        const distances: number[] = [];
        // for each unique pair of users, calculate the haversine distance between them:
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
        // ! sort distances in ascending order and take the x-th percentile's value as eps (should likely modify going forward):
        distances.sort((a, b) => a - b);
        const index = Math.floor(distances.length * 0.075); // 5th - 10th percentile at the moment seem to be the most promising
        console.log("Optimized Eps: ", distances[index]);
        return distances[index];
    }

    // DBSCAN method:
    private runDBSCAN(eps: number, minPts: number): Cluster[] {
        const visited = new Set<string>();
        const clusters: Cluster[] = [];
        this.unclusteredUsers = [];

        // for each user:
        for (const user of this.users) {
            // if visited continue; OW visit:
            if (visited.has(user.userId)) continue;
            visited.add(user.userId);

            // get neighbors of a user based on eps; if less than min pts nbrs, label as unclustered:
            const neighbors = this.getNeighbors(user, eps);
            if (neighbors.length < minPts - 1) {
                // - 1 since user is included
                // check if the user is already in a cluster before making it unclustered:
                if (
                    !clusters.some((cluster) =>
                        cluster.users.some((u) => u.userId === user.userId)
                    )
                ) {
                    this.unclusteredUsers.push(user);
                }
                continue;
            }

            // otherwise cluster user and nbrs via expansion if necessary:
            const cluster: UserWithCoords[] = [user];
            this.expandCluster(neighbors, cluster, eps, minPts, visited);

            // add the cluster and its centroid (for validation/correction purposes) for later:
            clusters.push({
                users: cluster,
                centroid: this.calculateCentroid(cluster),
            });
        }

        // ensure no user is both in a cluster and is also unclustered:
        this.unclusteredUsers = this.unclusteredUsers.filter(
            (user) =>
                !clusters.some((cluster) =>
                    cluster.users.some((u) => u.userId === user.userId)
                )
        );

        return clusters;
    }

    // get nbrs helper method:
    private getNeighbors(user: UserWithCoords, eps: number): UserWithCoords[] {
        // return neighbors (which are users <= eps distance from the user in question):
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

    // expand cluster helper method:
    private expandCluster(
        neighbors: UserWithCoords[],
        cluster: UserWithCoords[],
        eps: number,
        minPts: number,
        visited: Set<string>
    ): void {
        const queue = [...neighbors];

        // while the nbr queue isn't empty:
        while (queue.length > 0) {
            // pop the first/current user (! signals that the result will never be NULL/undefined):
            const current = queue.shift()!;

            // if the curent user is not visited in DBSCAN:
            if (!visited.has(current.userId)) {
                // visit user and get its nbrs:
                visited.add(current.userId);
                const newNeighbors = this.getNeighbors(current, eps);

                // push the new nbrs that have not been visited onto the queue if within min pts and not in queue already:
                if (newNeighbors.length >= minPts - 1) {
                    // - 1 since user is included
                    queue.push(
                        ...newNeighbors.filter(
                            (n) =>
                                !visited.has(n.userId) &&
                                !queue.some((q) => q.userId === n.userId)
                        )
                    );
                }
            }

            // add the current user to the cluster if it hasn't already been added to the cluster:
            if (!cluster.some((u) => u.userId === current.userId)) {
                cluster.push(current);
            }
        }
    }

    // calculate cluster centroid method:
    private calculateCentroid(users: UserWithCoords[]): Coordinates {
        // get the accumulated sum of latitude and longitude:
        const sum = users.reduce(
            (acc, user) => ({
                lat: acc.lat + user.coordinates.lat,
                lng: acc.lng + user.coordinates.lng,
            }),
            { lat: 0, lng: 0 }
        );

        // average the lat/long and return it:
        return {
            lat: sum.lat / users.length,
            lng: sum.lng / users.length,
        };
    }

    // validate cluster helper method:
    private validateCluster(cluster: Cluster): boolean {
        const totalMembers = cluster.users.length;

        // ensure every user in the cluster can fit the cluster size in the car:
        const hasValidCapacity = cluster.users.every((user) => {
            return user.carCapacity >= totalMembers;
        });
        if (!hasValidCapacity) {
            return false;
        }

        // check if all carpool days can be covered by the users in the cluster:
        const allDaysCovered = this.carpoolDays.every((day) =>
            cluster.users.some((user) => user.availability.includes(day))
        );
        if (!allDaysCovered) {
            return false;
        }

        // ! check if each user can drive at least one day: (new)
        const allUsersCanDriveSomeDay = cluster.users.every((user) =>
            user.availability.some((day) => this.carpoolDays.includes(day))
        );
        if (!allUsersCanDriveSomeDay) {
            return false;
        }

        return true;
    }

    // ! validate distance within cluster: (new function)
    private validateClusterDistance(
        cluster: Cluster,
        distanceThreshold: number
    ): boolean {
        // for each pair of users in the cluster, check if they are within the distance threshold:
        for (let i = 0; i < cluster.users.length; i++) {
            for (let j = i + 1; j < cluster.users.length; j++) {
                const distance = haversineDistance(
                    cluster.users[i].coordinates.lat,
                    cluster.users[i].coordinates.lng,
                    cluster.users[j].coordinates.lat,
                    cluster.users[j].coordinates.lng
                );
                if (distance > distanceThreshold) {
                    return false;
                }
            }
        }
        return true;
    }

    // validate and split clusters helper method:
    private validateAndSplitClusters(clusters: Cluster[]): Cluster[] {
        const validatedClusters: Cluster[] = [];

        // for each cluster:
        for (const cluster of clusters) {
            // if the size is > the MAX size, split the clusters into valid subclusters; if valid, push the cluster; if invalid, uncluster:
            if (cluster.users.length > CarpoolOptimizer.MAX_CLUSTER_SIZE) {
                const subClusters = this.splitLargeCluster(cluster.users);
                validatedClusters.push(...subClusters);
            } else if (this.validateCluster(cluster)) {
                validatedClusters.push(cluster);
            } else {
                this.unclusteredUsers.push(...cluster.users);
            }
        }

        // return the valid clusters:
        return validatedClusters;
    }

    // finalize and correct clusters helper method:
    private finalizeAndCorrectClusters(
        clusters: Cluster[],
        eps: number
    ): {
        finalClusters: ClusterWithSchedule[];
        unclusteredUsers: UserWithCoords[];
    } {
        const finalClusters: ClusterWithSchedule[] = [];
        let processedUnclusteredUsers = [...this.unclusteredUsers];

        // ! calculate distance threshold for validation: (new)
        const distanceThreshold =
            eps * CarpoolOptimizer.DISTANCE_THRESHOLD_FACTOR;

        // ! first, validate existing clusters with distance check: (new)
        for (const cluster of clusters) {
            if (
                this.validateCluster(cluster) &&
                this.validateClusterDistance(cluster, distanceThreshold)
            ) {
                // ! create driving schedule for valid cluster: (new)
                const drivingSchedule = this.createDrivingSchedule(cluster);
                finalClusters.push({
                    ...cluster,
                    drivingSchedule,
                });
            } else {
                processedUnclusteredUsers.push(...cluster.users);
            }
        }

        // ! try to form new clusters from unclustered users: (new)
        const newClusters = this.formClustersFromUnclustered(
            processedUnclusteredUsers,
            distanceThreshold
        );

        // ! add new clusters to final clusters with driving schedules: (new)
        for (const cluster of newClusters) {
            const drivingSchedule = this.createDrivingSchedule(cluster);
            finalClusters.push({
                ...cluster,
                drivingSchedule,
            });
        }

        // ! update unclustered users list: (new)
        processedUnclusteredUsers = processedUnclusteredUsers.filter(
            (user) =>
                !newClusters.some((cluster) =>
                    cluster.users.some((u) => u.userId === user.userId)
                )
        );

        return {
            finalClusters,
            unclusteredUsers: processedUnclusteredUsers,
        };
    }

    // ! create optimal driving schedule for a cluster: (new function) [needs attention]
    private createDrivingSchedule(cluster: Cluster): DrivingSchedule[] {
        const schedule: DrivingSchedule[] = [];

        // create a map of days to eligible drivers:
        const dayToDriversMap: Map<number, string[]> = new Map();

        // initialize the map for each carpool day:
        this.carpoolDays.forEach((day) => {
            dayToDriversMap.set(day, []);
        });

        // populate the map with eligible drivers for each day:
        cluster.users.forEach((user) => {
            user.availability.forEach((day) => {
                if (this.carpoolDays.includes(day)) {
                    const drivers = dayToDriversMap.get(day) || [];
                    drivers.push(user.userId);
                    dayToDriversMap.set(day, drivers);
                }
            });
        });

        // initialize driving days count for each user:
        const userDrivingCount: Map<string, number> = new Map();
        cluster.users.forEach((user) => {
            userDrivingCount.set(user.userId, 0);
        });

        // assign drivers for each day based on who has driven the least so far:
        this.carpoolDays.forEach((day) => {
            const eligibleDrivers = dayToDriversMap.get(day) || [];
            if (eligibleDrivers.length > 0) {
                // sort drivers by how many days they've already been assigned:
                eligibleDrivers.sort(
                    (a, b) =>
                        (userDrivingCount.get(a) || 0) -
                        (userDrivingCount.get(b) || 0)
                );

                // assign the day to the driver who has driven the least:
                const driverId = eligibleDrivers[0];
                userDrivingCount.set(
                    driverId,
                    (userDrivingCount.get(driverId) || 0) + 1
                );

                // add or update the driving schedule for this user:
                const existingSchedule = schedule.find(
                    (s) => s.userId === driverId
                );
                if (existingSchedule) {
                    existingSchedule.drivingDays.push(day);
                } else {
                    schedule.push({
                        userId: driverId,
                        drivingDays: [day],
                    });
                }
            }
        });

        return schedule;
    }

    // ! form new clusters from unclustered users: (new function)
    private formClustersFromUnclustered(
        unclusteredUsers: UserWithCoords[],
        distanceThreshold: number
    ): Cluster[] {
        const newClusters: Cluster[] = [];
        const remainingUsers = [...unclusteredUsers];

        // try to form clusters with MIN_CLUSTER_SIZE to MAX_CLUSTER_SIZE users:
        while (remainingUsers.length >= CarpoolOptimizer.MIN_CLUSTER_SIZE) {
            let bestCluster: UserWithCoords[] | null = null;
            let bestScore = Infinity;

            // try each user as a potential center:
            for (let i = 0; i < remainingUsers.length; i++) {
                const center = remainingUsers[i];

                // calculate distances from this center to all other users:
                const distances = remainingUsers
                    .filter((u) => u.userId !== center.userId)
                    .map((u) => ({
                        user: u,
                        distance: haversineDistance(
                            center.coordinates.lat,
                            center.coordinates.lng,
                            u.coordinates.lat,
                            u.coordinates.lng
                        ),
                    }))
                    .sort((a, b) => a.distance - b.distance);

                // try different cluster sizes:
                for (
                    let size = CarpoolOptimizer.MIN_CLUSTER_SIZE;
                    size <=
                    Math.min(
                        CarpoolOptimizer.MAX_CLUSTER_SIZE,
                        distances.length + 1
                    );
                    size++
                ) {
                    const potentialCluster = [
                        center,
                        ...distances.slice(0, size - 1).map((d) => d.user),
                    ];

                    // check if this cluster would be valid:
                    const clusterObj = {
                        users: potentialCluster,
                        centroid: this.calculateCentroid(potentialCluster),
                    };

                    if (
                        this.validateCluster(clusterObj) &&
                        this.validateClusterDistance(
                            clusterObj,
                            distanceThreshold
                        )
                    ) {
                        // ! calculate a score for this cluster: (lower is better)
                        // score is based on total distance and maximizing cluster size:
                        const totalDistance = distances
                            .slice(0, size - 1)
                            .reduce((sum, d) => sum + d.distance, 0);
                        const score = totalDistance / size; // lower score for larger clusters with smaller distances

                        if (score < bestScore) {
                            bestScore = score;
                            bestCluster = potentialCluster;
                        }
                    }
                }
            }

            // if we found a valid cluster, add it and remove those users from remaining:
            if (bestCluster) {
                const newCluster = {
                    users: bestCluster,
                    centroid: this.calculateCentroid(bestCluster),
                };
                newClusters.push(newCluster);

                // remove clustered users from remaining:
                const clusterUserIds = new Set(
                    bestCluster.map((u) => u.userId)
                );
                for (let i = remainingUsers.length - 1; i >= 0; i--) {
                    if (clusterUserIds.has(remainingUsers[i].userId)) {
                        remainingUsers.splice(i, 1);
                    }
                }
            } else {
                // if we couldn't form any valid cluster, break the loop:
                break;
            }
        }

        return newClusters;
    }

    // split large cluster helper method:
    private splitLargeCluster(cluster: UserWithCoords[]): Cluster[] {
        const TARGET_SIZE = 3; // ! this signals a target cluster size if splitting
        const subClusters: Cluster[] = [];
        let remainingUsers = [...cluster];

        // while the cluster is larger or equal to its minimum possible size:
        while (remainingUsers.length >= CarpoolOptimizer.MIN_CLUSTER_SIZE) {
            // if the current remaing users size is of target size or less, make it a new cluster if valid, otherwise, uncluster and break:
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

            // for each potential center (user) of remaining users:
            for (const potentialCenter of remainingUsers) {
                // get a distance map to other users:
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

                // summate the distances and if it is the current minimum set it as the minimum distance and the best center:
                const totalDistance = distances.reduce(
                    (sum, dist) => sum + dist,
                    0
                );
                if (totalDistance < minTotalDistance) {
                    minTotalDistance = totalDistance;
                    bestCenter = potentialCenter;
                }
            }

            // after having found the best center, get the distance map of the best center and sort in ascending order:
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

            // cluster the closest TARGET_SIZE - 1 ponts to the best center and make this a new cluster if valid; this will remove the clustered users from the reamining users if valid, otherwise, it will remove the best center from the remaining users and mark it as unclustered:
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

        // if there are remaining users left over, make them unclustered and return the subClusters:
        if (remainingUsers.length > 0) {
            this.unclusteredUsers.push(...remainingUsers);
        }
        return subClusters;
    }
}

// optimize carpool exported main function with new instance (called from a lib file which will be called from a component):
export async function optimizeCarpools(input: CarpoolInput, apiKey: string) {
    console.log("Optimizer is running...");
    const optimizer = new CarpoolOptimizer(apiKey);
    const result = await optimizer.optimize(input);

    return result;
}
