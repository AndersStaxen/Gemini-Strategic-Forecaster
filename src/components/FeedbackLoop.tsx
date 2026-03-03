import { RefreshCw, Scale } from 'lucide-react';

interface FeedbackLoopProps {
  type: 'reinforcing' | 'balancing' | null;
}

const FeedbackLoop = ({ type }: FeedbackLoopProps) => {
  if (!type) return null;

  const isReinforcing = type === 'reinforcing';

  const config = {
    icon: isReinforcing ? RefreshCw : Scale,
    title: isReinforcing ? 'Reinforcing Loop' : 'Balancing Loop',
    description: isReinforcing
      ? 'This effect is likely to amplify over time, creating a snowball effect.'
      : 'This effect is likely to stabilize or correct itself over time.',
    color: isReinforcing ? 'text-blue-600' : 'text-green-600',
    bgColor: isReinforcing ? 'bg-blue-50' : 'bg-green-50',
  };

  return (
    <div className={`mt-6 rounded-lg border p-4 ${config.bgColor}`}>
      <div className="flex items-center">
        <config.icon className={`mr-3 h-6 w-6 ${config.color}`} />
        <h3 className={`text-lg font-semibold ${config.color}`}>{config.title}</h3>
      </div>
      <p className="mt-2 text-gray-700">{config.description}</p>
    </div>
  );
};

export default FeedbackLoop;
