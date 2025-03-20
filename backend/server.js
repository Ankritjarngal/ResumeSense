const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const natural = require('natural');
const stopword = require('stopword');
const { extractEntities } = require('./ner.js');
const { report } = require('./score.js');
const { searchPinecone } = require('./pineconeSearch.js');
const { uploadToPinecone } = require('./pineconeUpload.js');
const { generateEmbedding } = require('./generateEmbedding.js');

const app = express();
const corsOptions = {
    origin: "*",
    methods: "GET,POST",
    allowedHeaders: "Content-Type",
};

app.use(cors(corsOptions));
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

app.post("/upload", upload.single("resume"), async (req, res) => {
    if (!req.file) {
        console.error("No file received!");
        return res.status(400).json({ error: "Please upload a file" });
    }

    console.log("File uploaded:", req.file);

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const dataB = await pdfParse(dataBuffer);
        
        const entities = extractEntities(dataB.text);

        // Delete uploaded file after processing
        scoreByAi=await report(entities);
        const embeddings = await generateEmbedding(JSON.stringify(entities));
        if (!embeddings) {
            console.error("Failed to generate embeddings!");
            return res.status(500).json({ error: "Invalid embedding generated." });
        }

        await uploadToPinecone(req.file.filename, embeddings,JSON.stringify(entities) );

        console.log("Upload successful");
        res.json({ success: true, filename: req.file.filename ,scoreByAi,extractedData:entities});
    } catch (err) {
        console.error("Error processing the file:", err);
        res.status(500).json({ error: "Error processing the file" });
    } finally {
        // Clean up the uploaded file
        fs.promises.unlink(req.file.path).catch(console.error);
    }
});


const extractEmailAndPhone = (text) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /\+?91[-.\s]?\d{5}[-.\s]?\d{5}|\b\d{10}\b|\b\d{3,4}[-.\s]?\d{6,8}\b/g;

    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];

    return { emails, phones };
};

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
        console.error(err);
        res.status(500).json({ error: "Error searching Pinecone", details: err.message });
    }
});


app.listen(5001, () => {
    console.log("Server is running on port 5001");
});
