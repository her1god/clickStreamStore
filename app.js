const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
require('dotenv').config();

const routes = require('./src/routes');
const { sessionTracker } = require('./src/middleware');

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Static Files
app.use(express.static(path.join(__dirname, 'src/public')));

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(session({
    secret: 'secret_key_change_this',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set true if https
}));

// Custom Middleware
app.use(sessionTracker);

// Routes
app.use('/', routes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
