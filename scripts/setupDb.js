const db = require('../src/config/database');
const ProductModel = require('../src/models/ProductModel');
const AnalyticsModel = require('../src/models/AnalyticsModel');

(async () => {
    try {
        console.log("Initializing Database...");
        await ProductModel.createTable();
        await AnalyticsModel.createTable();
        
        // Dynamic Requirement
        const DailyAnalyticsModel = require('../src/models/DailyAnalyticsModel');
        await DailyAnalyticsModel.createTable();
        
        console.log("Tables created.");

        console.log("Seeding Data...");
        await ProductModel.seedData();
        console.log("Data seeded.");

        console.log("Database Setup Complete.");
        process.exit(0);
    } catch (error) {
        console.error("Setup Failed:", error);
        process.exit(1);
    }
})();
