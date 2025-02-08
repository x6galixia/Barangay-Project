require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const passport = require("passport");
const cors = require("cors");
const session = require("express-session");
const flash = require("express-flash");
const compression = require("compression");

//-------DATABASES IMPORTING-------//
const mPool = require("./models/mDatabase");

//-------ROUTES--------//
const homeRouter = require("./routes/home/home");
const archiveRouter = require("./routes/archive/archive");
const inventoryRouter = require("./routes/inventory/inventory");
const residentsRouter = require("./routes/residents/residents");
const servicesRouter = require("./routes/services/services");
const statisticsRouter = require("./routes/statistics/statistics");
const officialsRouter = require("./routes/officials/officials");
const csvDataRouter = require("./routes/data/data");

//-------CONNECTING TO DATABASE-------//
mPool.connect()
    .catch((err) => {
        // Handle error but without logging for debugging purposes
        console.error("Database connection error:", err.message);
    });

//-------INITIALIZING VIEW ENGINE AND PATH------//
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use("/uploads", express.static('uploads'));

//-------MIDDLEWARE CONFIGURATION-------//
app.use(compression());

// CORS middleware
app.use(cors({
    origin: '*',
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
}));

// Handle preflight (OPTIONS) requests
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight response for 1 day
        return res.status(200).end();
    }
    next();
});

// Express body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
    },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//------INITIALIZE ROUTES------//
app.use("/home", homeRouter);
app.use("/residents", residentsRouter);
app.use('/inventory', inventoryRouter);
app.use('/archive', archiveRouter);
app.use("/services", servicesRouter);
app.use("/statistics", statisticsRouter);
app.use("/officials", officialsRouter);
app.use("/csvData", csvDataRouter);

app.get("/", (req, res) => res.redirect("/home/dashboard"));

app.use((req, res) => {
    res.status(404).render('404', { title: '404 Not Found' });
});

app.use((err, req, res, next) => {
    res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`SERVER IS RUNNING DON'T CLOSE THIS WINDOW!!!`);
});