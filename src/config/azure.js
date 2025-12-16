const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

let blobServiceClient = null;
let containerClient = null;
const CONTAINER_NAME = 'clickstream-logs';

try {
    if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
        blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
        // Ensure container exists
        containerClient.createIfNotExists().catch(err => {
             // Ignore if already exists, logic handled in service usually or here
             if (err.code !== 'ContainerAlreadyExists') {
                 console.error("Azure Container Init Error:", err.message);
                 containerClient = null; // Disable if fails
             }
        });
        console.log("Azure Blob Storage configured.");
    } else {
        console.warn("AZURE_STORAGE_CONNECTION_STRING is missing. Using local fallback.");
    }
} catch (error) {
    console.error("Azure Configuration Failed:", error.message);
}

module.exports = { blobServiceClient, containerClient, CONTAINER_NAME };
