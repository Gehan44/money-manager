const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const sqlConfig = require('../sqlConfig');

module.exports = async function createUser(req, res) {
    const { username, password } = req.body;

    //if (!username || !password) {
    //    return res.status(400).send('กรุณากรอกให้ครบ: username, password');
    //}
    //if (password.length < 8) {
    //    return res.status(400).send('รหัสต้องมากกว่า 8 ตัว');
    //}

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await mysql.createPool(sqlConfig);
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            await pool.query(
                'UPDATE users SET password = ? WHERE username = ?',
                [hashedPassword, username]
            );
            console.log('User updated successfully');
        } else {
            await pool.query(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username, hashedPassword]
            );
            console.log('User created successfully');
        }

        res.status(200).send('User created or updated successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('An error occurred while creating the user');
    }
};
