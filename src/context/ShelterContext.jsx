import { createContext, useContext, useState, useEffect } from "react";

const ShelterContext = createContext();

// Default shelter data
const defaultShelters = [
  {
    id: 'shelter-001',
    name: 'Tundikhel Emergency Shelter',
    location: 'Tundikhel, Kathmandu',
    lat: 27.7070,
    lng: 85.3170,
    capacity: 500,
    occupancy: 376,
    status: 'Open',
    facilities: ['Water', 'Food', 'Sanitation', 'Medical'],
    contact: '+977-1-4245678',
    description: 'Main emergency shelter in Kathmandu valley',
  },
  {
    id: 'shelter-002',
    name: 'Patan Community Center',
    location: 'Patan, Lalitpur',
    lat: 27.6772,
    lng: 85.3240,
    capacity: 300,
    occupancy: 124,
    status: 'Open',
    facilities: ['Water', 'Food', 'Accessible'],
    contact: '+977-1-5543210',
    description: 'Community center converted to emergency shelter',
  },
  {
    id: 'shelter-003',
    name: 'Bhaktapur Relief Camp',
    location: 'Bhaktapur',
    lat: 27.6722,
    lng: 85.4300,
    capacity: 200,
    occupancy: 186,
    status: 'Open',
    facilities: ['Water', 'Sanitation'],
    contact: '+977-1-6612345',
    description: 'Relief camp in Bhaktapur district',
  },
  {
    id: 'shelter-004',
    name: 'Teku Relief Center',
    location: 'Teku, Kathmandu',
    lat: 27.7005,
    lng: 85.3180,
    capacity: 150,
    occupancy: 150,
    status: 'Full',
    facilities: ['Water', 'Food', 'Sanitation'],
    contact: '+977-1-4246789',
    description: 'Relief camp at capacity. Directing to other shelters.',
  },
  {
    id: 'shelter-005',
    name: 'Kalimati Community Hall',
    location: 'Kalimati, Kathmandu',
    lat: 27.6950,
    lng: 85.3050,
    capacity: 250,
    occupancy: 98,
    status: 'Open',
    facilities: ['Water', 'Medical', 'Accessible', 'Food'],
    contact: '+977-1-4345678',
    description: 'New shelter opened for flood response',
  },
];

const loadInitialData = () => {
  const saved = localStorage.getItem('shelters');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return defaultShelters;
    }
  }
  return defaultShelters;
};

export function ShelterProvider({ children }) {
  const [shelters, setShelters] = useState(loadInitialData);

  useEffect(() => {
    localStorage.setItem('shelters', JSON.stringify(shelters));
  }, [shelters]);

  // Update shelter occupancy
  const updateShelterOccupancy = (id, newOccupancy) => {
    setShelters(shelters.map(shelter => {
      if (shelter.id === id) {
        const updated = {
          ...shelter,
          occupancy: newOccupancy,
          status: newOccupancy >= shelter.capacity ? 'Full' : 'Open'
        };
        return updated;
      }
      return shelter;
    }));
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get recommended shelters for an incident
  const getRecommendedShelters = (incidentLat, incidentLng, limit = 5) => {
    // Filter open shelters with space
    const availableShelters = shelters.filter(s => s.status === 'Open' && s.occupancy < s.capacity);
    
    // Calculate distance and available space
    const scoredShelters = availableShelters.map(shelter => {
      const distance = calculateDistance(incidentLat, incidentLng, shelter.lat, shelter.lng);
      const availableSpace = shelter.capacity - shelter.occupancy;
      
      // Score: Lower distance and higher available space = better
      const distanceScore = Math.max(0, 10 - distance); // 10km max
      const spaceScore = Math.min(10, availableSpace / 20); // 20 spaces = 1 point
      const totalScore = distanceScore + spaceScore;
      
      return {
        ...shelter,
        distance: Math.round(distance * 10) / 10,
        availableSpace: availableSpace,
        score: Math.round(totalScore * 10) / 10,
        distanceScore: Math.round(distanceScore * 10) / 10,
        spaceScore: Math.round(spaceScore * 10) / 10,
      };
    });

    // Sort by score (highest first) and return top N
    return scoredShelters
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  };

  // Get shelter summary
  const getShelterSummary = () => {
    const total = shelters.length;
    const open = shelters.filter(s => s.status === 'Open').length;
    const full = shelters.filter(s => s.status === 'Full').length;
    const totalCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0);
    const totalOccupancy = shelters.reduce((sum, s) => sum + s.occupancy, 0);
    const availableSpaces = totalCapacity - totalOccupancy;

    return {
      total,
      open,
      full,
      totalCapacity,
      totalOccupancy,
      availableSpaces,
    };
  };

  return (
    <ShelterContext.Provider value={{
      shelters,
      updateShelterOccupancy,
      getRecommendedShelters,
      getShelterSummary,
      calculateDistance,
    }}>
      {children}
    </ShelterContext.Provider>
  );
}

export function useShelters() {
  const context = useContext(ShelterContext);
  if (!context) {
    throw new Error("useShelters must be used within a ShelterProvider");
  }
  return context;
}