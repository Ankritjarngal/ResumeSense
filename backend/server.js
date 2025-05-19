const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const pdfParse = require('pdf-parse');

// Custom Modules
const { extractEntities, extractRelevantInternshipSkills } = require('./ner.js');
const { report } = require('./score.js');
const { searchPinecone } = require('./pineconeSearch.js');
const { uploadToPinecone } = require('./pineconeUpload.js');
const { generateEmbedding } = require('./generateEmbedding.js');

const app = express();
const PORT = 5001;

// Middlewares
app.use(cors({ origin: "*", methods: "GET,POST", allowedHeaders: "Content-Type" }));
app.use(express.json());
const upload = multer({ dest: 'temp/' });

// Google Drive setup
const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, 'resume-everything-362da5c93752.json'),
    scopes: ['https://www.googleapis.com/auth/drive'],
});
const drive = google.drive({ version: 'v3', auth });
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1v0a2x4Xk3g5Z7b6q8z9Y5J6Q9F1G3h4K'; // Replace with your folder ID

// Upload file to Google Drive
async function uploadToDrive(filePath, originalName) {
    try {
        const fileMetadata = { name: originalName, parents: [FOLDER_ID] };
        const media = { mimeType: 'application/pdf', body: fs.createReadStream(filePath) };

        const file = await drive.files.create({
            resource: fileMetadata,
            media,
            fields: 'id, webViewLink',
        });

        // Make file public
        await drive.permissions.create({
            fileId: file.data.id,
            requestBody: { role: 'reader', type: 'anyone' },
        });

        console.log(`Uploaded to Drive: ${file.data.webViewLink}`);
        return file.data;
    } catch (err) {
        console.error("Google Drive upload failed:", err.message);
        throw err;
    }
}

// Health check
app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

// Upload and process resume
app.post("/upload", upload.single("resume"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    console.log(` Received file: ${fileName}`);

    try {
        const dataBuffer = fs.readFileSync(filePath);
        const parsed = await pdfParse(dataBuffer);

        const text = parsed.text;
        const entities = extractEntities(text);
        const skills = extractRelevantInternshipSkills(text);
        const scoreByAi = await report(entities);

        console.log(" Resume parsed and analyzed");

        // Upload to Drive
        const driveFile = await uploadToDrive(filePath, fileName);

        // Embedding generation
        let embeddings = await generateEmbedding(JSON.stringify(entities));
        if (!Array.isArray(embeddings)) throw new Error("Invalid embeddings generated");

        console.log(" Embeddings generated");

        // Upload to Pinecone
        await uploadToPinecone(req.file.filename, embeddings, {
            entities: JSON.stringify(entities),
            driveUrl: driveFile.webViewLink,
            fileName: fileName,
        });

        console.log(" Uploaded to Pinecone");

        res.json({
            success: true,
            filename: req.file.filename,
            driveLink: driveFile.webViewLink,
            scoreByAi,
            extractedData: entities,
            extractedSkills: skills,
        });
    } catch (err) {
        console.error(" Error in /upload:", err);
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
            stack: err.stack,
        });
    } finally {
        fs.promises.unlink(filePath).catch(console.error);
    }
});

// Just parse and extract resume info without Drive/Pinecone
app.post("/uploadonly", upload.single("resume"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const parsed = await pdfParse(dataBuffer);

        const text = parsed.text;
        const skills = extractRelevantInternshipSkills(text);
        const entities = extractEntities(text);
        const scoreByAi = await report(entities);

        res.json({
            success: true,
            filename: req.file.filename,
            scoreByAi,
            extractedData: entities,
            extractedSkills: skills,
        });
    } catch (err) {
        console.error(" Error in /uploadonly:", err);
        res.status(500).json({ error: "Processing Error", message: err.message });
    } finally {
        fs.promises.unlink(req.file.path).catch(console.error);
    }
});

// Pinecone search
// Pinecone search
app.post("/search", async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: "Query is required" });

        const embedding = await generateEmbedding(query);
        if (!Array.isArray(embedding) || embedding.length === 0) {
            throw new Error("Invalid embedding generated");
        }

        const results = await searchPinecone(embedding); // ✅ now an array

        res.json(results); // ✅ return directly
    } catch (err) {
        console.error(" Error in /search:", err);
        res.status(500).json({ error: "Search error", message: err.message });
    }
});



app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
