require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");

async function initPinecone() {
    const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    return client;
}

async function searchPinecone(embedding, topK = 5, similarityThreshold = 0.1) {
    if (!Array.isArray(embedding) || embedding.length !== 1024) {
        throw new Error("Embedding must be an array of length 1024.");
    }

    const client = await initPinecone();
    const index = client.index(process.env.PINECONE_INDEX_NAME);

    const response = await index.query({
        vector: embedding,
        topK: topK,
        includeMetadata: true,
    });

    if (!response.matches) {
        return [];
    }

    // Return only results with a high enough similarity score
    return response.matches
        .filter(match => match.score >= similarityThreshold)
        .map(match => ({
            public_id: match.metadata?.public_id || "unknown",
            extractedText: match.metadata?.extractedText || "",
            score: match.score
        }));
}

module.exports = { searchPinecone };
