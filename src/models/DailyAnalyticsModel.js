const db = require('../config/database');

class DailyAnalyticsModel {
    static async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS daily_analytics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE NOT NULL,
                hour INT NOT NULL,
                total_views INT DEFAULT 0,
                UNIQUE KEY unique_slot (date, hour)
            )
        `;
        await db.query(sql);
    }

    static async incrementView(date, hour, count = 1) {
        const sql = `
            INSERT INTO daily_analytics (date, hour, total_views)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE total_views = total_views + VALUES(total_views)
        `;
        await db.query(sql, [date, hour, count]);
    }

    static async getRecentData(limit = 24) {
        // Get last N hours
        const sql = `
            SELECT date, hour, total_views 
            FROM daily_analytics 
            ORDER BY date DESC, hour DESC 
            LIMIT ?
        `;
        const [rows] = await db.query(sql, [+limit]);
        return rows.reverse(); // Return oldest first for charting
    }

    static async reset() {
        await db.query('TRUNCATE TABLE daily_analytics');
        await db.query('TRUNCATE TABLE product_analytics');
        // also clear logs in temp? Maybe not strictly needed but good for "reset".
        // Implementation might vary.
    }
}

module.exports = DailyAnalyticsModel;
