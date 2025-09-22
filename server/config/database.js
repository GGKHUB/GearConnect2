const { Sequelize } = require('sequelize');

// Database configuration - supports both SQL Server and SQLite
const useSQLServer = process.env.USE_SQL_SERVER === 'true' || process.env.DB_TYPE === 'mssql';

let sequelize;

if (useSQLServer) {
  // SQL Server configuration
  sequelize = new Sequelize({
    database: process.env.DB_NAME || 'CarEnthusiastsDB',
    username: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'YourPassword123!',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false, // Set to true if using Azure SQL
        trustServerCertificate: true, // Set to true for local development
        enableArithAbort: true
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false // Set to console.log for SQL queries
  });
} else {
  // SQLite configuration (fallback for development)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });
}

module.exports = sequelize;
