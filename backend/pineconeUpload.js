require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");

async function initPinecone() {
    const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    return client;
}

function cleanText(text) {
    return text.replace(/\n+/g, " ",).replace(/\s+/g, " ").trim(); 
}

async function uploadToPinecone(id, vector, extractedText) {
    if (!Array.isArray(vector) || vector.length !== 1024) {
        throw new Error("Vector must be an array of length 1024.");
    }

    const client = await initPinecone();
    const index = client.Index(process.env.PINECONE_INDEX_NAME);

    const metadata = { extractedText: cleanText(extractedText) }; 

    console.log("Uploading data to Pinecone:", { id, values: vector, metadata });

    return await index.upsert([{ id, values: vector, metadata }]);
}

module.exports = { uploadToPinecone };
