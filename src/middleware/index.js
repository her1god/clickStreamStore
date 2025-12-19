const { uid } = require('uid');
const LogIngestionService = require('../services/LogIngestionService');
const rateLimit = require('express-rate-limit');

// 1. Basic Rate Limiter (Max 100 requests per 15 min per IP)
exports.limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true, 
    legacyHeaders: false,
    message: "Too many requests, please try again later."
});

// 2. Bot Blocker (Tolak user-agent mencurigakan)
exports.blockBots = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    // Block tools like curl, wget, python-requests
    if (/curl|wget|python-requests|Postman/i.test(userAgent)) {
        console.log(`[Security] Blocked Bot: ${userAgent}`);
        return res.status(403).send('Forbidden: Access denied for automated tools.');
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        return next();
    }
    res.redirect('/admin/login');
};

exports.sessionTracker = async (req, res, next) => {
    if (!req.session.guestId) {
        req.session.guestId = `guest_${uid(16)}`;
    }
    
    // Attach helper to log events easily from controllers
    req.logEvent = async (eventName, additionalData = {}) => {
        const payload = {
            sessionId: req.session.guestId,
            userAgent: req.headers['user-agent'],
            event: eventName,
            ...additionalData
        };
        // Async log (fire and forget)
        LogIngestionService.logEvent(payload).catch(console.error);
    };
    
    next();
};
