import { euclideanDistance } from '../optimizer-helpers/distance-fn';
import { haversineDistance } from '../optimizer-helpers/distance-fn';
import { getDrivingDistance } from '../optimizer-helpers/distance-fn';


const distance = euclideanDistance(37.423021, -122.083739, 34.052235, -118.243683); 
console.log('Euclidean distance:', distance);



// Example usage:
const distKm = haversineDistance(37.423021, -122.083739, 34.052235, -118.243683);
console.log(`Haversine (Straight-line distance): ${distKm} km`);


// Example usage
(async () => {
    const apiKey = 'AIzaSyCGFoau74-eJjeaKFqh0CXiqsGPe5Rx5Yc';
    const origin = { lat: 37.423021, lon: -122.083739 }; // e.g. Mountain View
    const dest = { lat: 34.052235, lon: -118.243683 };   // e.g. Los Angeles
  
    try {
      const result = await getDrivingDistance(origin.lat, origin.lon, dest.lat, dest.lon, apiKey);
      console.log('Driving distance and duration:', result);
      // Example output:
      // {
      //   distanceText: '341 mi', miles
      //   distanceValue: 548936, meters
      //   durationText: '5 hours 31 mins',
      //   durationValue: 19860 seconds
      // }
    } catch (error) {
      console.error(error);
    }
  })(); //! results in  5 hour 30 min, while actual google maps is 5 hour 45 min (mountain view to los angeles)