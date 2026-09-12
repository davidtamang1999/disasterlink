const DisasterSituationScore = ({ score, level, details, summary }) => {
  const getLevelIcon = (level) => {
    switch(level) {
      case 'Critical': return 'warning';
      case 'High': return 'priority_high';
      case 'Moderate': return 'info';
      default: return 'check_circle';
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-orange-500';
      case 'Moderate': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getLevelBg = (level) => {
    switch(level) {
      case 'Critical': return 'bg-red-100 border-red-200';
      case 'High': return 'bg-orange-100 border-orange-200';
      case 'Moderate': return 'bg-yellow-100 border-yellow-200';
      default: return 'bg-green-100 border-green-200';
    }
  };

  const scoreColor = score >= 80 ? 'text-red-600' :
                     score >= 60 ? 'text-orange-500' :
                     score >= 40 ? 'text-yellow-600' : 'text-green-600';

  const progressColor = score >= 80 ? 'bg-red-600' :
                        score >= 60 ? 'bg-orange-500' :
                        score >= 40 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4648d4]">
            analytics
          </span>
          Disaster Situation Score
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getLevelBg(level)}`}>
          {level}
        </span>
      </div>

      {/* Score Display */}
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="transparent"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="transparent"
              stroke={score >= 80 ? '#dc2626' : score >= 60 ? '#f97316' : score >= 40 ? '#eab308' : '#22c55e'}
              strokeDasharray={`${score} ${100 - score}`}
              strokeDashoffset="0"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
            <span className="text-[10px] text-[#45464e] font-semibold">/ 100</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`material-symbols-outlined ${getLevelColor(level)}`}>
              {getLevelIcon(level)}
            </span>
            <span className={`text-2xl font-bold ${getLevelColor(level)}`}>
              {level} Risk
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${progressColor}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-sm text-[#45464e] mt-2">
            {score >= 80 ? 'Immediate action required!' :
             score >= 60 ? 'High risk situation. Monitor closely.' :
             score >= 40 ? 'Moderate risk. Stay alert.' :
             'Low risk. Continue monitoring.'}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#f5f7fb] p-3 rounded-xl text-center">
          <p className="text-2xl font-bold">{summary?.activeIncidents}</p>
          <p className="text-[10px] text-[#45464e] font-semibold">Active</p>
        </div>
        <div className="bg-[#f5f7fb] p-3 rounded-xl text-center">
          <p className="text-2xl font-bold text-red-600">{summary?.criticalIncidents}</p>
          <p className="text-[10px] text-[#45464e] font-semibold">Critical</p>
        </div>
        <div className="bg-[#f5f7fb] p-3 rounded-xl text-center">
          <p className="text-2xl font-bold">{summary?.totalAffected > 0 ? summary?.totalAffected : 0}</p>
          <p className="text-[10px] text-[#45464e] font-semibold">Affected</p>
        </div>
        <div className="bg-[#f5f7fb] p-3 rounded-xl text-center">
          <p className="text-2xl font-bold">{summary?.highestWaterLevel > 0 ? summary?.highestWaterLevel.toFixed(1) : '0'}</p>
          <p className="text-[10px] text-[#45464e] font-semibold">Water Level</p>
        </div>
        <div className="bg-[#f5f7fb] p-3 rounded-xl text-center">
          <p className={`text-2xl font-bold ${summary?.resourceShortages > 0 ? 'text-orange-500' : 'text-green-500'}`}>
            {summary?.resourceShortages}
          </p>
          <p className="text-[10px] text-[#45464e] font-semibold">Shortages</p>
        </div>
      </div>
    </div>
  );
};

export default DisasterSituationScore;