const { pipeline } = require("@xenova/transformers");

let embeddingModel = null;

async function generateEmbedding(text) {
    try {
        if (!text || typeof text !== "string") {
            throw new Error("Invalid input: text must be a non-empty string.");
        }

        if (!embeddingModel) {
            console.log("Loading embedding model...");
            embeddingModel = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
        }

        console.log("Generating embedding for text length:", text.length);

        const maxLength = 512;
        if (text.length > maxLength) {
            text = text.slice(0, maxLength);
        }

        const embeddingTensor = await embeddingModel(text, { pooling: "mean", normalize: true });
        const vector = Array.from(embeddingTensor.data);

        console.log("Generated embedding shape:", vector.length);
        return adjustVectorSize(vector, 1024);
    } catch (error) {
        console.error("Embedding Generation Error:", error.message);
        return null;
    }
}

function adjustVectorSize(vector, targetSize = 1024) {
    if (!Array.isArray(vector)) {
        console.error("Error: Vector is not an array!", vector);
        return null;
    }

    if (vector.length === targetSize) return vector;
    if (vector.length > targetSize) return vector.slice(0, targetSize);
    return [...vector, ...Array(targetSize - vector.length).fill(0)];
}

module.exports = { generateEmbedding };
