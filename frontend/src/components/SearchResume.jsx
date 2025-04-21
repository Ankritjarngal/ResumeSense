import React, { useState } from "react";
import axios from "axios";

export function SearchResume({ data }) {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Function to extract the name from the JSON string inside entities
  const extractName = (resume) => {
    try {
      // First try to parse entities if it's a string
      let parsedData;
      if (typeof resume.entities === 'string') {
        parsedData = JSON.parse(resume.entities);
      } else if (typeof resume.extractedText === 'string') {
        parsedData = JSON.parse(resume.extractedText);
      } else {
        parsedData = resume.entities || resume.extractedText || {};
      }
      return parsedData?.name || "Unnamed";
    } catch (error) {
      console.warn("Error parsing resume data:", error);
      return "Unnamed";
    }
  };

  // Function to extract education details
  const extractEducation = (resume) => {
    try {
      // First try to parse entities if it's a string
      let parsedData;
      if (typeof resume.entities === 'string') {
        parsedData = JSON.parse(resume.entities);
      } else if (typeof resume.extractedText === 'string') {
        parsedData = JSON.parse(resume.extractedText);
      } else {
        parsedData = resume.entities || resume.extractedText || {};
      }
      return parsedData?.education?.map((edu) => edu.degree + " at " + edu.institution).join(", ") || "N/A";
    } catch (error) {
      console.warn("Error parsing resume education data:", error);
      return "N/A";
    }
  };

  // Function to extract skills
  const extractSkills = (resume) => {
    try {
      // First try to parse entities if it's a string
      let parsedData;
      if (typeof resume.entities === 'string') {
        parsedData = JSON.parse(resume.entities);
      } else if (typeof resume.extractedText === 'string') {
        parsedData = JSON.parse(resume.extractedText);
      } else {
        parsedData = resume.entities || resume.extractedText || {};
      }
      return parsedData?.skills?.slice(0, 5).join(", ") || "No skills listed";
    } catch (error) {
      console.warn("Error parsing resume skills data:", error);
      return "No skills listed";
    }
  };

  // Function to search for similar resumes
  const findSimilarResumes = async () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      let queryText = "";

      if (data.skills && data.skills.length) {
        queryText += "Skills: " + data.skills.join(", ");
      }

      if (data.education && data.education.length) {
        queryText += " Education: " + data.education.map((edu) => edu.degree || edu.institution || "").join(", ");
      }

      if (!queryText.trim()) {
        queryText = JSON.stringify(data);
      }

      // Log the query for debugging
      console.log("Search query:", queryText);

      // Check if the API endpoint is reachable first
      try {
        await axios.get("https://resumeprivate.onrender.com/health");
      } catch (healthErr) {
        console.error("API health check failed:", healthErr);
        throw new Error("Resume search service is currently unavailable. Please try again later.");
      }

      const response = await axios.post("https://resumeprivate.onrender.com/search", {
        query: queryText,
      });

      setResults(response.data);
      if (response.data.length === 0) {
        setError("No similar resumes found.");
      }
    } catch (err) {
      console.error("Search error:", err);
      if (err.response) {
        // The server responded with a status code outside the 2xx range
        if (err.response.status === 500) {
          setError("Server error: The search service encountered an internal problem. Please try again later.");
        } else if (err.response.data?.error) {
          setError(`Error: ${err.response.data.error}`);
        } else {
          setError(`Server error (${err.response.status}): Please try again later.`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError("Network error: Could not connect to the search service. Please check your internet connection.");
      } else {
        // Something happened in setting up the request
        setError(err.message || "An unexpected error occurred during the search.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed function to open the resume PDF that handles all possible data structures
  const openPdf = (resume) => {
    try {
      // First check if driveUrl is available directly in the result object
      if (resume.driveUrl) {
        console.log("Opening drive URL from top level:", resume.driveUrl);
        window.open(resume.driveUrl, "_blank");
        return;
      }
      
      // If not, try to find it in entities (if it's a string, parse it)
      let entitiesData = resume.entities;
      if (typeof entitiesData === "string") {
        try {
          entitiesData = JSON.parse(entitiesData);
        } catch (err) {
          console.warn("Could not parse 'entities' JSON:", err);
          entitiesData = null;
        }
      }
      
      if (entitiesData?.driveUrl) {
        console.log("Opening drive URL from parsed entities:", entitiesData.driveUrl);
        window.open(entitiesData.driveUrl, "_blank");
        return;
      }
      
      // As a fallback, check extractedText as well
      let extractedData = resume.extractedText;
      if (typeof extractedData === "string") {
        try {
          extractedData = JSON.parse(extractedData);
        } catch (err) {
          console.warn("Could not parse 'extractedText' JSON:", err);
          extractedData = null;
        }
      }
      
      if (extractedData?.driveUrl) {
        console.log("Opening drive URL from parsed extractedText:", extractedData.driveUrl);
        window.open(extractedData.driveUrl, "_blank");
        return;
      }
      
      // If all else fails
      console.error("No driveUrl found in resume:", resume);
      alert("Sorry, the PDF link for this resume is not available.");
      
    } catch (error) {
      console.error("Error opening PDF:", error);
      alert("Error opening the resume PDF. Please try again.");
    }
  };

  // Function to retry the search
  const retrySearch = () => {
    setError(null);
    findSimilarResumes();
  };

  return (
    <div className="mt-6 p-4 sm:p-6 bg-slate-800/50 rounded-lg shadow-xl border border-slate-700 transition-all duration-300 hover:shadow-indigo-900/20">
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="w-1 h-8 sm:h-10 bg-indigo-500 rounded-full mr-3 sm:mr-4"></div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-100 group-hover:text-white">Find Similar Resumes</h3>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={findSimilarResumes}
          disabled={isLoading}
          className="relative flex items-center justify-center gap-2 sm:gap-3 overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-2.5 sm:py-3.5 px-4 sm:px-8 rounded-lg font-medium hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-70 w-full max-w-lg transition-all shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-800 text-sm sm:text-base"
        >
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${isLoading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isLoading ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M16 10.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"
              />
            )}
          </svg>
          {isLoading ? "Searching Resumes..." : "Find Similar Resumes"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 sm:p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 animate-fadeIn shadow-lg text-sm sm:text-base">
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <div className="mt-3 flex justify-end">
            <button 
              onClick={retrySearch}
              className="px-3 py-1 bg-red-500/30 hover:bg-red-500/50 text-red-200 rounded text-xs font-medium transition-colors duration-200 flex items-center"
            >
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          </div>
        </div>
      )}

      {hasSearched && !isLoading && results.length > 0 && (
        <div className="mt-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <h4 className="text-base sm:text-lg font-semibold text-gray-100">
              Similar Profiles
            </h4>
            <div className="ml-3 px-2 sm:px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-full border border-indigo-500/30">
              {results.length}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((item, index) => (
              <div
                key={index}
                className="bg-slate-800 border border-slate-700 p-3 sm:p-5 rounded-xl cursor-pointer hover:bg-slate-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 group"
                onClick={() => openPdf(item)}
              >
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 bg-indigo-500/20 rounded-full p-1.5 sm:p-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-base sm:text-lg text-indigo-300 group-hover:text-indigo-200 truncate">{extractName(item)}</h5>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1 line-clamp-2">{extractEducation(item)}</p>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/50">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400 mr-1.5 sm:mr-2 group-hover:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-indigo-400 text-xs sm:text-sm font-medium group-hover:text-indigo-300 whitespace-nowrap">View resume</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSearched && !isLoading && results.length === 0 && !error && (
        <div className="mt-6 p-6 sm:p-8 bg-slate-800/80 rounded-lg text-center border border-slate-700 animate-fadeIn shadow-lg">
          <svg className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-slate-500 mb-3 sm:mb-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-300 text-base sm:text-lg font-medium">No similar resumes found</p>
          <p className="text-gray-400 mt-2 max-w-md mx-auto text-sm sm:text-base">Try uploading more resumes to improve matching results</p>
        </div>
      )}
    </div>
  );
}