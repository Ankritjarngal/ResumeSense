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

      const response = await axios.post("http://localhost:5001/search", {
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
    const url = `http://localhost:5001/pdf/${publicId}`;
    window.open(url, "_blank");
  };

  return (
    <div className="mt-8 p-6 bg-slate-700 rounded-lg shadow-xl">
      <div className="flex items-center mb-6">
        <div className="w-2 h-12 bg-blue-500 rounded-full mr-4"></div>
        <h3 className="text-2xl font-bold text-gray-100">Find Similar Resumes</h3>
      </div>

      <button
        onClick={findSimilarResumes}
        disabled={isLoading}
        className="relative flex items-center justify-center gap-3 overflow-hidden bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 w-full transition-all shadow-lg hover:shadow-xl"
      >
        <svg
          className={`w-5 h-5 transition-all ${isLoading ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M16 10.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"
          />
        </svg>
        {isLoading ? "Searching..." : "Find Similar Resumes"}
      </button>



      {error && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {hasSearched && !isLoading && results.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4">
            Similar Resumes Found ({results.length})
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.map((item, index) => (
              <div
                key={index}
                className="bg-slate-800 border border-slate-600 p-5 rounded-xl cursor-pointer hover:bg-slate-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                onClick={() => openPdf(item.public_id)}
              >
                <h5 className="font-bold text-lg text-blue-300">{extractName(item)}</h5>
                <p className="text-sm text-gray-300 mt-1">{extractEducation(item)}</p>
               
                <div className="mt-4 flex items-center text-blue-400 text-sm font-medium">
                  Click to view resume
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSearched && !isLoading && results.length === 0 && !error && (
        <div className="mt-6 p-6 bg-slate-800 rounded-lg text-center">
          <p className="text-gray-300 mt-4 text-lg">No similar resumes found.</p>
          <p className="text-gray-400 mt-2">Try uploading more resumes to improve matching.</p>
        </div>
      )}
    </div>
  );
}
