import { useState, useEffect } from "react";
import { useUsers } from "../context/UserContext";
import { useDisaster } from "../context/DisasterContext";
import { useToast } from "./shared";

const VolunteerMatching = ({
  incidentId,
  incidentType,
  incidentLat,
  incidentLng,
  limit = 5,
  onAssigned,
}) => {
  const { volunteers } = useUsers();
  const { updateIncident } = useDisaster();
  const toast = useToast();
  const [matchedVolunteers, setMatchedVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 999;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Match skills based on incident type
  const getRequiredSkills = (type) => {
    const skillMap = {
      Flood: ["Water Rescue", "First Aid", "Evacuation", "Logistics"],
      Flooding: ["Water Rescue", "First Aid", "Evacuation", "Logistics"],
      "Urban Flooding": ["Water Rescue", "First Aid", "Evacuation", "Logistics"],
      "Flash Flood": ["Water Rescue", "First Aid", "Evacuation", "Logistics"],
      Landslide: ["Rescue", "First Aid", "Medical", "Heavy Equipment"],
      Fire: ["Fire Rescue", "First Aid", "Evacuation", "Emergency Response"],
      "Road Blockage": ["Logistics", "Traffic Management", "Cleanup"],
      "Infrastructure Damage": ["Structural Assessment", "Logistics", "Heavy Equipment"],
      "Heavy Rainfall": ["Evacuation", "Logistics", "First Aid"],
      Other: ["General Support", "Logistics", "First Aid"],
    };
    return skillMap[type] || ["General Support", "First Aid", "Logistics"];
  };

  // Calculate match score for a volunteer
  const calculateMatchScore = (volunteer, requiredSkills, distance) => {
    let score = 0;
    const maxScore = 100;
    let matchedSkills = [];

    // 1. Skills match (max 50 points)
    const volunteerSkills = volunteer.skills || [];
    const skillMatches = requiredSkills.filter((skill) =>
      volunteerSkills.some(
        (vs) =>
          vs.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(vs.toLowerCase())
      )
    );
    const skillScore = Math.min(
      50,
      (skillMatches.length / Math.max(requiredSkills.length, 1)) * 50
    );
    score += skillScore;
    matchedSkills = skillMatches;

    // 2. Availability (max 25 points)
    const availabilityScore =
      volunteer.status === "Available" || volunteer.availability === "available"
        ? 25
        : volunteer.status === "On Assignment"
        ? 15
        : 5;
    score += availabilityScore;

    // 3. Distance (max 25 points)
    let distanceScore = 15;
    if (distance !== undefined && distance !== null && distance !== 999) {
      if (distance < 2) distanceScore = 25;
      else if (distance < 5) distanceScore = 20;
      else if (distance < 10) distanceScore = 15;
      else if (distance < 20) distanceScore = 10;
      else distanceScore = 5;
    }
    score += distanceScore;

    const finalScore = Math.min(Math.round((score / maxScore) * 100), 100);

    return {
      score: finalScore,
      skillMatches: matchedSkills,
      skillsMatchedCount: matchedSkills.length,
      totalRequiredSkills: requiredSkills.length,
    };
  };

  useEffect(() => {
    setLoading(true);

    try {
      const requiredSkills = getRequiredSkills(incidentType || "Other");

      const matches = (volunteers || []).map((volunteer) => {
        const volunteerLat = volunteer.lat ?? null;
        const volunteerLng = volunteer.lng ?? null;

        const distance =
          volunteerLat && volunteerLng && incidentLat && incidentLng
            ? calculateDistance(incidentLat, incidentLng, volunteerLat, volunteerLng)
            : undefined;

        const matchResult = calculateMatchScore(volunteer, requiredSkills, distance);

        return {
          ...volunteer,
          matchScore: matchResult.score,
          skillMatches: matchResult.skillMatches,
          skillsMatchedCount: matchResult.skillsMatchedCount,
          totalRequiredSkills: matchResult.totalRequiredSkills,
          distance: distance ? Math.round(distance * 10) / 10 : "N/A",
          activeAssignments: 0,
          availabilityStatus: volunteer.status || volunteer.availability || "Available",
          isAvailable:
            volunteer.status === "Available" ||
            volunteer.availability === "available",
        };
      });

      const sortedMatches = matches
        .filter((m) => m.matchScore > 20)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      setMatchedVolunteers(sortedMatches);
    } catch (error) {
      console.error("Error matching volunteers:", error);
      setMatchedVolunteers([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId, incidentType, incidentLat, incidentLng, volunteers]);

  // ---------- Assign volunteer to incident ----------
  const handleAssign = async (volunteer) => {
    if (!incidentId) {
      toast.error("No incident selected");
      return;
    }
    setAssigning(volunteer.id);
    try {
      await updateIncident(incidentId, {
        assignedTo: volunteer.id,
        status: "In Progress",
      });
      toast.success(`${volunteer.fullName || "Volunteer"} assigned to incident`);
      onAssigned?.(volunteer);
    } catch (err) {
      console.error("Assign failed:", err);
      toast.error("Failed to assign volunteer");
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-200 p-4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (matchedVolunteers.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 p-4 text-center text-[#45464e]">
        <span className="material-symbols-outlined mb-2 block text-3xl text-gray-300">
          person_search
        </span>
        <p>No matching volunteers found</p>
        <p className="mt-1 text-xs">
          {volunteers?.length === 0
            ? "No volunteers registered yet"
            : "No volunteers match this incident's skills"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#0e1a39]">Matching Volunteers</h4>
        <span className="text-xs text-[#45464e]">
          {matchedVolunteers.length} volunteers found
        </span>
      </div>

      {matchedVolunteers.map((volunteer, index) => {
        const isTopMatch = index === 0;
        const matchColor =
          volunteer.matchScore >= 80
            ? "text-green-600"
            : volunteer.matchScore >= 60
            ? "text-orange-500"
            : "text-yellow-600";
        const matchBg =
          volunteer.matchScore >= 80
            ? "bg-green-100 border-green-200"
            : volunteer.matchScore >= 60
            ? "bg-orange-50 border-orange-200"
            : "bg-yellow-50 border-yellow-200";

        return (
          <div
            key={volunteer.id}
            className={`rounded-lg border p-4 transition hover:shadow-md ${
              isTopMatch ? "border-[#4b41e1] bg-[#4b41e1]/5" : matchBg
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4b41e1] text-xs font-bold text-white">
                    {volunteer.fullName
                      ? volunteer.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "V"}
                  </div>
                  <div>
                    <h5 className="font-semibold">
                      {volunteer.fullName || "Unnamed Volunteer"}
                    </h5>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold ${
                          volunteer.isAvailable ? "text-green-600" : "text-orange-500"
                        }`}
                      >
                        {volunteer.availabilityStatus}
                      </span>
                      {isTopMatch && (
                        <span className="rounded-full bg-[#4b41e1] px-1.5 py-0.5 text-[8px] font-bold text-white">
                          BEST MATCH
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {volunteer.skillMatches.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-[#4b41e1]/10 px-1.5 py-0.5 text-[9px] text-[#4b41e1]"
                    >
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
                  <span>
                    🎯 {volunteer.skillsMatchedCount}/{volunteer.totalRequiredSkills} skills match
                  </span>
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
              <button
                onClick={() => handleAssign(volunteer)}
                disabled={assigning === volunteer.id}
                className={`text-xs font-semibold hover:underline ${
                  assigning === volunteer.id ? "text-gray-400" : "text-[#4b41e1]"
                }`}
              >
                {assigning === volunteer.id ? "Assigning..." : "Assign to Incident"}
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