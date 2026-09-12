import { useState } from "react";

const VolunteerMatching = ({ incidentId, incidentType, incidentLat, incidentLng, limit = 5 }) => {
  const [matchedVolunteers, setMatchedVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get all volunteers from localStorage
  const getVolunteers = () => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    return allUsers.filter(u => u.role === 'volunteer');
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 999;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Match skills based on incident type
  const getRequiredSkills = (type) => {
    const skillMap = {
      'Flood': ['Water Rescue', 'First Aid', 'Evacuation', 'Logistics'],
      'Flooding': ['Water Rescue', 'First Aid', 'Evacuation', 'Logistics'],
      'Urban Flooding': ['Water Rescue', 'First Aid', 'Evacuation', 'Logistics'],
      'Landslide': ['Rescue', 'First Aid', 'Medical', 'Heavy Equipment'],
      'Fire': ['Fire Rescue', 'First Aid', 'Evacuation', 'Emergency Response'],
      'Road Blockage': ['Logistics', 'Traffic Management', 'Cleanup'],
      'Infrastructure Damage': ['Structural Assessment', 'Logistics', 'Heavy Equipment'],
      'Heavy Rainfall': ['Evacuation', 'Logistics', 'First Aid'],
      'Other': ['General Support', 'Logistics', 'First Aid']
    };
    return skillMap[type] || ['General Support', 'First Aid', 'Logistics'];
  };

  // Calculate match score for a volunteer
  const calculateMatchScore = (volunteer, requiredSkills, distance) => {
    let score = 0;
    let maxScore = 100;
    let matchedSkills = [];

    // 1. Skills match (max 50 points)
    const volunteerSkills = volunteer.skills || [];
    const skillMatches = requiredSkills.filter(skill => 
      volunteerSkills.some(vs => vs.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(vs.toLowerCase()))
    );
    const skillScore = Math.min(50, (skillMatches.length / Math.max(requiredSkills.length, 1)) * 50);
    score += skillScore;
    matchedSkills = skillMatches;

    // 2. Availability (max 25 points)
    const availabilityScore = volunteer.status === 'Available' ? 25 : 
                            volunteer.status === 'On Assignment' ? 15 : 5;
    score += availabilityScore;

    // 3. Distance (max 25 points - closer is better)
    let distanceScore = 0;
    if (distance !== undefined && distance !== null) {
      if (distance < 2) distanceScore = 25;
      else if (distance < 5) distanceScore = 20;
      else if (distance < 10) distanceScore = 15;
      else if (distance < 20) distanceScore = 10;
      else distanceScore = 5;
    } else {
      distanceScore = 15; // Default if no location
    }
    score += distanceScore;

    // Calculate final percentage
    const finalScore = Math.min(Math.round((score / maxScore) * 100), 100);

    return {
      score: finalScore,
      skillMatches: matchedSkills,
      skillsMatchedCount: matchedSkills.length,
      totalRequiredSkills: requiredSkills.length,
      availabilityBonus: availabilityScore,
      distanceBonus: distanceScore,
    };
  };

  // Find matching volunteers
  const findMatchingVolunteers = () => {
    setLoading(true);
    
    try {
      const volunteers = getVolunteers();
      const requiredSkills = getRequiredSkills(incidentType || 'Other');

      // Calculate match for each volunteer
      const matches = volunteers.map(volunteer => {
        // Get volunteer location (if available)
        const volunteerLat = volunteer.lat || null;
        const volunteerLng = volunteer.lng || null;
        const distance = (volunteerLat && volunteerLng && incidentLat && incidentLng) 
          ? calculateDistance(incidentLat, incidentLng, volunteerLat, volunteerLng)
          : undefined;

        const matchResult = calculateMatchScore(volunteer, requiredSkills, distance);

        // Get current assignments (from incidents)
        const activeAssignments = JSON.parse(localStorage.getItem('disasterData') || '[]')
          .filter(inc => 
            (inc.assignedTo === volunteer.id || inc.volunteerId === volunteer.id) && 
            inc.status !== 'Resolved'
          );

        return {
          ...volunteer,
          matchScore: matchResult.score,
          skillMatches: matchResult.skillMatches,
          skillsMatchedCount: matchResult.skillsMatchedCount,
          totalRequiredSkills: matchResult.totalRequiredSkills,
          distance: distance ? Math.round(distance * 10) / 10 : 'N/A',
          activeAssignments: activeAssignments.length,
          availabilityStatus: volunteer.status || 'Available',
          isAvailable: volunteer.status === 'Available' || volunteer.status === 'Active',
          matchDetails: matchResult,
        };
      });

      // Sort by match score (highest first) and filter out low matches
      const sortedMatches = matches
        .filter(m => m.matchScore > 20) // Filter out very low matches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      setMatchedVolunteers(sortedMatches);
    } catch (error) {
      console.error('Error matching volunteers:', error);
      setMatchedVolunteers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load matches when component mounts
  useState(() => {
    findMatchingVolunteers();
  }, [incidentId, incidentType, incidentLat, incidentLng]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-20 p-4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (matchedVolunteers.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center text-[#45464e]">
        <span className="material-symbols-outlined text-3xl block mb-2 text-gray-300">
          person_search
        </span>
        <p>No matching volunteers found</p>
        <p className="text-xs mt-1">Try expanding the search area or skills</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#0e1a39]">Matching Volunteers</h4>
        <span className="text-xs text-[#45464e]">{matchedVolunteers.length} volunteers found</span>
      </div>

      {matchedVolunteers.map((volunteer, index) => {
        const isTopMatch = index === 0;
        const matchColor = volunteer.matchScore >= 80 ? 'text-green-600' :
                          volunteer.matchScore >= 60 ? 'text-orange-500' :
                          'text-yellow-600';
        const matchBg = volunteer.matchScore >= 80 ? 'bg-green-100 border-green-200' :
                        volunteer.matchScore >= 60 ? 'bg-orange-50 border-orange-200' :
                        'bg-yellow-50 border-yellow-200';

        return (
          <div 
            key={volunteer.id} 
            className={`rounded-lg border p-4 transition hover:shadow-md ${
              isTopMatch ? 'border-[#4b41e1] bg-[#4b41e1]/5' : matchBg
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#4b41e1] text-white flex items-center justify-center text-xs font-bold">
                    {volunteer.fullName ? volunteer.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'V'}
                  </div>
                  <div>
                    <h5 className="font-semibold">{volunteer.fullName || 'Unnamed Volunteer'}</h5>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${volunteer.isAvailable ? 'text-green-600' : 'text-orange-500'}`}>
                        {volunteer.availabilityStatus}
                      </span>
                      {isTopMatch && (
                        <span className="bg-[#4b41e1] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                          BEST MATCH
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills matched */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {volunteer.skillMatches.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="text-[9px] bg-[#4b41e1]/10 text-[#4b41e1] px-1.5 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                  {volunteer.skillMatches.length > 3 && (
                    <span className="text-[9px] text-[#45464e]">
                      +{volunteer.skillMatches.length - 3} more
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#45464e]">
                  <span>📍 {volunteer.distance}km away</span>
                  <span>📋 {volunteer.activeAssignments} active tasks</span>
                  <span>🎯 {volunteer.skillsMatchedCount}/{volunteer.totalRequiredSkills} skills match</span>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-2xl font-bold ${matchColor}`}>
                  {volunteer.matchScore}%
                </div>
                <p className="text-[10px] text-[#45464e]">match score</p>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button className="text-xs text-[#4b41e1] font-semibold hover:underline">
                Assign to Incident
              </button>
              <button className="text-xs text-[#45464e] hover:underline">
                View Profile
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VolunteerMatching;