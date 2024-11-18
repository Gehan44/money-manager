const mysql = require('mysql2/promise');
const sqlConfig = require('../sqlConfig');

module.exports = async function runDashboard(userData) {
  try {
    const pool = await mysql.createPool(sqlConfig);

    // Query to fetch transactions for the logged-in user
    let script = `
      SELECT * 
      FROM accounts
      WHERE user_id = ?
      ORDER BY id DESC LIMIT 30
    `;

    // Execute the query, binding the userData.id to prevent SQL injection
    const [result] = await pool.query(script, [userData.id]);
    return result;

  } catch (error) {
    console.error('Error during search:', error);
    throw error;
  }
};
