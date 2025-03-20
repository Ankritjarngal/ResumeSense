require("dotenv").config();

const { Pinecone } = require("@pinecone-database/pinecone");

const pineconeApiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME; 

const pinecone = new Pinecone({ apiKey: pineconeApiKey });
const index = pinecone.index(indexName);

async function searchPinecone(embedding, topK = 5, similarityThreshold = 0.1) {
    if (!Array.isArray(embedding) || embedding.length !== 1024) {
        throw new Error("Embedding must be an array of length 1024.");
    }

    const response = await index.query({
        vector: embedding,
        topK: topK, 
        includeMetadata: true 
    });

    if (!response.matches) {
        return [];
    }

    // Filter results based on similarity score
    const filteredResults = response.matches.filter(match => match.score >= similarityThreshold);

    return filteredResults;
}

module.exports = {
    searchPinecone
};
