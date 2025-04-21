require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");

async function initPinecone() {
    const client = new Pinecone({ apiKey:process.env.pinecone_api_key });
    return client;
}

async function searchPinecone(embedding, topK = 5, similarityThreshold = 0.1) {
    if (!Array.isArray(embedding) || embedding.length !== 1024) {
        throw new Error("Embedding must be an array of length 1024.");
    }

    const client = await initPinecone();
    const index = client.index("resume-data");

    console.log(`Searching Pinecone with vector of length ${embedding.length}`);

    const response = await index.query({
        vector: embedding,
        topK: topK,
        includeMetadata: true,
    });

    if (!response.matches) return [];

    return response.matches
        .filter(match => match.score >= similarityThreshold)
        .map(match => ({
            score: match.score,
            public_id: match.metadata?.public_id || "unknown",
            entities: match.metadata?.entities || "{}",
            fileName: match.metadata?.fileName || "N/A",
            driveUrl: match.metadata?.driveUrl || ""
        }));
}

module.exports = { searchPinecone };