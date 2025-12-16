const db = require('../config/database');

class AnalyticsModel {
    static async createTable() {
        // Create table if not exists with new columns
        const sql = `
            CREATE TABLE IF NOT EXISTS product_analytics (
                product_id INT PRIMARY KEY,
                view_count INT DEFAULT 0,
                cart_count INT DEFAULT 0,
                purchase_count INT DEFAULT 0
            )
        `;
        await db.query(sql);
        
        // Alter table for existing setup (safe fallback)
        try {
            await db.query("ALTER TABLE product_analytics ADD COLUMN cart_count INT DEFAULT 0");
            await db.query("ALTER TABLE product_analytics ADD COLUMN purchase_count INT DEFAULT 0");
        } catch (e) {
            // Ignore if columns exist
        }
    }

    static async upsertMetrics(updates) {
        // updates: [{ productId, views, carts, purchases }]
        if (updates.length === 0) return;

        const sql = `
            INSERT INTO product_analytics (product_id, view_count, cart_count, purchase_count)
            VALUES ?
            ON DUPLICATE KEY UPDATE 
                view_count = view_count + VALUES(view_count),
                cart_count = cart_count + VALUES(cart_count),
                purchase_count = purchase_count + VALUES(purchase_count)
        `;

        const values = updates.map(u => [u.productId, u.views || 0, u.carts || 0, u.purchases || 0]);
        await db.query(sql, [values]);
    }

    static async getTopProducts(limit = 100) {
        const sql = `
            SELECT pa.product_id, pa.view_count, pa.cart_count, pa.purchase_count, p.name, p.price, p.image_url
            FROM product_analytics pa
            LEFT JOIN products p ON pa.product_id = p.id
            ORDER BY pa.view_count DESC
            LIMIT ?
        `;
        // Note: This assumes 'products' table exists. 
        // We will define Products model separate.
        // Use query instead of execute for LIMIT compatibility in some mysql versions
        const [rows] = await db.query(sql, [+limit]);
        return rows;
    }
}

module.exports = AnalyticsModel;
