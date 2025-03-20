import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Cloudinary configuration
const CLOUDINARY_UPLOAD_PRESET = "resume_uploads"; // Create this in your Cloudinary dashboard
const CLOUDINARY_CLOUD_NAME = "dfkjcuf8t"; // Replace with your cloud name
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

export function FileInput() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [button, setButton] = useState(false);
  const [buttonText, setButtonText] = useState("Upload");
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(null);
  const navigate = useNavigate();
  const [extractedData, setExtractedData] = useState("");
  const [cloudinaryUrl, setCloudinaryUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");

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
      const jsonStr = scoreString.replace(/```json|```/g, "").trim(); // Remove backticks and extra text
      return JSON.parse(jsonStr); // Convert string to JSON
    } catch (error) {
      console.error("Error parsing score JSON:", error);
      return null;
    }
  };
  
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`, 
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          }
        }
      );
  
      return {
        url: response.data.secure_url,
        publicId: response.data.public_id
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };
  
  
  const handleUploadClick = async () => {
    setButtonText("Uploading...");
    
    try {
      // First upload to Cloudinary
      const { url, publicId } = await uploadToCloudinary(selectedFile);
      setCloudinaryUrl(url);
      setCloudinaryPublicId(publicId);
      console.log("Cloudinary upload successful. URL:", url);
      
      // Then send to your server
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("cloudinaryUrl", url);
      formData.append("cloudinaryPublicId", publicId);
      
      const response = await axios.post("http://localhost:5001/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      
      const scoreByAi = response.data.scoreByAi || "";
      const extractedData = response.data.extractedData || "";
      
      const parsedScore = scoreByAi ? parseScore(scoreByAi) : null;
      const parsedData = extractedData ? parseScore(extractedData) : null;
      
      setScore(parsedScore);
      setExtractedData(parsedData);
      setButtonText("Upload");
      
      navigate("/score-visualization", {
        state: { 
          score: parsedScore, 
          data: parsedData,
          fileUrl: url,
          publicId: publicId
        },
      });
    } catch (err) {
      console.error("Upload error:", err);
      setError("Error uploading file: " + err.message);
      setButtonText("Upload");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl text-center mb-30">Upload your resume</h1>

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
          <p className="text-black text-sm">
            Size: {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
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
          <progress value={progress} max="100" className="w-full" />
          <p className="text-center text-sm text-gray-400">{progress}%</p>
        </div>
      )}
      
      {cloudinaryUrl && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">
            File uploaded to Cloudinary successfully!
          </p>
        </div>
      )}
    </div>
  );
}