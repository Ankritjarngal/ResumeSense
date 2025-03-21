const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { extractEntities } = require('./ner.js');
const { report } = require('./score.js');
const { searchPinecone } = require('./pineconeSearch.js');
const { uploadToPinecone } = require('./pineconeUpload.js');
const { generateEmbedding } = require('./generateEmbedding.js');

const app = express();
app.use(cors({ origin: "*", methods: "GET,POST", allowedHeaders: "Content-Type" }));
app.use(express.json());

// Create 'uploads' directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const upload = multer({ dest: 'uploads/temp/' });

// Ensure temp upload directory exists
if (!fs.existsSync('uploads/temp')) {
    fs.mkdirSync('uploads/temp', { recursive: true });
}

app.post("/upload", upload.single("resume"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Please upload a file" });
    }

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const dataB = await pdfParse(dataBuffer);
        
        const entities = extractEntities(dataB.text);
        const scoreByAi = await report(entities);

        const embeddings = await generateEmbedding(JSON.stringify(entities));
        if (!embeddings) {
            return res.status(500).json({ error: "Invalid embedding generated." });
        }

        await uploadToPinecone(req.file.filename, embeddings, JSON.stringify(entities));

        // Make a permanent copy of the uploaded file with .pdf extension
        const destinationPath = path.join(__dirname, 'uploads', `${req.file.filename}.pdf`);
        fs.copyFileSync(req.file.path, destinationPath);

        res.json({ success: true, filename: req.file.filename, scoreByAi, extractedData: entities });
    } catch (err) {
        console.error("Error processing file:", err);
        res.status(500).json({ error: "Error processing the file" });
    } finally {
        // Delete only the temporary file
        fs.promises.unlink(req.file.path).catch(console.error);
    }
});

// Add this route to serve PDF files
app.get("/pdf/:id", async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'uploads', `${req.params.id}.pdf`);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).send("File not found");
        }
        
        // Set proper content type for PDF
        res.setHeader('Content-Type', 'application/pdf');
        // Send the file
        res.sendFile(filePath);
    } catch (err) {
        console.error("Error serving PDF:", err);
        res.status(500).send("Error serving PDF file");
    }
});

app.post("/search", async function (req, res) {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: "Query is required" });

        const embedding = await generateEmbedding(query);
        if (!Array.isArray(embedding) || embedding.length === 0) {
            throw new Error("Invalid embedding generated.");
        }

        const results = await searchPinecone(embedding);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Error searching Pinecone", details: err.message });
    }
});

app.listen(5001, () => console.log("Server running on port 5001"));