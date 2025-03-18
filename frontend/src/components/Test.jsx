import { useState } from "react";

const PdfUploader = () => {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
        } else {
            alert("Please upload a valid PDF file.");
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("No file selected!");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);

        try {
            const response = await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            setUploadStatus("File uploaded successfully!");
            console.log(result);
        } catch (error) {
            console.error("Upload error:", error);
            setUploadStatus("File upload failed!");
        }
    };

    return (
        <div className="p-6 bg-gray-100 rounded-lg shadow-lg w-96 mx-auto mt-10">
            <h2 className="text-lg font-semibold mb-4">Upload Resume (PDF)</h2>
            <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="mb-4"
            />
            {file && <p className="text-green-600">{file.name}</p>}
            <button
                onClick={handleUpload}
                className="bg-blue-500 text-white px-4 py-2 mt-3 rounded hover:bg-blue-600"
            >
                Upload
            </button>
            {uploadStatus && <p className="mt-3 text-sm text-gray-700">{uploadStatus}</p>}
        </div>
    );
};

export default PdfUploader;
