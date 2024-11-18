const runDashboard = require('../functions/searchTFunction');
const accountDashboard = require('../functions/searchAFunction');
const mysql = require('mysql2/promise');
const sqlConfig = require('../sqlConfig');

module.exports = async function (req, res) {
  try {
    const userData = req.session.user;
    const { month, year, t_type, account_id, limit } = req.query;

    // If no filters are provided, use the default dashboard data
    if (month === '' && year === '' && t_type === '' && account_id === '' && limit === '') {
      const allResults = await runDashboard(userData);
      const allAccounts = await accountDashboard(userData);
      const totalPayPrice = allResults.reduce((sum, transaction) => {
        return transaction.t_type === 'Pay' ? sum + (transaction.t_price || 0) : sum;
      }, 0);
      const totalReceivePrice = allResults.reduce((sum, transaction) => {
        return transaction.t_type === 'Receive' ? sum + (transaction.t_price || 0) : sum;
      }, 0);
      // Only render once, passing all necessary data
      return res.render('home', { 
        userData,
        allResults,
        totalPayPrice,
        totalReceivePrice,
        allAccounts 
      });
    }

    // Prepare the base SQL query for filtered data
    let merch = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userData.id];

    // Apply filters based on the provided query parameters
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

    // Add ORDER BY clause to the query
    merch += ' ORDER BY created_at DESC';

    // If a limit is specified, apply it
    if (limit) {
      merch += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    // Execute the query with the provided parameters
    const pool = await mysql.createPool(sqlConfig);
    const [allResults] = await pool.query(merch, params);

    // Get the account data
    const allAccounts = await accountDashboard(userData);

    // Calculate the total pay and receive amounts
    const totalPayPrice = allResults.reduce((sum, transaction) => {
      return transaction.t_type === 'Pay' ? sum + (transaction.t_price || 0) : sum;
    }, 0);
    const totalReceivePrice = allResults.reduce((sum, transaction) => {
      return transaction.t_type === 'Receive' ? sum + (transaction.t_price || 0) : sum;
    }, 0);

    // Render the view with the filtered data
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
