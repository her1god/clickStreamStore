const db = require('../config/database');

class VisitorModel {
    static async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS visitor_sessions (
                session_id VARCHAR(255) PRIMARY KEY,
                first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                total_visits INT DEFAULT 1,
                user_agent TEXT
            )
        `;
        await db.query(sql);
    }

    static async upsertSession(sessionId, userAgent, timestamp) {
        // Simple logic: if exists, update last_seen and increment total_visits
        const sql = `
            INSERT INTO visitor_sessions (session_id, user_agent, last_seen, total_visits)
            VALUES (?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE 
            last_seen = VALUES(last_seen),
            total_visits = total_visits + 1
        `;
        const date = new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
        await db.query(sql, [sessionId, userAgent, date]);
    }

    static async getRecentVisitors(limit = 10) {
        const sql = `SELECT * FROM visitor_sessions ORDER BY last_seen DESC LIMIT ?`;
        const [rows] = await db.query(sql, [limit]);
        return rows;
    }

    static async getTotalUniqueVisitors() {
        const sql = `SELECT COUNT(*) as count FROM visitor_sessions`;
        const [rows] = await db.query(sql);
        return rows[0].count;
    }
}

module.exports = VisitorModel;
