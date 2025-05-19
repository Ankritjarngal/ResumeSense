require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");

async function initPinecone() {
    const client = new Pinecone({ 
        apiKey: process.env.PINECONE_API_KEY,
    });
    return client;
}



async function uploadToPinecone(publicId, vector, metadata) {
    if (!Array.isArray(vector) || vector.length !== 1024) {
        throw new Error("Vector must be an array of length 1024.");
    }

    const client = await initPinecone();
    const index = client.index("resume-data");

    // Process metadata to ensure it's properly structured
    const processedMetadata = {
        public_id: publicId,
        entities: typeof metadata.entities === 'string' ? metadata.entities : JSON.stringify(metadata.entities),
        driveUrl: metadata.driveUrl || '',
        fileName: metadata.fileName || 'unknown',
    };

    console.log("Uploading to Pinecone:", { 
        publicId, 
        vectorLength: vector.length,
        metadataKeys: Object.keys(processedMetadata)
    });

    return await index.upsert([{ 
        id: publicId, 
        values: vector, 
        metadata: processedMetadata 
    }]);
}

module.exports = { uploadToPinecone };