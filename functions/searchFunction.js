const runDashboard = require('../functions/searchTFunction');
const accountDashboard = require('../functions/searchAFunction');
const mysql = require('mysql2/promise');
const sqlConfig = require('../sqlConfig');

module.exports = async function (req, res) {
  try {
    const userData = req.session.user;
    const { month, year, t_type, account_id, limit } = req.query;

    if (month === '' && year === '' && t_type === '' && account_id === '' && limit === '') {
      const allResults = await runDashboard(userData);
      const allAccounts = await accountDashboard(userData);
      const totalPayPrice = allResults.reduce((sum, transaction) => {
        return transaction.t_type === 'Pay' ? sum + (transaction.t_price || 0) : sum;
      }, 0);
      const totalReceivePrice = allResults.reduce((sum, transaction) => {
        return transaction.t_type === 'Receive' ? sum + (transaction.t_price || 0) : sum;
      }, 0);
      return res.render('home', { 
        userData,
        allResults,
        totalPayPrice,
        totalReceivePrice,
        allAccounts 
      });
    }

    let merch = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userData.id];

    if (month) {
      merch += ' AND MONTH(created_at) = ?';
      params.push(month);
    }
    if (year) {
      merch += ' AND YEAR(created_at) = ?';
      params.push(year);
    }
    if (t_type) {
      merch += ' AND t_type = ?';
      params.push(t_type);
    }
    if (account_id) {
      merch += ' AND account_id = ?';
      params.push(account_id);
    }

    merch += ' ORDER BY created_at DESC';

    if (limit) {
      merch += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const pool = await mysql.createPool(sqlConfig);
    const [allResults] = await pool.query(merch, params);
    const allAccounts = await accountDashboard(userData);
    const totalPayPrice = allResults.reduce((sum, transaction) => {
      return transaction.t_type === 'Pay' ? sum + (transaction.t_price || 0) : sum;
    }, 0);
    const totalReceivePrice = allResults.reduce((sum, transaction) => {
      return transaction.t_type === 'Receive' ? sum + (transaction.t_price || 0) : sum;
    }, 0);

    res.render('home', { 
      userData,
      allResults,
      totalPayPrice,
      totalReceivePrice,
      allAccounts 
    });

  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).send('An error occurred during the search.');
  }
};
