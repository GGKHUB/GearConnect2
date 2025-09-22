const sequelize = require('../config/database');
const { User, Post, Like, Comment } = require('../models');

async function initializeDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('SQL Server connection has been established successfully.');

    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: false }); // Set to true to drop and recreate tables
    console.log('Database tables have been synchronized successfully.');

    console.log('Database initialization completed!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = initializeDatabase;
