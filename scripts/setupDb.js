const mysql = require('mysql2/promise');
require('dotenv').config();

// Helper to create DB if not exists
async function createDatabaseIfNotExists() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        ssl: { rejectUnauthorized: false } // Azure SSL Requirement
    });
    
    console.log(`Checking database '${process.env.DB_NAME}'...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log("Database secured.");
    await connection.end();
}

(async () => {
    try {
        console.log("Step 1: Preparing Database...");
        await createDatabaseIfNotExists();

        console.log("Step 2: Initializing Tables & Data...");
        // Dynamic require to ensure pool uses the newly created DB
        const ProductModel = require('../src/models/ProductModel');
        const AnalyticsModel = require('../src/models/AnalyticsModel');
        const DailyAnalyticsModel = require('../src/models/DailyAnalyticsModel');

        await ProductModel.createTable();
        await AnalyticsModel.createTable();
        await DailyAnalyticsModel.createTable();
        
        console.log("Tables created successfully.");

        console.log("Step 3: Seeding Data...");
        await ProductModel.seedData();
        console.log("Data seeded successfully.");

        console.log("✅ Database Setup Complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Setup Failed:", error);
        process.exit(1);
    }
})();
