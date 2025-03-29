import React, { useState } from "react";
import axios from "axios";

export function SearchInternships({skills}) {
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  function formatSkillsString(skillsString) {
    try {
        // Parse the input string into an array
        let skillsArray = JSON.parse(skillsString);

        // Flatten the nested array
        let flatSkills = skillsArray.flat(Infinity);

        // Encode each word for URL formatting
        let encodedString = flatSkills.map(encodeURIComponent).join("%20");

        // Return the encoded string
        return encodedString;
            
    } catch (error) {
        console.error("Invalid input format:", error);
        return "";
    }
  }

  async function handleSearch() {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const keyWordsRedefined = formatSkillsString(skills).replace(/ /g, "%20");
      console.log(keyWordsRedefined);
      const url = "https://internshala.com/internships/keywords-" + keyWordsRedefined;
      console.log(url);
      
      const response = await axios.post("https://resumeprivate-1.onrender.com/jobs", {
        url: url,
        limit: 6,
      });
      
      setInternships(response.data);
    } catch (err) {
      console.error("Error fetching internships:", err);
      setError("Failed to fetch internships. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-8 p-6 bg-gray-900 rounded-lg shadow-2xl border border-gray-800 transition-all duration-300 hover:shadow-indigo-900/10 sm:p-8">
      <div className="flex items-center mb-6">
        <div className="w-1 h-10 bg-indigo-600 rounded-full mr-4 sm:w-2 sm:h-12"></div>
        <h3 className="text-xl font-bold text-gray-100 sm:text-2xl">Find Internships</h3>
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="relative flex items-center justify-center gap-3 overflow-hidden bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-800 disabled:text-gray-300 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
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
          {isLoading ? "Searching..." : "Find Matching Internships"}
        </button>
      </div>

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

      {hasSearched && !isLoading && internships.length > 0 && (
        <div className="mt-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-100">
              Internships Found
            </h4>
            <div className="ml-3 px-2.5 py-1 bg-indigo-900/50 text-indigo-300 text-xs font-medium rounded-full">
              {internships.length}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {internships.map((internship, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 p-5 rounded-xl cursor-pointer hover:bg-gray-750 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:border-indigo-600/50 group"
                onClick={() => window.open(internship.link, "_blank")}
              >
                <h5 className="font-bold text-lg text-indigo-300 group-hover:text-indigo-200 mb-2">
                  {internship.title}
                </h5>
                <div className="mt-4 flex items-center">
                  <svg className="w-4 h-4 text-indigo-400 mr-2 group-hover:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2" />
                  </svg>
                  <span className="text-indigo-400 text-sm font-medium group-hover:text-indigo-300">View Details</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSearched && !isLoading && internships.length === 0 && !error && (
        <div className="mt-6 p-6 bg-gray-800 rounded-lg text-center border border-gray-700 animate-fadeIn">
          <svg className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-300 text-lg font-medium">No internships found</p>
          <p className="text-gray-400 mt-2">Try updating your profile skills to find better matches</p>
        </div>
      )}
    </div>
  );
}