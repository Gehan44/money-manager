const express = require('express');
const session  = require('express-session')
const app = express();
//const ejs = require('ejs');
const sql = require('mysql2');
const sqlConfig = require('./sqlConfig');
const multer = require('multer');
const upload = multer({ 
    dest: 'uploads/',
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
})

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.use(session ({
    secret: 'keyboard bird',
    resave: false,
    saveUninitialized: true,
}))

async function initializeDatabase() {
    try {
        const pool = await sql.createPool(sqlConfig);
        console.log("Connected to the database");
    } catch (err) {
        console.error("Error connecting to the database:", err);
    }
}

initializeDatabase();

// Page Control
const loginController = require('./controllers/loginController');
const registerController = require('./controllers/registerController');
const homeController = require('./controllers/homeController');
const accountController = require('./controllers/accountController');
const logoutController = require('./controllers/logoutController')
const a_formController = require('./controllers/a_formController');
const t_formController = require('./controllers/t_formController');

const registerFunction = require('./models/user');
const a_formFunction = require('./models/accounts');
const t_formFunction = require('./models/transactions');
const a_deleteFunction = require('./functions/a_deleteFunction');
const t_deleteFunction = require('./functions/t_deleteFunction');
const loginUserFunction = require('./functions/loginUserFunction')

const searchFunction = require('./functions/searchFunction')

const middleware = require('./middleware/redirectifAuth')
const usermiddleware = require('./middleware/userMiddleware')

app.get('/',middleware,loginController);
app.post('/login',middleware,loginUserFunction)
app.get('/register',middleware,registerController)
app.post('/register/submit',middleware,registerFunction)
app.get('/logout',logoutController)

app.get('/home',usermiddleware,homeController);
app.get('/account',usermiddleware,accountController);

app.get('/a_form',usermiddleware,a_formController);
app.post('/a_form/submit',usermiddleware,a_formFunction);
app.post('/a_form/delete',usermiddleware,a_deleteFunction);

app.get('/t_form',usermiddleware,t_formController);
app.post('/t_form/submit',usermiddleware,upload.single('t_image'),t_formFunction);
app.post('/t_form/delete',usermiddleware,t_deleteFunction);

app.get('/search',searchFunction)

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
