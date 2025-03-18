const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const natural = require('natural');
const stopword = require('stopword');
const { extractEntities } = require('./ner.js');
const {report}=require('./score.js');
const { json } = require('stream/consumers');

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

app.post("/upload", upload.single("resume"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Please upload a file" });
    
    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const dataB = await pdfParse(dataBuffer);
        
        const tokenizer = new natural.WordTokenizer();
        const words = tokenizer.tokenize(dataB.text);
        const removedStopwords = stopword.removeStopwords(words);
        
        const { emails, phones } = extractEmailAndPhone(dataB.text);
        
        // Extract entities using NER
        const entities = extractEntities(dataB.text);

        // Delete uploaded file after processing
        fs.promises.unlink(req.file.path).catch(console.error);
        scoreByAi=await report(entities);
        const cleanedScore = scoreByAi.replace(/```json|```/g, "").trim();
        res.json(JSON.parse(cleanedScore));
        

        
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error processing the file" });
    }
    
});

const extractEmailAndPhone = (text) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    
    const phoneRegex = /\+?91[-.\s]?\d{5}[-.\s]?\d{5}|\b\d{10}\b|\b\d{3,4}[-.\s]?\d{6,8}\b/g;
    
    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];
    
    return { emails, phones };
};



app.listen(5000, () => {
    console.log("Server is running on port 5000");
});