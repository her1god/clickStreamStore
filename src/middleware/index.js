const { uid } = require('uid');
const LogIngestionService = require('../services/LogIngestionService');

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

    // Log generic VISIT if strictly needed per page load, 
    // but requirements say "Home or Product Click". 
    // We can handle specific logging in controllers.
    // However, "Setiap kali user membuka halaman Home... sistem harus membuat log".
    // We will do this in the controller.
    
    next();
};
