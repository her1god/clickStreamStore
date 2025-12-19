const { containerClient, CONTAINER_NAME } = require('../config/azure');
const fs = require('fs').promises;
const path = require('path');
const AnalyticsModel = require('../models/AnalyticsModel');
const DailyAnalyticsModel = require('../models/DailyAnalyticsModel');
const VisitorModel = require('../models/VisitorModel');

const TEMP_LOGS_DIR = path.join(__dirname, '../../temp_logs');
const ARCHIVE_DIR = path.join(__dirname, '../../temp_logs/archive');

// Ensure archive dir
(async () => {
    try { await fs.mkdir(ARCHIVE_DIR, { recursive: true }); } catch (e) {}
})();


// Helper for stream to string
async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data.toString());
        });
        readableStream.on("end", () => {
            resolve(chunks.join(""));
        });
        readableStream.on("error", reject);
    });
}

// Unified Aggregation Logic
function processLogData(data, aggregatedData, dailyData, visitorData) {
    // Visitor Tracking
    if (data.sessionId) {
        visitorData[data.sessionId] = {
            userAgent: data.userAgent || 'Unknown',
            timestamp: data.timestamp
        };
    }

    if (!data.productId) return;

    if (!aggregatedData[data.productId]) {
        aggregatedData[data.productId] = { views: 0, carts: 0, purchases: 0 };
    }

    if (data.event === 'VIEW_PRODUCT') aggregatedData[data.productId].views++;
    if (data.event === 'ADD_TO_CART') aggregatedData[data.productId].carts++;
    if (data.event === 'PURCHASE') aggregatedData[data.productId].purchases++;

    // Time Series
    const dateObj = new Date(data.timestamp);
    if (!isNaN(dateObj)) {
        const dateKey = dateObj.toISOString().split('T')[0]; 
        const hourKey = dateObj.getHours();
        const key = `${dateKey}|${hourKey}`;
        dailyData[key] = (dailyData[key] || 0) + 1;
    }
}

class ETLService {
    static async runETLJob() {
        console.log("Starting ETL Job...");
        const aggregatedData = {}; // { productId: { views, carts, purchases } }
        const dailyData = {}; // { "YYYY-MM-DD-HH": count }
        const visitorData = {}; // { sessionId: { userAgent, timestamp } }
        const filesToArchive = []; 

        // 1. Azure Blob Source
        if (containerClient) {
             try {
                // List blobs
                for await (const blob of containerClient.listBlobsFlat()) {
                    if (blob.name.startsWith('log_')) {
                        try {
                            const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
                            const downloadBlockBlobResponse = await blockBlobClient.download(0);
                            const downloadedContent = (await streamToString(downloadBlockBlobResponse.readableStreamBody));
                            
                            const data = JSON.parse(downloadedContent);
                            processLogData(data, aggregatedData, dailyData, visitorData);
                            
                            filesToArchive.push({ type: 'azure', name: blob.name });
                        } catch (parseErr) {
                            console.error("Error processing Azure log:", blob.name, parseErr);
                        }
                    }
                }
            } catch (azureErr) {
                console.error("Azure ETL Error:", azureErr);
            }
        } 
        
        // 2. Local File Source (Fallback)
        try {
            const files = await fs.readdir(TEMP_LOGS_DIR);
            for (const file of files) {
                if (file.startsWith('log_') && file.endsWith('.json')) {
                    try {
                        const content = await fs.readFile(path.join(TEMP_LOGS_DIR, file), 'utf8');
                        const data = JSON.parse(content);
                        processLogData(data, aggregatedData, dailyData, visitorData);
                        
                        filesToArchive.push({ type: 'local', name: file });
                    } catch (parseErr) {
                         console.error("Error processing local log:", file, parseErr);
                    }
                }
            }
        } catch (fsErr) {
            console.error("Local ETL Error:", fsErr);
        }

        // 3. Load Product Analytics
        const updates = Object.keys(aggregatedData).map(pid => ({ 
            productId: pid, 
            views: aggregatedData[pid].views, 
            carts: aggregatedData[pid].carts, 
            purchases: aggregatedData[pid].purchases 
        }));
        
        if (updates.length > 0) {
            await AnalyticsModel.upsertMetrics(updates);
        }

        // 4. Load Daily Analytics
        const dailyUpdates = Object.keys(dailyData);
        if (dailyUpdates.length > 0) {
            console.log(`Updating daily analytics for ${dailyUpdates.length} time slots.`);
            for (const key of dailyUpdates) {
                const [date, hour] = key.split('|');
                await DailyAnalyticsModel.incrementView(date, hour, dailyData[key]);
            }
        }

        // 5. Load Visitor Analytics
        const sessionIds = Object.keys(visitorData);
        if (sessionIds.length > 0) {
             console.log(`Tracking ${sessionIds.length} unique sessions.`);
             for (const sid of sessionIds) {
                 await VisitorModel.upsertSession(sid, visitorData[sid].userAgent, visitorData[sid].timestamp);
             }
        }

        // 6. Cleanup
        for (const fileItem of filesToArchive) {
            if (fileItem.type === 'azure') {
                 try {
                     const sourceClient = containerClient.getBlockBlobClient(fileItem.name);
                     await sourceClient.delete(); 
                 } catch (e) {
                     // Ignore if already deleted/missing (Race condition or previous run)
                     if (e.code !== 'BlobNotFound') {
                         console.error("Failed to archive Azure blob:", fileItem.name, e.message);
                     }
                 }
            } else {
                // Local move
                try {
                     await fs.rename(path.join(TEMP_LOGS_DIR, fileItem.name), path.join(ARCHIVE_DIR, fileItem.name));
                } catch (e) { console.error("Archive error", e); }
            }
        }
        console.log("ETL Job Completed.");
        return { processed: updates.length, archived: filesToArchive.length, sessions: sessionIds.length };
    }
}

module.exports = ETLService;
