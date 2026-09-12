import axios from 'axios';

const geocodeLocation = async (locationName) => {
  if (!locationName || locationName.trim() === '') {
    console.warn('⚠️ Empty location name');
    return null;
  }

  const cleanName = locationName.trim();

  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: cleanName,
          format: 'json',
          limit: 1,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'DisasterLink-FYP-Project/1.0',
          'Accept': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const coords = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
      };
      console.log(`✅ Geocoded "${cleanName}" →`, coords.lat, coords.lng);
      return coords;
    }

    console.warn(`⚠️ No results found for "${cleanName}"`);
    return null;
  } catch (error) {
    console.error(`❌ Geocoding failed for "${cleanName}":`, error.message);
    return null;
  }
};

export default geocodeLocation;