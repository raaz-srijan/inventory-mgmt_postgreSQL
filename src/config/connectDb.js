require("dotenv").config();

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASS,
  port: Number(process.env.POSTGRES_PORT),
  ssl:{
    require:true,
    rejectUnauthorized: false,
  },
});

module.exports = pool;
