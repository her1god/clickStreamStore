const db = require('../config/database');

class ProductModel {
    static async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2),
                image_url VARCHAR(255)
            )
        `;
        await db.execute(sql);
    }

    static async seedData() {
        // Clear existing data for fresh start
        await db.query('TRUNCATE TABLE products');
        
        console.log("Fetching data from FakeStoreAPI...");
        const response = await fetch('https://fakestoreapi.com/products');
        const products = await response.json();

        // Limit to 20 items (standard API response)
        const sql = `INSERT INTO products (name, description, price, image_url) VALUES ?`;
        
        // Map API fields to our Schema
        // API: title, price, description, image
        // ID is auto-increment in our DB, so we ignore API's ID to keep it simple or align if needed. 
        // Let's rely on Auto Inc.
        
        // Convert price to IDR (Roughly x15000)
        const values = products.map(p => [
            p.title, 
            p.description, 
            Math.round(p.price * 15000), 
            p.image
        ]);

        await db.query(sql, [values]);
        console.log(`Seeded ${products.length} products from External API.`);
    }

    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM products');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = ProductModel;
