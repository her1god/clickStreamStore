const AnalyticsModel = require('../models/AnalyticsModel');
const ETLService = require('../services/ETLService');

const DailyAnalyticsModel = require('../models/DailyAnalyticsModel');

exports.getLogin = (req, res) => {
    res.render('pages/admin-login', { title: 'Admin Login', error: null });
};

exports.postLogin = (req, res) => {
    const { username, password } = req.body;
    
    // Security Patch: Prevent access if Env Vars are missing or if input is undefined
    const validUser = process.env.ADMIN_USER;
    const validPass = process.env.ADMIN_PASS;

    if (!validUser || !validPass) {
        console.error("SECURITY ALERT: Admin credentials are not set in environment variables!");
        return res.render('pages/admin-login', { title: 'Admin Login', error: 'Server Misconfiguration (Credentials missing)' });
    }

    if (username === validUser && password === validPass) {
        req.session.isAdmin = true;
        return res.redirect('/admin/dashboard');
    }
    res.render('pages/admin-login', { title: 'Admin Login', error: 'Invalid credentials' });
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) console.error("Logout Error:", err);
        res.redirect('/admin/login');
    });
};

const VisitorModel = require('../models/VisitorModel');

exports.getDashboard = async (req, res) => {
    try {
        const topProducts = await AnalyticsModel.getTopProducts();
        let dailyTrends = [];
        let recentVisitors = [];
        let totalVisitors = 0;

        try {
            dailyTrends = await DailyAnalyticsModel.getRecentData();
            recentVisitors = await VisitorModel.getRecentVisitors();
            totalVisitors = await VisitorModel.getTotalUniqueVisitors();
        } catch (e) {
            console.error("Analytics Data Fetch Error:", e);
        }
        
        res.render('pages/admin-dashboard', { 
            title: 'Admin Dashboard', 
            topProducts,
            dailyTrends,
            recentVisitors,
            totalVisitors
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.resetData = async (req, res) => {
    try {
        await DailyAnalyticsModel.reset();
        res.json({ success: true, message: "Analytics Data Reset" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Reset Failed" });
    }
};

exports.runETL = async (req, res) => {
    try {
        const result = await ETLService.runETLJob();
        res.json({ success: true, message: "ETL Job Completed", data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "ETL Failed" });
    }
};
