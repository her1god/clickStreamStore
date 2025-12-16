const { containerClient, CONTAINER_NAME } = require('../config/azure');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uid'); // Using uid or uuid, let's check what I installed. I installed 'uid'.
// 'uid' usage: const { uid } = require('uid');
// Actually user asked for 'uid' or standard. I installed 'uid'.
const { uid } = require('uid');

const TEMP_LOGS_DIR = path.join(__dirname, '../../temp_logs');

// Ensure temp dir exists
(async () => {
    try {
        await fs.mkdir(TEMP_LOGS_DIR, { recursive: true });
    } catch (err) {
        console.error("Failed to create temp logs dir:", err);
    }
})();

class LogIngestionService {
    /**
     * Ingest a log entry.
     * @param {Object} data - The log data (session, event, etc.)
     * 
     * Penjelasan Alur Data:
     * Mengapa kita simpan ke Azure Blob / File JSON dulu?
     * -> Supaya performa web utama (Storefront) tidak terbebani oleh operasi tulis ke Database yang berat (High Throughput).
     * -> Log disimpan sementara (Buffer) dalam bentuk file cepat, lalu nanti diproses bulk oleh ETL Service.
     */
    static async logEvent(data) {
        const timestamp = new Date().toISOString();
        const logId = uid(16);
        const logEntry = {
            id: logId,
            timestamp,
            ...data
        };
        const jsonString = JSON.stringify(logEntry);
        const filename = `log_${Date.now()}_${logId}.json`;

        // Strategy: Try Azure first, fallback to Local
        if (containerClient) {
            try {
                const blockBlobClient = containerClient.getBlockBlobClient(filename);
                await blockBlobClient.upload(jsonString, jsonString.length);
                // console.log(`[Azure] Logged event: ${data.event}`);
                return;
            } catch (error) {
                console.error(`[Azure Error] Fallback to local. Reason: ${error.message}`);
            }
        }

        // Fallback to local
        try {
            await fs.writeFile(path.join(TEMP_LOGS_DIR, filename), jsonString);
            // console.log(`[Local] Logged event: ${data.event}`);
        } catch (localError) {
            console.error(`[CRITICAL] Failed to log event locally: ${localError.message}`);
        }
    }
}

module.exports = LogIngestionService;
