import { useShelters } from "../context/ShelterContext";

const ShelterRecommendation = ({ incidentLat, incidentLng, title = "Recommended Shelters" }) => {
  const { getRecommendedShelters } = useShelters();
  const recommendations = getRecommendedShelters(incidentLat, incidentLng);

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center text-[#45464e]">
        <span className="material-symbols-outlined text-3xl block mb-2 text-gray-300">
          home
        </span>
        <p>No shelters available nearby</p>
        <p className="text-xs mt-1">All shelters may be at capacity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#0e1a39]">{title}</h4>
        <span className="text-xs text-[#45464e]">{recommendations.length} shelters found</span>
      </div>

      {recommendations.map((shelter, index) => {
        const occupancyPercentage = Math.round((shelter.occupancy / shelter.capacity) * 100);
        const isBest = index === 0;
        
        return (
          <div 
            key={shelter.id} 
            className={`rounded-lg border p-4 transition hover:shadow-md ${
              isBest ? 'border-[#4b41e1] bg-[#4b41e1]/5' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4b41e1] text-sm">
                    home
                  </span>
                  <h5 className="font-semibold">{shelter.name}</h5>
                  {isBest && (
                    <span className="bg-[#4b41e1] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                      BEST
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#45464e] mt-1">
                  {shelter.location} • {shelter.distance}km away
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-[#22c55e]">
                  {shelter.availableSpace} spaces
                </span>
                <p className="text-[10px] text-[#45464e]">available</p>
              </div>
            </div>

            {/* Occupancy bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-[#45464e]">
                <span>Occupancy</span>
                <span>{shelter.occupancy}/{shelter.capacity}</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                <div 
                  className={`h-full rounded-full ${
                    occupancyPercentage > 80 ? 'bg-red-500' :
                    occupancyPercentage > 60 ? 'bg-orange-500' :
                    'bg-[#4b41e1]'
                  }`}
                  style={{ width: `${occupancyPercentage}%` }}
                />
              </div>
            </div>

            {/* Facilities */}
            {shelter.facilities && shelter.facilities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {shelter.facilities.slice(0, 4).map((facility, idx) => (
                  <span key={idx} className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-[#45464e]">
                    {facility}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2 flex gap-2">
              <button 
                onClick={() => {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${shelter.lat},${shelter.lng}`;
                  window.open(mapsUrl, '_blank');
                }}
                className="text-xs text-[#4b41e1] font-semibold hover:underline"
              >
                Get Directions
              </button>
              {shelter.contact && (
                <span className="text-xs text-[#45464e]">• {shelter.contact}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShelterRecommendation;