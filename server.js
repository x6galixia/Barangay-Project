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

//-------CONNECTING TO DATABASE-------//
mPool.connect()
    .then(() => console.log("Connected to database"))
    .catch((err) => {
        console.error("Database connection error:", err.message);
        console.error("Stack trace:", err.stack);
    });

//-------INITIALIZING VIEW ENGINE AND PATH------//
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use("/uploads", express.static('uploads'));

//-------MIDDLEWARE CONFIGURATION-------//
app.use(compression());

const allowedOrigins = ['http://localhost:3000','http://192.168.1.2:3000', 'http://192.168.1.9:3000'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
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
app.use("/archive", archiveRouter);
app.use("/inventory", inventoryRouter);
app.use("/residents", residentsRouter);
app.use("/services", servicesRouter);
app.use("/statistics", statisticsRouter);
app.use("/officials", officialsRouter);

app.get("/", (req, res) => res.redirect("/home/dashboard"));

app.use((req, res) => {
    res.status(404).render('404', { title: '404 Not Found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is up and running at port ${PORT}`);
});