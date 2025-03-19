const { pipeline } = require("@xenova/transformers");

let embeddingModel = null;

async function generateEmbedding(text) {
    try {
        if (!embeddingModel) {
            console.log("Loading embedding model...");
            embeddingModel = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
        }

        console.log("Generating embedding for text length:", text.length);
        
        // 🔹 Limit input length to avoid excessive processing
        const maxLength = 512;
        if (text.length > maxLength) {
            text = text.slice(0, maxLength);
        }

        const embeddingTensor = await embeddingModel(text, { pooling: "mean", normalize: true });

        // 🔹 Convert Tensor to a standard array
        const vector = Array.from(embeddingTensor.data);

        console.log("Generated embedding shape:", vector.length);

        return adjustVectorSize(vector, 1024); // Convert to 1024 dimensions
    } catch (error) {
        console.error("Embedding Generation Error:", error.message);
        return null;
    }
}

// ✅ Adjust vector size to 1024D
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
