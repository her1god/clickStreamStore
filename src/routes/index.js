const express = require('express');
const router = express.Router();

const StoreController = require('../controllers/StoreController');
const AdminController = require('../controllers/AdminController');
const AuthController = require('../controllers/AdminController'); // Shared in AdminController for simplicity
const middleware = require('../middleware');

// Config session middleware specific for Admin is handled in app.js or here?
// Usually app.js handles global session. Middleware handles checks.

// Guest Routes
router.get('/', StoreController.getHome);
router.get('/product/:id', StoreController.getProductDetail);
router.post('/api/log', StoreController.logEvent);

// Admin Auth Routes
router.get('/admin/login', AdminController.getLogin);
router.post('/admin/login', AdminController.postLogin);
router.get('/admin/logout', AdminController.logout);

// Admin Secure Routes
router.use('/admin', middleware.isAdmin);
router.get('/admin/dashboard', AdminController.getDashboard);
router.post('/admin/run-etl', AdminController.runETL);
router.post('/admin/reset-data', AdminController.resetData);

module.exports = router;
