import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { SearchResume } from '../components/SearchResume';
import { SearchInternships } from '../components/SearchInternships';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ScoreVisualizationPage() {
  const location = useLocation();
  const score = location.state?.score || {};
  const extractedData = location.state?.data || {};
  const skills = location.state?.skills|| {};
  const [Skilldata,setSkillData] = useState([skills]);
  
  // Animation state
  const [animatedValues, setAnimatedValues] = useState({
    education: 0,
    workExperience: 0,
    skills: 0,
    projectsCertifications: 0,
    achievementsAwards: 0,
    communicationFormatting: 0,
    overall: 0
  });
  
  const [isVisible, setIsVisible] = useState(false);
  
  if (!score) {
    return <p className="text-gray-400 p-4 text-center">No score data available.</p>;
  }
  
  // Multiply each score by 10 for better visualization
  const educationScore = score["Education Score"] * 10;
  const workExperienceScore = score["Work Experience Score"] * 10;
  const skillsScore = score["Skills Score"] * 10;
  const projectsCertificationsScore = score["Projects & Certifications Score"] * 10;
  const achievementsAwardsScore = score["Achievements & Awards Score"] * 10;
  const communicationFormattingScore = score["Communication & Formatting Score"] * 10;
  const overallScore = score["Overall Score"] * 10;
  
  // Dark theme color scheme - more subdued with higher contrast
  const colors = {
    education: "#8B5CF6",        // Purple
    workExperience: "#3B82F6",   // Blue
    skills: "#10B981",           // Green
    projectsCertifications: "#06B6D4", // Cyan
    achievementsAwards: "#EC4899", // Pink
    communicationFormatting: "#F59E0B", // Amber
    overall: "#6366F1",          // Indigo
    background: "#0F172A",       // Even darker blue-gray
    cardBackground: "#1E293B",   // Dark blue-gray
    text: "#F1F5F9",             // Very light gray
    trail: "#1F2937"             // Dark gray for circle trails
  };
  
  // Animation effect with smoother easing
  useEffect(() => {
    setIsVisible(true);
    
    const animationDuration = 2000; // 2 seconds for smoother animation
    const steps = 80; // More steps for smoother animation
    const interval = animationDuration / steps;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      
      // Using easeOutQuad easing function for smoother progression
      const progress = 1 - Math.pow(1 - currentStep / steps, 2);
      
      setAnimatedValues({
        education: Math.round(educationScore * progress),
        workExperience: Math.round(workExperienceScore * progress),
        skills: Math.round(skillsScore * progress),
        projectsCertifications: Math.round(projectsCertificationsScore * progress),
        achievementsAwards: Math.round(achievementsAwardsScore * progress),
        communicationFormatting: Math.round(communicationFormattingScore * progress),
        overall: Math.round(overallScore * progress)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [educationScore, workExperienceScore, skillsScore, projectsCertificationsScore, 
      achievementsAwardsScore, communicationFormattingScore, overallScore]);
  
  const chartData = {
    labels: [
      "Education",
      "Work Experience",
      "Skills",
      "Projects & Certifications",
      "Achievements & Awards",
      "Communication & Formatting"
    ],
    datasets: [
      {
        label: "Scores",
        data: [
          animatedValues.education,
          animatedValues.workExperience,
          animatedValues.skills,
          animatedValues.projectsCertifications,
          animatedValues.achievementsAwards,
          animatedValues.communicationFormatting
        ],
        backgroundColor: [
          colors.education,
          colors.workExperience,
          colors.skills,
          colors.projectsCertifications,
          colors.achievementsAwards,
          colors.communicationFormatting
        ],
        borderColor: [
          colors.education,
          colors.workExperience,
          colors.skills,
          colors.projectsCertifications,
          colors.achievementsAwards,
          colors.communicationFormatting
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: colors.text
        }
      },
      tooltip: {
        backgroundColor: colors.cardBackground,
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: colors.text
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: colors.text
        }
      }
    }
  };
  
  return (
    <div className="score-visualization p-4 md:p-6 bg-slate-900 rounded-lg shadow-xl text-gray-100 border border-gray-800 mx-auto max-w-6xl">
      <h2 className="text-center mb-6 md:mb-8 text-2xl md:text-3xl font-bold text-gray-100">Resume Score Visualization</h2>
      
      {/* Small Circular Progress Bars - Responsive Grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 mb-8 md:mb-12 transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex flex-col items-center">
          <div className="w-20 md:w-24">
            <CircularProgressbar 
              value={animatedValues.education} 
              text={`${animatedValues.education}%`} 
              strokeWidth={12}
              styles={buildStyles({
                pathTransition: "none",
                pathColor: colors.education,
                textColor: colors.text,
                trailColor: colors.trail,
                pathTransitionDuration: 0.5
              })}
            />
            <p className="text-center text-sm mt-2 font-medium text-gray-300">Education</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-20 md:w-24">
            <CircularProgressbar 
              value={animatedValues.workExperience} 
              text={`${animatedValues.workExperience}%`}
              strokeWidth={12}
              styles={buildStyles({
                pathTransition: "none",
                pathColor: colors.workExperience,
                textColor: colors.text,
                trailColor: colors.trail
              })}
            />
            <p className="text-center text-sm mt-2 font-medium text-gray-300">Work Exp</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-20 md:w-24">
            <CircularProgressbar 
              value={animatedValues.skills} 
              text={`${animatedValues.skills}%`}
              strokeWidth={12}
              styles={buildStyles({
                pathTransition: "none",
                pathColor: colors.skills,
                textColor: colors.text,
                trailColor: colors.trail
              })}
            />
            <p className="text-center text-sm mt-2 font-medium text-gray-300">Skills</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-20 md:w-24">
            <CircularProgressbar 
              value={animatedValues.projectsCertifications} 
              text={`${animatedValues.projectsCertifications}%`}
              strokeWidth={12}
              styles={buildStyles({
                pathTransition: "none",
                pathColor: colors.projectsCertifications,
                textColor: colors.text,
                trailColor: colors.trail
              })}
            />
            <p className="text-center text-sm mt-2 font-medium text-gray-300">Projects</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-20 md:w-24">
            <CircularProgressbar 
              value={animatedValues.achievementsAwards} 
              text={`${animatedValues.achievementsAwards}%`}
              strokeWidth={12}
              styles={buildStyles({
                pathTransition: "none",
                pathColor: colors.achievementsAwards,
                textColor: colors.text,
                trailColor: colors.trail
              })}
            />
            <p className="text-center text-sm mt-2 font-medium text-gray-300">Awards</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-20 md:w-24">
            <CircularProgressbar 
              value={animatedValues.communicationFormatting} 
              text={`${animatedValues.communicationFormatting}%`}
              strokeWidth={12}
              styles={buildStyles({
                pathTransition: "none",
                pathColor: colors.communicationFormatting,
                textColor: colors.text,
                trailColor: colors.trail
              })}
            />
            <p className="text-center text-sm mt-2 font-medium text-gray-300">Format</p>
          </div>
        </div>
      </div>
      
      {/* Overall Score (Larger and Centered) with enhanced animation */}
      <div className={`flex justify-center mb-8 md:mb-12 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{transitionDelay: "0.5s"}}>
        <div className="w-32 md:w-40 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-10 blur-xl"></div>
          <CircularProgressbar 
            value={animatedValues.overall} 
            text={`${animatedValues.overall}%`}
            strokeWidth={10}
            styles={buildStyles({
              pathTransition: "none",
              pathColor: colors.overall,
              textColor: colors.text,
              textSize: "16px",
              trailColor: colors.trail
            })}
          />
          <p className="text-center text-base md:text-lg mt-3 font-bold text-gray-100">Overall Score</p>
        </div>
      </div>
      
      <div className={`mt-4 bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{transitionDelay: "0.6s"}}>
        <SearchInternships skills={JSON.stringify(Skilldata)} ></SearchInternships>
      </div>
      <div className={`mt-4 bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{transitionDelay: "0.6s"}}>
        <SearchResume data={extractedData}></SearchResume>
      </div>
    </div>
  );
}