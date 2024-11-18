const mysql = require('mysql2/promise');
const sqlConfig = require('../sqlConfig');

module.exports = async function (req,res) {
  try {
    const {id} = req.body
    const pool = await mysql.createPool(sqlConfig);
    const [result] = await pool.query('DELETE FROM accounts WHERE id = ?', [id]);

    res.redirect('/home');

  } catch (error) {
    console.error('Error during search:', error);
    throw error;
  }
}