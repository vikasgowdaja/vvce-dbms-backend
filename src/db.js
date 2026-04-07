const mysql = require("mysql2/promise");
const path  = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const poolConfig = (database) => ({
  host:             process.env.DB_HOST || "localhost",
  port:             parseInt(process.env.DB_PORT || "3306", 10),
  user:             process.env.DB_USER || "root",
  password:         process.env.DB_PASS || "root",
  database,
  waitForConnections: true,
  connectionLimit:  10,
  decimalNumbers:   true,
});

const amazonPool  = mysql.createPool(poolConfig(process.env.DB_AMAZON  || "amazon_db"));
const netflixPool = mysql.createPool(poolConfig(process.env.DB_NETFLIX || "netflix_db"));
const spotifyPool = mysql.createPool(poolConfig(process.env.DB_SPOTIFY || "spotify_db"));

module.exports = { amazonPool, netflixPool, spotifyPool };
