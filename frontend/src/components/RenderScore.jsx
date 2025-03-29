import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export function RenderScore({ score }) {
  // Animation state for score
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Enhanced color palette - more vibrant and distinct colors
  const getScoreColor = (value) => {
    if (value >= 80) return '#10b981'; // emerald-500 - more vibrant green
    if (value >= 60) return '#3b82f6'; // blue-500 - brighter blue
    if (value >= 40) return '#f59e0b'; // amber-500 - warmer yellow
    if (value >= 20) return '#f97316'; // orange-500 - richer orange
    return '#ef4444'; // red-500 - brighter red
  };

  const scoreColor = getScoreColor(score);
  
  // Define glow color based on score (slightly different for visual interest)
  const getGlowColor = (value) => {
    if (value >= 80) return 'emerald-400/30';
    if (value >= 60) return 'blue-400/30';
    if (value >= 40) return 'amber-400/30';
    if (value >= 20) return 'orange-400/30';
    return 'red-400/30';
  };
  
  // Score animation
  useEffect(() => {
    setIsVisible(true);
    
    const duration = 1800; // longer duration for more dramatic effect
    const steps = 70; // more steps for smoother animation
    const interval = duration / steps;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      // Easing function for smoother animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * easedProgress));
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [score]);
  
  // Define feedback text based on score
  const getFeedbackText = (value) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Average';
    if (value >= 20) return 'Needs improvement';
    return 'Poor';
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-900 rounded-xl border border-gray-800 shadow-lg transition-all duration-700 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 relative">
        <CircularProgressbar
          value={animatedScore}
          minValue={0}
          maxValue={100}
          text={`${animatedScore}%`}
          styles={buildStyles({
            // Colors
            pathColor: scoreColor,
            textColor: scoreColor,
            trailColor: '#111827', // almost black for maximum contrast
            // Text
            textSize: '18px',
            // Transition
            pathTransition: 'stroke-dashoffset 0.5s ease-out',
            // Custom
            pathTransitionDuration: 1.5,
          })}
        />
        {/* Enhanced glow effect that changes with score */}
        <div className={`absolute inset-0 rounded-full shadow-2xl shadow-${getGlowColor(score)} blur-sm`}></div>
      </div>
      
      <div className={`mt-4 sm:mt-6 text-center transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-100">Resume Score</h2>
        <p className="mt-2 text-sm sm:text-base font-medium" style={{ color: scoreColor }}>
          {getFeedbackText(score)}
        </p>
      </div>
      
      <div className={`mt-3 text-xs sm:text-sm text-gray-400 max-w-xs text-center transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {score < 60 && (
          <span>Upload an improved version of your resume to increase your score.</span>
        )}
      </div>
    </div>
  );
}