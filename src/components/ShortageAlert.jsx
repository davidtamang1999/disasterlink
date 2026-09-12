const ShortageAlert = ({ resource }) => {
  const shortage = resource.minThreshold - resource.currentStock;
  const percentage = Math.round((shortage / resource.minThreshold) * 100);

  const getColor = () => {
    if (resource.status === 'Critical') return 'red';
    if (resource.status === 'Low') return 'orange';
    return 'blue';
  };

  const color = getColor();
  const bgColor = {
    red: 'bg-red-50 border-red-200 text-red-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-500',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
  }[color];

  const icon = {
    red: 'warning',
    orange: 'priority_high',
    blue: 'info',
  }[color];

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColor}`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
      <span className="text-xs font-bold">
        {resource.status === 'Critical' ? 'CRITICAL' : 'Low'} Stock: {shortage} {resource.unit} needed
      </span>
    </div>
  );
};

export default ShortageAlert;