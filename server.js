const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const passport = require("passport");
const cors = require("cors");
const session = require("express-session");
const flash = require("express-flash");
const compression = require("compression");
const bodyParser = require('body-parser');


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

//-------CONNECTING TO DATABASE-------//
mPool.connect()
    .then(() => console.log("Connected to database"))
    .catch((err) => console.error("Error connecting to database:", err));

//-------INITIALIZING VIEW ENGINE AND PATH------//
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use("/uploads", express.static('uploads'));


//-------MIDDLEWARE CONFIGURATION-------//
app.use(compression());
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//-------CACHE CONTROL-------//
app.use((req, res, next) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    next();
});

//------INITIALIZE ROUTES------//
app.use("/home", homeRouter);
app.use("/archive", archiveRouter);
app.use("/inventory", inventoryRouter);
app.use("/residents", residentsRouter);
app.use("/services", servicesRouter);
app.use("/statistics", statisticsRouter);
app.use("/officials", officialsRouter);

app.get("/", (req, res) => {
    res.redirect("/home/dashboard");
});

//------ERROR HANDLING-------//
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

app.listen(process.env.PORT, () => {
    console.log(`App is up and running at port ${process.env.PORT}`);
});