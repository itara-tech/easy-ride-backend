import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function getPlaceNameFromCoords(lat, lng) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
      console.error("❌ API Key not found! Please check your .env file.");
      return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
      const response = await axios.get(url);

      if (response.data.status === "OK" && response.data.results.length > 0) {
          const placeName = response.data.results[0].formatted_address;
          console.log(`✅ Place Name: ${placeName}`);
          return placeName;
      } else {
          console.error("❌ No place found for these coordinates.");
          return null;
      }
  } catch (error) {
      console.error("❌ Reverse Geocoding failed:", error.message);
      return null;
  }
}

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

export async function getNearestRouteDistanceRoutesAPI(originCoords, destinationCoords, travelMode = "DRIVE", unitSystem = "METRIC") {
  console.log(`Requesting distance from ${originCoords.lat}, ${originCoords.lon} to ${destinationCoords.lat}, ${destinationCoords.lon}`);
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
      console.error("❌ API Key not found! Please check your .env file.");
      return;
  }

  const url = `https://routes.googleapis.com/directions/v2:computeRoutes`;

  try {
      const response = await axios.post(
          url,
          {
              origin: {
                  location: {
                      latLng: {
                          latitude: originCoords.lat,
                          longitude: originCoords.lon,
                      }
                  }
              },
              destination: {
                  location: {
                      latLng: {
                          latitude: destinationCoords.lat,
                          longitude: destinationCoords.lon,
                      }
                  }
              },
              travelMode: travelMode,
              routingPreference: "TRAFFIC_AWARE",
              computeAlternativeRoutes: false,
              routeModifiers: {
                  avoidTolls: false,
                  avoidHighways: false,
                  avoidFerries: false
              },
              languageCode: "en-US",
              units: unitSystem
          },
          {
              headers: {
                  "Content-Type": "application/json",
                  "X-Goog-Api-Key": apiKey,
                  "X-Goog-FieldMask": "routes.distanceMeters,routes.duration"
              }
          }
      );

      console.log('Response from Google Maps API:', response.data);
      if (response.data.routes && response.data.routes.length > 0) {
          const route = response.data.routes[0];
          const distance = route.distanceMeters; // Distance in meters
          const durationSeconds = parseInt(route.duration.replace("s", ""), 10);
          const durationMinutes = Math.floor(durationSeconds / 60);
          const remainingSeconds = durationSeconds % 60;
          const durationText = `${durationMinutes} minutes ${remainingSeconds} seconds`;

          const distanceKilometers = (distance / 1000).toFixed(2);

          console.log(`✅ Distance: ${distanceKilometers}, Duration: ${durationText}`);
          return {distanceKilometers};
      } else {
          console.error("❌ No routes found:", response.data);
          return null;
      }
  } catch (error) {
      console.error("❌ Routes API request failed:", error.message, error.response ? error.response.data : '');
      return null;
  }
}
