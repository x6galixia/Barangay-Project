const Pool = require('pg').Pool
require('dotenv').config()

const mPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

module.exports = mPool