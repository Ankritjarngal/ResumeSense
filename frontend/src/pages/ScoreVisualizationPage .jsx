import React, { useState, useEffect } from 'react';
import { data, useLocation } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { SearchResume } from '../components/SearchResume';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ScoreVisualizationPage() {
  const location = useLocation();
  const score = location.state?.score || {};
  const extractedData = location.state?.data || {};
  

  
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
    return <p className="text-gray-300">No score data available.</p>;
  }
  
  // Multiply each score by 10 for better visualization
  const educationScore = score["Education Score"] * 10;
  const workExperienceScore = score["Work Experience Score"] * 10;
  const skillsScore = score["Skills Score"] * 10;
  const projectsCertificationsScore = score["Projects & Certifications Score"] * 10;
  const achievementsAwardsScore = score["Achievements & Awards Score"] * 10;
  const communicationFormattingScore = score["Communication & Formatting Score"] * 10;
  const overallScore = score["Overall Score"] * 10;
  
  // Color scheme - vibrant colors on dark background
  const colors = {
    education: "#FF6384",        // Pink
    workExperience: "#36A2EB",   // Blue
    skills: "#FFCE56",           // Yellow
    projectsCertifications: "#4BC0C0", // Teal
    achievementsAwards: "#9966FF", // Purple
    communicationFormatting: "#FF9F40", // Orange
    overall: "#4BC0C0",          // Teal for overall (original theme color)
    background: "#1E293B",       // Dark blue-gray
    cardBackground: "#293548",   // Slightly lighter blue-gray
    text: "#E2E8F0",             // Light gray
    trail: "#374151"             // Dark gray for circle trails
  };
  
  // Animation effect
  useEffect(() => {
    setIsVisible(true);
    
    const animationDuration = 1500; // 1.5 seconds
    const steps = 60; // 60 steps for smooth animation
    const interval = animationDuration / steps;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
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
  
  return (
    <div className="score-visualization p-6 bg-slate-800 rounded-lg shadow-lg text-gray-100">
      <h2 className="text-center mb-8 text-3xl font-bold text-gray-100">Resume Score Visualization</h2>
      
      {/* Small Circular Progress Bars in One Line */}
      <div className={`flex justify-center items-center space-x-6 mb-12 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-24">
          <CircularProgressbar 
            value={animatedValues.education} 
            text={`${animatedValues.education}%`} 
            strokeWidth={10}
            styles={buildStyles({
              pathTransition: "none",
              pathColor: colors.education,
              textColor: colors.text,
              trailColor: colors.trail
            })}
          />
          <p className="text-center text-sm mt-2 font-medium text-gray-300">Education</p>
        </div>
        <div className="w-24">
          <CircularProgressbar 
            value={animatedValues.workExperience} 
            text={`${animatedValues.workExperience}%`}
            strokeWidth={10}
            styles={buildStyles({
              pathTransition: "none",
              pathColor: colors.workExperience,
              textColor: colors.text,
              trailColor: colors.trail
            })}
          />
          <p className="text-center text-sm mt-2 font-medium text-gray-300">Work Exp</p>
        </div>
        <div className="w-24">
          <CircularProgressbar 
            value={animatedValues.skills} 
            text={`${animatedValues.skills}%`}
            strokeWidth={10}
            styles={buildStyles({
              pathTransition: "none",
              pathColor: colors.skills,
              textColor: colors.text,
              trailColor: colors.trail
            })}
          />
          <p className="text-center text-sm mt-2 font-medium text-gray-300">Skills</p>
        </div>
        <div className="w-24">
          <CircularProgressbar 
            value={animatedValues.projectsCertifications} 
            text={`${animatedValues.projectsCertifications}%`}
            strokeWidth={10}
            styles={buildStyles({
              pathTransition: "none",
              pathColor: colors.projectsCertifications,
              textColor: colors.text,
              trailColor: colors.trail
            })}
          />
          <p className="text-center text-sm mt-2 font-medium text-gray-300">Projects</p>
        </div>
        <div className="w-24">
          <CircularProgressbar 
            value={animatedValues.achievementsAwards} 
            text={`${animatedValues.achievementsAwards}%`}
            strokeWidth={10}
            styles={buildStyles({
              pathTransition: "none",
              pathColor: colors.achievementsAwards,
              textColor: colors.text,
              trailColor: colors.trail
            })}
          />
          <p className="text-center text-sm mt-2 font-medium text-gray-300">Awards</p>
        </div>
        <div className="w-24">
          <CircularProgressbar 
            value={animatedValues.communicationFormatting} 
            text={`${animatedValues.communicationFormatting}%`}
            strokeWidth={10}
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
      
      {/* Overall Score (Larger and Centered) */}
      <div className={`flex justify-center mb-12 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: "0.5s"}}>
        <div className="w-40">
          <CircularProgressbar 
            value={animatedValues.overall} 
            text={`${animatedValues.overall}%`}
            strokeWidth={8}
            styles={buildStyles({
              pathTransition: "none",
              pathColor: colors.overall,
              textColor: colors.text,
              textSize: "16px",
              trailColor: colors.trail
            })}
          />
          <p className="text-center text-lg mt-2 font-bold text-gray-100">Overall Score</p>
        </div>
      </div>
      <div>
        <SearchResume data={extractedData}></SearchResume>
      </div>
      
     
      
    </div>
  );
}