const runDashboard = require('../functions/searchTFunction');
const accountDashboard = require('../functions/searchAFunction');

module.exports = async (req, res) => {
    const userData = req.session.user;
    try {
        const allResults = await runDashboard(userData);
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
          allAccounts });
        
      } catch (error) {
        delete req.session.user;
      }
}