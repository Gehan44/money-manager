const mysql = require('mysql2/promise');
const sqlConfig = require('../sqlConfig');

module.exports = async function createUser(req, res) {
    const {user} = req.session;
    const {a_bank, a_number,a_total,a_note } = req.body;

    //if () {
    //    return res.status(400).send('กรุณากรอกให้ครบ: username, password');
    //}

    try {
        const pool = await mysql.createPool(sqlConfig);
        await pool.query(
            'INSERT INTO accounts (user_id, a_bank, a_number, a_total, a_note) VALUES (?, ?, ?, ?, ?)',
            [user.id, a_bank, a_number,a_total,a_note ]
        ); 
        console.log('Account created  successfully');
        res.redirect('/home');

    } catch (error){
        console.error('Error creating account:', error);
        res.status(500).send('An error occurred while creating the account');
    }

};
