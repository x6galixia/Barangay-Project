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

// Function to reset isPaid
async function resetPaidStatus() {
    try {
        const res = await mPool.query('SELECT reset_isPaid();');
    } catch (err) {
        console.error('Error resetting isPaid:', err);
    }
}

// Check and run missed reset on server startup
async function checkAndRunMissedReset() {
    try {
        const { rows } = await mPool.query("SELECT MAX(lastPaidReset) AS last_reset FROM residents;");
        const lastReset = rows[0]?.last_reset;
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const fourYearsAgo = new Date();
        fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);

        if (!lastReset || new Date(lastReset) < sixMonthsAgo || new Date(lastReset) < fourYearsAgo) {
            await resetPaidStatus();
        } else {
        }
    } catch (err) {
        console.error("Error checking last reset date:", err);
    }
}

// Run check on server startup
checkAndRunMissedReset();

// Schedule reset check every day at midnight
cron.schedule('0 0 * * *', async () => {
    await resetPaidStatus();
});

mPool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
});

module.exports = mPool;