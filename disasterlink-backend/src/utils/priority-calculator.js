/**
 * Smart Incident Priority Score Calculator
 * This is your exact algorithm moved from DisasterContext.jsx
 */

const calculatePriorityScore = (incident) => {
  let score = 0;
  let maxScore = 100;
  let factors = [];

  // 1. Severity Score (max 35)
  const severityMap = {
    'Critical': 35,
    'CRITICAL': 35,
    'High': 25,
    'Moderate': 15,
    'Low': 5,
  };
  const severityScore = severityMap[incident.severity] || 10;
  score += severityScore;
  factors.push({ name: 'Severity', score: severityScore, max: 35 });

  // 2. People Affected Score (max 25)
  const peopleAffected = parseInt(incident.peopleAffected) || 0;
  let peopleScore = 0;
  if (peopleAffected > 100) peopleScore = 25;
  else if (peopleAffected > 50) peopleScore = 20;
  else if (peopleAffected > 20) peopleScore = 15;
  else if (peopleAffected > 5) peopleScore = 10;
  else if (peopleAffected > 0) peopleScore = 5;
  score += peopleScore;
  factors.push({ name: 'People Affected', score: peopleScore, max: 25 });

  // 3. Water Level Score (max 20)
  const waterLevel = parseFloat(incident.waterLevel) || 0;
  let waterScore = 0;
  if (waterLevel > 0) {
    if (waterLevel > 5) waterScore = 20;
    else if (waterLevel > 4) waterScore = 15;
    else if (waterLevel > 3) waterScore = 10;
    else if (waterLevel > 2) waterScore = 5;
  }
  score += waterScore;
  if (waterLevel > 0) {
    factors.push({ name: 'Water Level', score: waterScore, max: 20 });
  }

  // 4. Location Risk Score (max 10)
  const highRiskLocations = ['Teku', 'Kalimati', 'Baneshwor', 'Balaju', 'Koteshwor'];
  const locationStr = incident.location || '';
  const isHighRisk = highRiskLocations.some(loc => locationStr.includes(loc));
  const locationScore = isHighRisk ? 10 : 5;
  score += locationScore;
  factors.push({ name: 'Location Risk', score: locationScore, max: 10 });

  // 5. Report Freshness Score (max 10)
  const timestamp = incident.timestamp ? new Date(incident.timestamp) : new Date();
  const hoursAgo = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
  let timeScore = 0;
  if (hoursAgo < 1) timeScore = 10;
  else if (hoursAgo < 3) timeScore = 8;
  else if (hoursAgo < 6) timeScore = 6;
  else if (hoursAgo < 12) timeScore = 4;
  else timeScore = 2;
  score += timeScore;
  factors.push({ name: 'Report Freshness', score: timeScore, max: 10 });

  // Calculate final score (0-100)
  const finalScore = Math.min(Math.round((score / maxScore) * 100), 100);

  // Determine priority level
  let priorityLevel = 'Low';
  if (finalScore >= 80) priorityLevel = 'Critical';
  else if (finalScore >= 60) priorityLevel = 'High';
  else if (finalScore >= 40) priorityLevel = 'Moderate';

  return {
    score: finalScore,
    level: priorityLevel,
    factors: factors,
    maxScore: maxScore,
    details: {
      severity: severityScore,
      peopleAffected: peopleScore,
      waterLevel: waterScore,
      locationRisk: locationScore,
      timeFactor: timeScore,
    }
  };
};

export default calculatePriorityScore;