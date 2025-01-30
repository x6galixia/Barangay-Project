const cron = require('node-cron');
const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

const mPool = new Pool(poolConfig);

// Function to reset isPaid and log the last reset date
async function resetPaidStatus() {
    try {
        const res = await mPool.query('SELECT reset_isPaid_nonResidents();');
        console.log(`Reset isPaid for non-residents: ${res.rowCount} rows updated.`);
    } catch (err) {
        console.error('Error resetting isPaid:', err);
    }
}

// Check if the last reset was missed when the server starts
async function checkAndRunMissedReset() {
    try {
        const { rows } = await mPool.query("SELECT MAX(lastPaidReset) AS last_reset FROM residents;");
        const lastReset = rows[0]?.last_reset;

        const today = new Date();
        const firstOfJanuary = new Date(today.getFullYear(), 0, 1);

        if (!lastReset || new Date(lastReset) < firstOfJanuary) {
            console.log("Missed reset detected! Running reset now...");
            await resetPaidStatus();
        } else {
            console.log("Reset already performed this year. No action needed.");
        }
    } catch (err) {
        console.error("Error checking last reset date:", err);
    }
}

// Run check on server startup
checkAndRunMissedReset();

// Schedule yearly reset on January 1st at midnight
cron.schedule('0 0 1 1 *', async () => {
    await resetPaidStatus();
});

mPool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
});

module.exports = mPool;
