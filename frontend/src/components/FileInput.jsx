import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function FileInput() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [button, setButton] = useState(false);
  const [buttonText, setButtonText] = useState("Upload");
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(null);
  const navigate = useNavigate();  // Hook to navigate between pages

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

  const handleUploadClick = () => {
    setButtonText("Uploading...");
    const formData = new FormData();
    formData.append("resume", selectedFile);
    try {
      axios
        .post("http://localhost:5000/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        })
        .then((response) => {
          setScore(response.data); 
          setButtonText("Upload");
          navigate('/score-visualization', { state: { score: response.data } });
        });
    } catch (err) {
      setScore("Error processing the file. Try again...");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl  text-center mb-30">Upload your resume</h1>
      
      <label
        htmlFor="pdf-upload"
        className="block w-full px-4 text-black text-lg py-3 text-center bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200 transition-colors mb-3"
      >
        {selectedFile ? selectedFile.name : "Choose PDF File"}
      </label>
      

      <input
        id="pdf-upload"
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {selectedFile && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-black">
            Selected file: <span className="font-medium">{selectedFile.name}</span>
          </p>
          <p className="text-black text-sm">Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      {button && (
        <button
          className="w-full mt-4 px-4 py-3 text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          onClick={handleUploadClick}
        >
          {buttonText}
        </button>
      )}

      {progress > 0 && !score && (
        <div className="mt-4">
          <progress value={progress} max="100" />
        </div>
      )}
    </div>
  );
}
