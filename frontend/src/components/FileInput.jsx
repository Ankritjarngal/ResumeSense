import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Upload, FileText } from "lucide-react";

export function FileInput() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [button, setButton] = useState(false);
  const [buttonText, setButtonText] = useState("Upload");
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(null);
  const [storeResume, setStoreResume] = useState(true);
  const navigate = useNavigate();
  const [extractedData, setExtractedData] = useState("");
  const [buttondata, setButtonData] = useState("Hide My Resume from Others");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setError("");
        setButton(true);
      } else {
        setSelectedFile(null);
        setError("Please select a PDF file.");
      }
    }
  };

  const parseScore = (scoreString) => {
    try {
      if (!scoreString) return null;
      if (typeof scoreString === 'object') return scoreString;
      let cleanString = scoreString.replace(/```json\n|\n```|```/g, "").trim();
      return JSON.parse(cleanString);
    } catch (error) {
      console.error("Error parsing score JSON:", error, "Original string:", scoreString);
      return null;
    }
  };

  const handleUpload = async () => {
    setButtonText("Uploading...");

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const endpoint = storeResume 
        ? "https://resumeprivate.onrender.com/upload"
        : "https://resumeprivate.onrender.com/uploadonly";

      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      let scoreByAi = null;
      let extractedSkills = "";

      if (response.data.scoreByAi) {
        const parsedScoreData = parseScore(response.data.scoreByAi);
        if (parsedScoreData) {
          scoreByAi = parsedScoreData.score || null;
          extractedSkills = parsedScoreData.mainskills || "";
        }
      }

      const extractedData = response.data.extractedData || "";
      const parsedData = extractedData ? 
        (typeof extractedData === 'object' ? extractedData : parseScore(extractedData)) 
        : null;

      setScore(scoreByAi);
      setExtractedData(parsedData);
      setButtonText("Upload");

      navigate("/score-visualization", {
        state: { 
          score: scoreByAi, 
          data: parsedData, 
          skills: extractedSkills 
        },
      });
    } catch (err) {
      console.error("Upload error:", err);
      setError("Error uploading file: " + err.message);
      setButtonText("Upload");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-gray-900 shadow-2xl rounded-xl border border-gray-700 sm:max-w-lg md:max-w-xl flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-100">Upload Your Resume</h1>
      
      <div className="w-full mb-6">
        <div className="relative">
          <label htmlFor="pdf-upload" className="flex items-center justify-center w-full px-4 py-4 text-lg text-gray-200 bg-gray-800 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-750 hover:border-blue-500 transition-all duration-300 group">
            <div className="flex flex-col items-center space-y-2">
              <FileText size={32} className="text-blue-400 group-hover:text-blue-300" />
              <span className="font-medium">
                {selectedFile ? selectedFile.name : "Choose PDF File"}
              </span>
              {!selectedFile && <span className="text-sm text-gray-400">Drag and drop or click to browse</span>}
            </div>
          </label>
          <input id="pdf-upload" type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="hidden" />
        </div>

        {error && (
          <div className="mt-3 px-4 py-2 bg-red-900/30 border border-red-800 rounded-lg">
            <p className="text-red-400 text-sm flex items-center">
              <XCircle size={16} className="mr-2" />
              {error}
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="w-full mt-2 mb-4 p-4 bg-gray-800/80 border border-gray-700 rounded-lg">
          <div className="flex items-center">
            <FileText size={24} className="text-blue-400 mr-3" />
            <div>
              <p className="text-gray-200 font-medium">{selectedFile.name}</p>
              <p className="text-gray-400 text-sm">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        </div>
      )}

      {progress > 0 && !score && (
        <div className="w-full mt-4 mb-4">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-200 bg-blue-800">
                  Uploading
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-200">
                  {progress}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-700">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300 ease-in-out"
              ></div>
            </div>
          </div>
        </div>
      )}

      {button && (
        <button
          className="w-full mt-2 px-6 py-4 text-white bg-blue-700 rounded-lg hover:bg-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg flex items-center justify-center"
          onClick={handleUpload}
          disabled={buttonText !== "Upload"}
        >
          {buttonText === "Upload" ? (
            <>
              <Upload size={20} className="mr-2" />
              {buttonText}
            </>
          ) : (
            buttonText
          )}
        </button>
      )}

      <div className="w-full mt-5 border-t border-gray-700 pt-4">
        <button
          className={`w-full px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
            storeResume
              ? "bg-blue-800/60 hover:bg-blue-700 text-white focus:ring-blue-500"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300 focus:ring-gray-600"
          }`}
          onClick={() => {
            setStoreResume((prev) => {
              const newValue = !prev;
              setButtonData(newValue ? "Hide My Resume from Others" : "Don't Use Resume");
              return newValue;
            });
          }}
        >
          {storeResume ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{buttondata}</span>
        </button>
      </div>
    </div>
  );
}
