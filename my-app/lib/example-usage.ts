// example-usage.ts
import { optimizeCarpools } from "@/optimizer/optimizer";

export async function runOptimizer(testDataNumber: number) {
    async function run() {
        const data = await import(`../public/test_data${testDataNumber}.json`);
        console.log(data.default);
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            throw new Error('Google Maps API key is not configured');
        }
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
