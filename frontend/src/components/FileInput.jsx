import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";


const CLOUDINARY_UPLOAD_PRESET = "resume_uploads";
const CLOUDINARY_CLOUD_NAME = "dfkjcuf8t";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

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
  const [cloudinaryUrl, setCloudinaryUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const[buttondata,setButtonData] = useState("Hide My Resume from Others");

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

  const handleUploadOnlyScore = async () => {
    setButtonText("Processing...");
    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const response = await axios.post("https://resumeprivate.onrender.com/uploadonly", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const scoreByAi = response.data.scoreByAi || "";
      const extractedData = response.data.extractedData || "";
      const extractedSkills=response.data.extractedSkills|| "";
      

      const parsedScore = scoreByAi ? parseScore(scoreByAi) : null;
      const parsedData = extractedData ? parseScore(extractedData) : null;

      setScore(parsedScore);
      setExtractedData(parsedData);
      setButtonText("Upload");

      navigate("/score-visualization", {
        state: { score: parsedScore, data: parsedData , skills:extractedSkills},
      });
    } catch (err) {
      console.error("Upload error:", err);
      setError("Error processing file: " + err.message);
      setButtonText("Upload");
    }
  };

  const parseScore = (scoreString) => {
    try {
      const jsonStr = scoreString.replace(/```json|```/g, "").trim();
      return JSON.parse(jsonStr);
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
      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      return { url: response.data.secure_url, publicId: response.data.public_id };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  const handleUploadClick = async () => {
    setButtonText("Uploading...");

    try {
      const { url, publicId } = await uploadToCloudinary(selectedFile);
      setCloudinaryUrl(url);
      setCloudinaryPublicId(publicId);
      console.log("Cloudinary upload successful. URL:", url);

      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("cloudinaryUrl", url);
      formData.append("cloudinaryPublicId", publicId);

      const response = await axios.post("https://resumeprivate.onrender.com/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const scoreByAi = response.data.scoreByAi || "";
      const extractedData = response.data.extractedData || "";

      const parsedScore = scoreByAi ? parseScore(scoreByAi) : null;
      const parsedData = extractedData ? parseScore(extractedData) : null;

      setScore(parsedScore);
      setExtractedData(parsedData);
      setButtonText("Upload");

      navigate("/score-visualization", {
        state: { score: parsedScore, data: parsedData, fileUrl: url, publicId: publicId },
      });
    } catch (err) {
      console.error("Upload error:", err);
      setError("Error uploading file: " + err.message);
      setButtonText("Upload");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-900 shadow-xl rounded-lg border border-gray-700 sm:max-w-lg md:max-w-xl">
      <h1 className="text-2xl font-semibold text-center mb-5 text-gray-100">Upload your resume</h1>

      <label
        htmlFor="pdf-upload"
        className="block w-full px-4 py-3 text-lg text-gray-200 bg-gray-800 border border-gray-600 rounded-md cursor-pointer hover:bg-gray-700 transition mb-3 text-center truncate"
      >
        {selectedFile ? selectedFile.name : "Choose PDF File"}
      </label>

      <input id="pdf-upload" type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="hidden" />

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      {selectedFile && (
        <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-md">
          <p className="text-gray-300">Selected file: <span className="font-medium text-gray-100">{selectedFile.name}</span></p>
          <p className="text-gray-400 text-sm">Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      {button && (
        <button
          className="w-full mt-4 px-4 py-3 text-white bg-blue-700 border border-blue-800 rounded-md hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={storeResume ? handleUploadClick : handleUploadOnlyScore}
        >
          {buttonText}
        </button>
      )}

<button
  className={`mt-3 w-60 px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
    storeResume
      ? "bg-blue-800 hover:bg-blue-900 text-white focus:ring-blue-500"
      : "bg-gray-900 hover:bg-gray-800 text-gray-300 focus:ring-gray-600"
  }`}
  onClick={() => {
    setStoreResume((prev) => {
      const newValue = !prev;
      setButtonData(newValue ? "Use My Resume" : "Don't Use Resume");
      return newValue;
    });
  }}
>
  {storeResume ? <CheckCircle size={18} /> : <XCircle size={18} />}
  <span className="whitespace-nowrap">{buttondata}</span>
</button>



      {progress > 0 && !score && (
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-1">{progress}%</p>
        </div>
      )}

      {cloudinaryUrl && (
        <div className="mt-4 p-3 bg-blue-700 border border-green-700 rounded-md text-black">
          <p className="text-green-300">File uploaded successfully!</p>
        </div>
      )}
    </div>
  );
}