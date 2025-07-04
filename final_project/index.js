const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5001;

// Middleware to parse JSON bodies
app.use(express.json());

// Session middleware ONLY for /customer routes
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// JWT authentication middleware for protected customer routes
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session && req.session.authorization) {
        const token = req.session.authorization.accessToken;

        jwt.verify(token, "access", (err, user) => {
            if (err) {
                return res.status(403).json({ message: "User not authenticated" });
            }
            req.user = user; // Attach user info to request
            next();
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Mount route handlers
app.use("/customer", customer_routes);  // Handles login, register, etc.
app.use("/", genl_routes);              // Handles general public routes

// Start the server
app.listen(PORT, () => console.log("Server is running"));
