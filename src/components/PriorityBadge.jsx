const PriorityBadge = ({ score, level, showDetails = false, factors = [] }) => {
  const getColor = (level) => {
    switch(level) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Moderate': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getIcon = (level) => {
    switch(level) {
      case 'Critical': return 'warning';
      case 'High': return 'priority_high';
      case 'Moderate': return 'info';
      default: return 'check_circle';
    }
  };

  return (
    <div className="inline-flex flex-col">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getColor(level)}`}>
        <span className="material-symbols-outlined text-[16px]">
          {getIcon(level)}
        </span>
        <span className="font-bold text-sm">{score}/100</span>
        <span className="text-[10px] font-bold uppercase">{level}</span>
      </div>
      
      {showDetails && factors && factors.length > 0 && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
          <p className="font-bold text-gray-600 mb-1">Priority Breakdown:</p>
          {factors.map((factor, index) => (
            <div key={index} className="flex justify-between items-center py-0.5">
              <span className="text-gray-500">{factor.name}</span>
              <span className="font-semibold">{factor.score}/{factor.max}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 mt-1 pt-1 flex justify-between font-bold">
            <span>Total</span>
            <span>{score}/100</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityBadge;