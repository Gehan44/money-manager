require('dotenv').config();

module.exports = {
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "money_manager_schema",
};