const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

// Pull security validation parameters locally from configuration file environment paths
dotenv.config();

const app = express();

// Activate core system inbound string formatting body-parsers middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Link physical folder architecture tracking vectors directly to client public web directory asset assets
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

/* ==========================================================================
   MYSQL CONNECTIONS CONNECTION POOL DATA ENGINE INITIALIZATION
   ========================================================================== */
const dbPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'homehub_db',
    waitForConnections: true,
    connectionLimit: 12,
    queueLimit: 0
});

// Run an operational trace handshake instantly to confirm local database presence
dbPool.getConnection((err, checkConnection) => {
    if (err) {
        console.error('❌ Database framework system link breakdown exception error:', err.message);
    } else {
        console.log('✅ Connected successfully to homehub_db MySQL engine instance repository.');
        checkConnection.release();
    }
});

/* ==========================================================================
   AUTHENTICATION LOGIC ROUTING GATEWAYS
   ========================================================================== */

// Handle Account Sign-In Validations
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const queryStr = 'SELECT name, email, role FROM users WHERE email = ? AND password = ?';

    dbPool.query(queryStr, [email, password], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Database execution fault." });
        }
        if (results.length > 0) {
            // Return authentic session identity strings back to browser environment layers
            res.status(200).json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: "Mismatching account records context parameters." });
        }
    });
});

// Handle Account Registration Input Dispatches
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    const checkDuplicateStr = 'SELECT id FROM users WHERE email = ?';

    dbPool.query(checkDuplicateStr, [email], (checkError, checkResults) => {
        if (checkError) return res.status(500).json({ success: false, message: "Server database execution tracking crash." });
        
        if (checkResults.length > 0) {
            return res.status(400).json({ success: false, message: "Email identity address registration duplication constraint." });
        }

        const insertQueryStr = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        dbPool.query(insertQueryStr, [name, email, password], (insertError) => {
            if (insertError) return res.status(500).json({ success: false, message: "Failed to persist identity mapping." });
            res.status(201).json({ success: true, message: "Account mapping node initialized." });
        });
    });
});

/* ==========================================================================
   DYNAMIC PROPERTY LOG MARKETPLACE ROUTING INTERFACES
   ========================================================================== */

// Extract properties database entries with multi-parameter filter support
app.get('/api/properties', (req, res) => {
    const { location, type, purpose } = req.query;
    let baseSqlStr = 'SELECT * FROM properties WHERE 1=1';
    let argumentsArray = [];

    if (location) {
        baseSqlStr += ' AND (area_name LIKE ? OR address LIKE ?)';
        argumentsArray.push(`%${location}%`, `%${location}%`);
    }
    if (type) {
        baseSqlStr += ' AND type = ?';
        argumentsArray.push(type);
    }
    if (purpose) {
        baseSqlStr += ' AND purpose = ?';
        argumentsArray.push(purpose);
    }

    baseSqlStr += ' ORDER BY created_at DESC';

    dbPool.query(baseSqlStr, argumentsArray, (error, datasetResults) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to resolve search matrix records." });
        }
        res.status(200).json(datasetResults);
    });
});

// Commit incoming wizard listings data straight to MySQL rows data grids
app.post('/api/properties/add', (req, res) => {
    const { title, address, purpose, type, price, area_sqft, description } = req.body;
    
    // Generate an internal platform sequence parameter key unique token code identifier
    const trackingPropertyCode = 'HH-' + Math.floor(10000 + Math.random() * 90000);
    // Parse values to protect string types
    const parsedAreaName = address.split(',')[1] ? address.split(',')[1].trim() : 'Dhaka';

    const insertStatementStr = `INSERT INTO properties 
        (property_code, title, price, type, purpose, area_sqft, address, area_name, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const bindingParametersArray = [
        trackingPropertyCode, title, parseFloat(price) || 0.00, type, purpose, 
        parseInt(area_sqft) || 0, address, parsedAreaName, description
    ];

    dbPool.query(insertStatementStr, bindingParametersArray, (error) => {
        if (error) {
            console.error(error);
            return res.status(400).send("Database layout persistence constraint mapping breakdown error.");
        }
        // Redirect browser viewport location seamlessly back to updated rentals data grid portfolio view
        res.redirect('/rent.html');
    });
});

/* ==========================================================================
   WEB PLATFORM INSTANCE STARTUP LISTENERS INITIALIZATION
   ========================================================================== */
const APPLICATION_SERVER_PORT = process.env.PORT || 5000;
app.listen(APPLICATION_SERVER_PORT, () => {
    console.log(`🚀 ====================================================================`);
    console.log(`🚀 HomeHub Platform Functional Pipeline Active on Localhost Architecture Grid`);
    console.log(`🚀 Launch Point Web Location Workspace Terminal: http://localhost:${APPLICATION_SERVER_PORT}`);
    console.log(`🚀 ====================================================================`);
});