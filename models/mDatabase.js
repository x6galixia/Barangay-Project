const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

console.log('Database configuration:', {
    connectionString: poolConfig.connectionString,
    ssl: poolConfig.ssl,
});

const mPool = new Pool(poolConfig);

mPool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
});

module.exports = mPool;
