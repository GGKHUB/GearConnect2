# Database Setup Guide

## Database Options

The application now supports both **SQL Server** and **SQLite** databases. SQLite is used by default for easy development.

### Option 1: SQLite (Default - No Setup Required)
- **Pros**: No installation required, works immediately
- **Cons**: Single-user, file-based database
- **Use Case**: Development, testing, small deployments

### Option 2: SQL Server (Production Ready)
- **Pros**: Multi-user, enterprise-grade, scalable
- **Cons**: Requires SQL Server installation
- **Use Case**: Production deployments

## Quick Start (SQLite - Default)

No setup required! The application will automatically use SQLite and create a `database.sqlite` file.

## SQL Server Setup

### Prerequisites

1. **Install SQL Server**: Download and install SQL Server Express or Developer Edition
2. **Enable SQL Server Authentication**: Make sure mixed mode authentication is enabled
3. **Create a Database**: Create a database named `CarEnthusiastsDB`

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here

# Database Type (set to 'mssql' for SQL Server)
DB_TYPE=mssql
USE_SQL_SERVER=true

# SQL Server Configuration
DB_NAME=CarEnthusiastsDB
DB_USER=sa
DB_PASSWORD=YourPassword123!
DB_HOST=localhost
DB_PORT=1433
```

## Database Setup

1. **Start SQL Server**: Make sure SQL Server is running
2. **Initialize Database**: Run the following command to create tables:
   ```bash
   npm run init-db
   ```

## Default Configuration

If no `.env` file is provided, the application will use these defaults:
- **Database**: CarEnthusiastsDB
- **Username**: sa
- **Password**: YourPassword123!
- **Host**: localhost
- **Port**: 1433

## Switching from MongoDB

The application has been completely rewritten to use SQL Server with Sequelize ORM instead of MongoDB with Mongoose. All API endpoints remain the same, so the frontend will work without any changes.

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- firstName
- lastName
- bio
- location
- favoriteCarBrand
- profilePicture
- joinDate

### Posts Table
- id (Primary Key)
- userId (Foreign Key to Users)
- caption
- imageUrl
- createdAt

### Likes Table
- id (Primary Key)
- userId (Foreign Key to Users)
- postId (Foreign Key to Posts)
- createdAt

### Comments Table
- id (Primary Key)
- userId (Foreign Key to Users)
- postId (Foreign Key to Posts)
- text
- createdAt

## Troubleshooting

1. **Connection Issues**: Make sure SQL Server is running and accessible
2. **Authentication**: Verify your username and password
3. **Database**: Ensure the database exists and is accessible
4. **Port**: Check if port 1433 is not blocked by firewall
