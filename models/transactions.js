const mysql = require('mysql2/promise');
const sqlConfig = require('../sqlConfig');
const sharp = require('sharp');

module.exports = async function createUser(req, res) {
    const { user } = req.session;
    const { account_id, t_title, t_type, t_price, t_note } = req.body;
    const t_image = req.file;

    try {
        let imageBuffer = null;

        // Process the image only if it exists
        if (t_image) {
            imageBuffer = await sharp(t_image.buffer)
                .resize(400, 400, { fit: 'inside' })
                .jpeg()
                .toBuffer();
        }

        // Create MySQL connection pool
        const pool = await mysql.createPool(sqlConfig);

        // Start a transaction to ensure atomicity
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Build the query dynamically based on available data
            const query = `
                INSERT INTO transactions 
                (account_id, user_id, t_title, t_type, t_price${t_note ? ', t_note' : ''}${t_image ? ', t_image' : ''}) 
                VALUES (?, ?, ?, ?, ?${t_note ? ', ?' : ''}${t_image ? ', ?' : ''})
            `;

            const values = [
                account_id, 
                user.id, 
                t_title, 
                t_type, 
                t_price
            ];

            if (t_note) values.push(t_note);
            if (imageBuffer) values.push(imageBuffer);

            // Insert the transaction
            await connection.query(query, values);

            // Fetch the current account balance
            const [rows] = await connection.query(
                'SELECT a_total FROM accounts WHERE id = ?',
                [account_id]
            );

            if (rows.length === 0) {
                throw new Error('Account not found');
            }

            const currentTotal = rows[0].a_total;
            let updatedTotal;

            // Adjust the account's a_total based on t_type
            if (t_type === 'Pay') {
                updatedTotal = currentTotal - parseFloat(t_price);
            } else if (t_type === 'Receive') {
                updatedTotal = currentTotal + parseFloat(t_price);
            } else {
                throw new Error('Invalid transaction type');
            }

            // Update the account's a_total
            await connection.query(
                'UPDATE accounts SET a_total = ? WHERE id = ?',
                [updatedTotal, account_id]
            );

            // Commit the transaction
            await connection.commit();
            res.redirect('/home');
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).send('An error occurred while processing the transaction');
    }
};
