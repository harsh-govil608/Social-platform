import { useState } from 'react';
import { 
  SignalLowIcon, 
  SignalMediumIcon, 
  SignalHighIcon,
  TrophyIcon,
  StarIcon,
  ZapIcon,
  FlameIcon,
  BrainIcon,
  RocketIcon,
  CheckCircleIcon
} from 'lucide-react';

const DifficultySelector = ({ 
  currentLevel = 'easy', 
  onLevelChange, 
  showStats = true,
  userProgress = {} 
}) => {
  const [hoveredLevel, setHoveredLevel] = useState(null);

  const levels = [
    {
      id: 'easy',
      name: 'Easy',
      icon: <SignalLowIcon className="w-5 h-5" />,
      color: 'success',
      description: 'Perfect for beginners',
      xpMultiplier: 1,
      coinsMultiplier: 1,
      features: [
        'Basic vocabulary',
        'Simple sentences',
        'Slower pace',
        'More hints available'
      ],
      requirements: null,
      gradient: 'from-green-400 to-green-600'
    },
    {
      id: 'medium',
      name: 'Medium',
      icon: <SignalMediumIcon className="w-5 h-5" />,
      color: 'warning',
      description: 'Challenge yourself',
      xpMultiplier: 1.5,
      coinsMultiplier: 1.5,
      features: [
        'Intermediate vocabulary',
        'Complex sentences',
        'Moderate pace',
        'Limited hints'
      ],
      requirements: {
        level: 5,
        completedChallenges: 10
      },
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      icon: <SignalHighIcon className="w-5 h-5" />,
      color: 'error',
      description: 'Master level challenges',
      xpMultiplier: 2,
      coinsMultiplier: 2,
      features: [
        'Advanced vocabulary',
        'Native-level content',
        'Fast pace',
        'No hints'
      ],
      requirements: {
        level: 10,
        completedChallenges: 25
      },
      gradient: 'from-red-500 to-purple-600'
    }
  ];

  const isLevelUnlocked = (level) => {
    if (!level.requirements) return true;
    
    const userLevel = userProgress.level || 1;
    const completedChallenges = userProgress.completedChallenges || 0;
    
    return userLevel >= level.requirements.level && 
           completedChallenges >= level.requirements.completedChallenges;
  };

  return (
    <div className="w-full">
      {/* Difficulty Tabs */}
      <div className="flex gap-4 justify-center mb-6">
        {levels.map((level) => {
          const unlocked = isLevelUnlocked(level);
          const isActive = currentLevel === level.id;
          
          return (
            <div
              key={level.id}
              className={`relative ${!unlocked ? 'opacity-50' : ''}`}
              onMouseEnter={() => setHoveredLevel(level.id)}
              onMouseLeave={() => setHoveredLevel(null)}
            >
              <button
                className={`
                  btn btn-lg
                  ${isActive ? `btn-${level.color}` : 'btn-outline'}
                  ${!unlocked ? 'btn-disabled' : ''}
                  min-w-[120px]
                `}
                onClick={() => unlocked && onLevelChange(level.id)}
                disabled={!unlocked}
              >
                <div className="flex flex-col items-center gap-1">
                  {level.icon}
                  <span className="text-sm font-bold">{level.name}</span>
                  {showStats && (
                    <div className="flex gap-1 text-xs">
                      <span className="badge badge-xs">
                        {level.xpMultiplier}x XP
                      </span>
                      <span className="badge badge-xs">
                        {level.coinsMultiplier}x 💰
                      </span>
                    </div>
                  )}
                </div>
              </button>
              
              {!unlocked && (
                <div className="absolute -top-2 -right-2">
                  <div className="badge badge-error badge-sm">
                    Lv.{level.requirements.level}
                  </div>
                </div>
              )}

              {/* Tooltip */}
              {hoveredLevel === level.id && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50">
                  <div className="card bg-base-100 shadow-xl w-64 animate-in fade-in slide-in-from-bottom-2">
                    <div className={`h-2 bg-gradient-to-r ${level.gradient}`}></div>
                    <div className="card-body p-4">
                      <h4 className="font-bold text-lg">{level.name} Mode</h4>
                      <p className="text-sm opacity-80">{level.description}</p>
                      
                      <div className="divider my-2"></div>
                      
                      <div className="space-y-1">
                        {level.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <CheckCircleIcon className="w-3 h-3 text-success" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      {!unlocked && level.requirements && (
                        <div className="alert alert-warning mt-3">
                          <div className="text-xs">
                            <p className="font-bold">Requirements:</p>
                            <p>• Level {level.requirements.level}</p>
                            <p>• Complete {level.requirements.completedChallenges} challenges</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Indicator */}
      {showStats && (
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-4 h-4 text-warning" />
            <span>Level {userProgress.level || 1}</span>
          </div>
          <div className="flex items-center gap-2">
            <StarIcon className="w-4 h-4 text-info" />
            <span>{userProgress.completedChallenges || 0} Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <FlameIcon className="w-4 h-4 text-error" />
            <span>{userProgress.streak || 0} Day Streak</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DifficultySelector;