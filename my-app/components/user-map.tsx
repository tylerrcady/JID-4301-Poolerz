import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

interface UserMapProps {
  addressMap: Record<string, string>;
}

const UserMap: React.FC<UserMapProps> = ({ addressMap }) => {
  const [locations, setLocations] = useState<{ lat: number; lng: number; address: string }[]>([]);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAf7gXx4m3K1tNh_d6zyBAf1Xudy3AQAz4",
  });

  useEffect(() => {
    const fetchCoordinates = async () => {
      const geocodedLocations: { lat: number; lng: number; address: string }[] = [];
      for (const address of Object.values(addressMap)) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              address
            )}&key=AIzaSyAf7gXx4m3K1tNh_d6zyBAf1Xudy3AQAz4`
          );
          const data = await response.json();
          if (data.results && data.results[0]) {
            const { lat, lng } = data.results[0].geometry.location;
            const formattedAddress = data.results[0].formatted_address;
            geocodedLocations.push({ lat, lng, address: formattedAddress });
          }
        } catch (error) {
          console.error("Error geocoding address:", address, error);
        }
      }
      setLocations(geocodedLocations);
    };

    fetchCoordinates();
  }, [addressMap]);

  // Generate Google Maps Directions URL
  const generateGoogleMapsUrl = () => {
    const baseUrl = "https://www.google.com/maps/dir/";
    const addresses = locations.map((location) => encodeURIComponent(location.address));
    return `${baseUrl}${addresses.join("/")}`;
  };

  if (!isLoaded || locations.length === 0) {
    return <div>Loading map...</div>;
  }

  return (
    <div>
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: window.innerWidth < 768 ? "200px" : "350px",
          borderRadius: "8px",
          border: "3px solid #4B859F",
        }}
        center={locations[0] || { lat: 0, lng: 0 }}
        zoom={15}
      >
        {locations.map((location, index) => {
          return (
            <Marker
              key={index}
              position={{ lat: location.lat, lng: location.lng }}
              onMouseOver={() => setActiveMarker(index)}
              onMouseOut={() => setActiveMarker(null)}
            >
              {activeMarker === index && (
                <InfoWindow position={{ lat: location.lat, lng: location.lng }}>
                  <div>{location.address || "Unknown Address"}</div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>
      <div style={{ marginTop: "5px", textAlign: "left" }}>
        <a
          href={generateGoogleMapsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px",
            color: " #4B859F",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#A5C2CF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#4B859F")}
        >
            View on Google Maps
            <img
            src="/diagonal-arrow.svg"
            alt="Go To"
            style={{ width: "24px", height: "24px", marginLeft: "5px" }}
            />
        </a>
      </div>
    </div>
  );
};

export default UserMap;