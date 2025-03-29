import React, { useState } from "react";
import axios from "axios";

export function SearchResume({ data }) {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Function to extract the name from the JSON string inside extractedText
  const extractName = (resume) => {
    try {
      const parsedData = JSON.parse(resume.extractedText);
      return parsedData?.name || "Unnamed";
    } catch (error) {
      return "Unnamed";
    }
  };

  // Function to extract education details
  const extractEducation = (resume) => {
    try {
      const parsedData = JSON.parse(resume.extractedText);
      return parsedData?.education?.map((edu) => edu.degree + " at " + edu.institution).join(", ") || "N/A";
    } catch (error) {
      return "N/A";
    }
  };

  // Function to extract skills
  const extractSkills = (resume) => {
    try {
      const parsedData = JSON.parse(resume.extractedText);
      return parsedData?.skills?.slice(0, 5).join(", ") || "No skills listed";
    } catch (error) {
      return "No skills listed";
    }
  };

  // Function to extract a summary or preview from the extractedText
  const extractSummary = (resume) => {
    try {
      const parsedData = JSON.parse(resume.extractedText);
      return parsedData?.sections?.summary || parsedData?.experience?.slice(0, 1).join(". ") || "No summary available.";
    } catch (error) {
      return "No summary available.";
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

      const response = await axios.post("https://resumeprivate.onrender.com/search", {
        query: queryText,
      });

      setResults(response.data);
      if (response.data.length === 0) {
        setError("No similar resumes found.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.response?.data?.error || "Error searching for similar resumes.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to open the resume PDF
  const openPdf = (publicId) => {
    const url = `https://resumeprivate.onrender.com/pdf/${publicId}`;
    window.open(url, "_blank");
  };

  return (
    <div className="mt-8 p-6 bg-gray-900 rounded-lg shadow-2xl border border-gray-800 transition-all duration-300 hover:shadow-indigo-900/10 sm:p-8">
      <div className="flex items-center mb-6">
        <div className="w-1 h-10 bg-indigo-600 rounded-full mr-4 sm:w-2 sm:h-12"></div>
        <h3 className="text-xl font-bold text-gray-100 sm:text-2xl">Find Similar Resumes</h3>
      </div>

      <button
        onClick={findSimilarResumes}
        disabled={isLoading}
        className="relative flex items-center justify-center gap-3 overflow-hidden bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-800 disabled:text-gray-300 w-full transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        <svg
          className={`w-5 h-5 transition-all ${isLoading ? "animate-spin" : ""}`}
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
        {isLoading ? "Searching..." : "Find Similar Resumes"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300 animate-fadeIn">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {hasSearched && !isLoading && results.length > 0 && (
        <div className="mt-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-100">
              Similar Resumes Found
            </h4>
            <div className="ml-3 px-2.5 py-1 bg-indigo-900/50 text-indigo-300 text-xs font-medium rounded-full">
              {results.length}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {results.map((item, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 p-5 rounded-xl cursor-pointer hover:bg-gray-750 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:border-indigo-600/50 group"
                onClick={() => openPdf(item.public_id)}
              >
                <h5 className="font-bold text-lg text-indigo-300 group-hover:text-indigo-200">{extractName(item)}</h5>
                <p className="text-sm text-gray-300 mt-1">{extractEducation(item)}</p>
               
                <div className="mt-4 flex items-center">
                  <svg className="w-4 h-4 text-indigo-400 mr-2 group-hover:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-indigo-400 text-sm font-medium group-hover:text-indigo-300">View resume</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSearched && !isLoading && results.length === 0 && !error && (
        <div className="mt-6 p-6 bg-gray-800 rounded-lg text-center border border-gray-700 animate-fadeIn">
          <svg className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-300 text-lg font-medium">No similar resumes found</p>
          <p className="text-gray-400 mt-2">Try uploading more resumes to improve matching</p>
        </div>
      )}
    </div>
  )}