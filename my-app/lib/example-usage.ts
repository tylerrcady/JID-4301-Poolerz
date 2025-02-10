// example-usage.ts
import { optimizeCarpools } from "@/optimizer/optimizer";
import data from ".././test-data/test_data2.json";

export async function runOptimizer() {
    async function runExample() {
        const exampleData = data;
        const apiKey = "AIzaSyCGFoau74-eJjeaKFqh0CXiqsGPe5Rx5Yc";
        console.log(await optimizeCarpools(exampleData, apiKey));
    }

    runExample();
}
