import axios from "axios";

export async function getCoordinatesFromAddress(
    street: string,
    city: string,
    state: string,
    zip: string,
    apiKey: string
): Promise<{ lat: number; lng: number }> {
    const address = encodeURIComponent(`${street}, ${city}, ${state} ${zip}`);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const results = response.data.results;

        if (results && results.length > 0) {
            const location = results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        } else {
            throw new Error("No results found.");
        }
    } catch (error) {
        throw new Error(`Geocoding failed: ${(error as Error).message}`);
    }
}


