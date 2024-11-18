const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const sqlConfig = require('../sqlConfig');

module.exports = async function loginUser(req, res) {
    const { username, password } = req.body;

    try {
        const pool = await mysql.createPool(sqlConfig);
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            const user = rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.user = {
                    id: user.id,
                    username: user.username,
                };
                return res.redirect('/home');
            } else {
                return res.redirect('/');
            }
        } else {
            return res.redirect('/');
        }
    } catch (error) {
        console.error('Error in login:', error);
        return res.redirect('/');
    }
};
