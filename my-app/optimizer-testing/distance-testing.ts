import { euclideanDistance } from '../optimizer-helpers/distance-fn';
import { haversineDistance } from '../optimizer-helpers/distance-fn';
import { getDrivingDistance } from '../optimizer-helpers/distance-fn';
import { getCoordinatesFromAddress } from '../optimizer-helpers/coords';
import { readFileSync } from 'fs';
import * as path from 'path';


//testing with test_data1.json
async function testDistances() {
    // load the JSON data
    const jsonPath = path.join(__dirname, '..', 'test-data', 'test_data1.json');
    const raw = readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(raw);
  
    // !slice first 5 users - don't want to fully use up API calls right now
    // as this requires calls for coordinates as well as driving distance
    const firstFiveUsers = data.users.slice(0, 5);
  
    // geocode each user
    const coordsArray: { userId: string; name: string; lat: number; lng: number }[] = [];
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        throw new Error('Google Maps API key is not configured');
    }
  
    for (const user of firstFiveUsers) {
      const { address, city, state, zipCode } = user.location;
      const { lat, lng } = await getCoordinatesFromAddress(address, city, state, zipCode, apiKey);
  
      coordsArray.push({
        userId: user.userId,
        name: user.name,
        lat,
        lng,
      });
    }
  
    // Compute pairwise distances
    //    (We do i+1 so we don't repeat or compare user to themselves)
    for (let i = 0; i < coordsArray.length; i++) {
      for (let j = i + 1; j < coordsArray.length; j++) {
        const userA = coordsArray[i];
        const userB = coordsArray[j];
  
        // Euclidean (just compares lat/lng in degrees — not typically used for real-world distances)
        const eucDist = euclideanDistance(userA.lat, userA.lng, userB.lat, userB.lng);
  
        // Haversine (great-circle distance in km)
        const havDistKm = haversineDistance(userA.lat, userA.lng, userB.lat, userB.lng);
  
        console.log(`\n===== ${userA.name} <-> ${userB.name} =====`);
        console.log(`Euclidean distance (degrees): ${eucDist.toFixed(3)}`);
        console.log(`Haversine distance (km):      ${havDistKm.toFixed(3)}`);
  
        // Optionally, get the driving distance (road distance / time)
        try {
          const driveInfo = await getDrivingDistance(userA.lat, userA.lng, userB.lat, userB.lng, apiKey);
          console.log(`Driving distance:            ${driveInfo.distanceText}`);
          console.log(`Driving time:                ${driveInfo.durationText}`);
        } catch (err) {
          console.warn('Could not get driving distance:', err);
        }
      }
    }
  }
  
  testDistances().catch(console.error);







// const distance = euclideanDistance(37.423021, -122.083739, 34.052235, -118.243683); 
// console.log('Euclidean distance:', distance);



// // Example usage:
// const distKm = haversineDistance(37.423021, -122.083739, 34.052235, -118.243683);
// console.log(`Haversine (Straight-line distance): ${distKm} km`);


// // Example usage
// (async () => {
//     const apiKey = 'AIzaSyCGFoau74-eJjeaKFqh0CXiqsGPe5Rx5Yc';
//     const origin = { lat: 37.423021, lon: -122.083739 }; // e.g. Mountain View
//     const dest = { lat: 34.052235, lon: -118.243683 };   // e.g. Los Angeles
  
//     try {
//       const result = await getDrivingDistance(origin.lat, origin.lon, dest.lat, dest.lon, apiKey);
//       console.log('Driving distance and duration:', result);
//       // Example output:
//       // {
//       //   distanceText: '341 mi', miles
//       //   distanceValue: 548936, meters
//       //   durationText: '5 hours 31 mins',
//       //   durationValue: 19860 seconds
//       // }
//     } catch (error) {
//       console.error(error);
//     }
//   })(); //! results in  5 hour 30 min, while actual google maps is 5 hour 45 min (mountain view to los angeles)

