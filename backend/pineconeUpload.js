require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");

async function initPinecone() {
    const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    return client;
}

function cleanText(text) {
    return text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
}

async function uploadToPinecone(publicId, vector, extractedText) {
    if (!Array.isArray(vector) || vector.length !== 1024) {
        throw new Error("Vector must be an array of length 1024.");
    }

    const client = await initPinecone();
    const index = client.index(process.env.PINECONE_INDEX_NAME);

    const metadata = { public_id: publicId, extractedText: cleanText(extractedText) };

    console.log("Uploading to Pinecone:", { publicId, values: vector, metadata });

    return await index.upsert([{ id: publicId, values: vector, metadata }]);
}

module.exports = { uploadToPinecone };