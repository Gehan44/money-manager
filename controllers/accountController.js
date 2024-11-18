const runDashboard = require('../functions/searchAFunction');

module.exports = async (req, res) => {
    const userData = req.session.user;
    try {
        const allResults = await runDashboard(userData);
        res.render('account', { 
          userData,
          allResults
        });
        
      } catch (error) {
        delete req.session.user;
      }
}