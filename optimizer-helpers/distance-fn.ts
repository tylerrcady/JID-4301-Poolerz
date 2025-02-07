import axios from 'axios';


/**
 * Returns the Euclidean distance between two points on a 2D plane.
 * @param x1 - x-coordinate of the first point
 * @param y1 - y-coordinate of the first point
 * @param x2 - x-coordinate of the second point
 * @param y2 - y-coordinate of the second point
 * @returns distance - the straight-line distance between the two points
 */
export function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy); // the result is in the same units as the coordinates, so idk if too useful really
}


/**
 * Returns the great-circle distance (in kilometers) between two points using the haversine formula.
 * If you want miles, you can convert the final result (1 km ~= 0.621371 mi).
 */
export function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
    ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // in kilometers
    return distance;
}
  
function toRadians(deg: number): number {
    return deg * (Math.PI / 180);
}
  


//Google API driving distance and duration
export async function getDrivingDistance(
    originLat: number,
    originLon: number,
    destLat: number,
    destLon: number,
    apiKey: string
  ): Promise<{ distanceText: string; distanceValue: number; durationText: string; durationValue: number }> {
    try {
      const origins = `${originLat},${originLon}`;
      const destinations = `${destLat},${destLon}`;
      
      // mode=driving for driving distance
      // units=imperial if you want miles/feet, otherwise 'metric' for km
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origins}&destinations=${destinations}&mode=driving&key=${apiKey}`;
      
      const response = await axios.get(url);
      const data = response.data;
      
      if (
        data.rows &&
        data.rows[0] &&
        data.rows[0].elements &&
        data.rows[0].elements[0].status === 'OK'
      ) {
        const element = data.rows[0].elements[0];
        return {
          distanceText: element.distance.text,     // e.g. "43.1 mi"
          distanceValue: element.distance.value,   // e.g. 69307 (in meters)
          durationText: element.duration.text,     // e.g. "45 mins"
          durationValue: element.duration.value    // e.g. 2700 (in seconds)
        };
      } else {
        throw new Error('No distance data returned.');
      }
    } catch (error) {
      throw new Error(`Error fetching driving distance: ${(error as Error).message}`);
    }
  }
  
  



