// example-usage.ts
import { optimizeCarpools } from "@/optimizer/optimizer";

export async function runOptimizer(testDataNumber: number) {
    async function run() {
        const data = await import(`../public/test_data${testDataNumber}.json`);
        console.log(data.default);
        const apiKey = "AIzaSyCGFoau74-eJjeaKFqh0CXiqsGPe5Rx5Yc"; // probably change to .env variable later on (@ ignacio)
        const results = await optimizeCarpools(data.default, apiKey); // call and return the optimizer & its outputs
        return {
            initialClusters: results.initialClusters,
            validatedClusters: results.validatedClusters,
            finalClusters: results.finalClusters,
            unclusteredUsers: results.unclusteredUsers,
        };
    }

    return await run(); // run the example and return the results
}
