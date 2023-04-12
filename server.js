if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bcrypt = require('bcrypt')                            // hash the passwords
const passport = require('passport')                        // handle login stuff
const flash = require('express-flash')                      // toast messages for errors
const session = require('express-session')                  // authenticated session handler
const methodOverride = require('method-override')           // allows us to override DELETE to act like POST
const sqlite = require('sqlite3')                           // Used for SQLITE db
const mysql = require('mysql2')                             // Used for MySQL db
const dbCRUD = require('./dbCRUD.js') || false              // Create/Read/Update/Delete operations on DB
const dbSetup = require('./dbSetup.js') || false            // Make sure DB is R/W and latest schema is applied 
const SQLiteStore = require('connect-sqlite3')(session)    // Extend express-session with a file store setup

const dbFile = process.env.DB || './database.sqlite3'
const dbtype = process.env.DBTYPE || 'array'
const salt = process.env.SALT || '$2b$10$ZsnRSR5lEmcRSGtqOUcYi.'  

let users = '';
const userArray = []
let returnTo = ""

// ------------
// DB Setup
// ------------
// Set up based on information storage type. Option: sqlite3, mysql, array
const createPassport = require('./passportConfig')

if(dbtype==='sqlite3') {
    // Ensure DB is setup and accessible with proper schemas applied
    dbSetup.dbInit()
    createPassport.initialize(
        passport,
        email => {
            return dbCRUD.searchUsersByEmail(email)
        },
        id => {
            return dbCRUD.searchUsersById(id)
        }
    )
}
else if(dbtype === 'mysql') {
    console.log('MySQL DB type not implemented')
    process.exit(1)
}
else {
    console.error('Using in-memory Array, changes will not persist')
    createPassport.initialize(
        passport,
        email => userArray.find(user => user.email === email),
        uid => userArray.find(user => user.uid === uid)
    )
}




// ------------
// App Setup
// ------------

app.set('view-engine','ejs');
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    key: 'tic-tac-toe-session',
    secret: process.env.SESSION_SECRET || 'BqnMWoBt82RRKxmeRnrMcGDq6aNTiaUvT3tGSXhzY2Ve4kXu5rpfjR2LFHUQQQaH',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60*60//, // 60s/m * 60m/h = 1 hour
        // sameSite: 'lax'
    },
    store: new SQLiteStore({ db: 'sessions.db', dir: './sessions' })
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(function (req, res, next) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
res.setHeader('Access-Control-Allow-Credentials', true);
next();
});

// ------------
// STATIC PATHS
// ------------
app.use(express.static('public'))

app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))

// ------------
// AUTH REQUIRED
// ------------ 
app.get('/', authTrue, (req, res) => {
    res.render('index.ejs', { user: req.user })
});
// app.post('/', authTrue, (req, res) => res.redirect('/login'));

app.get('/about', (req, res) => res.render('about.ejs'))
app.get('/api', (req, res) => res.status(501).send('Not Yet Implemented. Stay tuned!'))
app.post('/test', (req, res) => res.send(req.body)) 

// ------------
// AUTHENTICATION
// ------------
app.get('/login', authFalse, (req, res) => {
    res.render('login.ejs');
    // returnTo = req.params['origin']
})
app.post('/login', authFalse, passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
        failureMessage: true})
)

// ------------
// REGISTER
// ------------
app.get('/register', authFalse, (req, res) => res.render('register.ejs'))
app.post('/register', authFalse, async (req,res) => {
    try {    
        const passHash = await bcrypt.hash(req.body.password,salt)
        const userDict = {
            uid: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            pass: passHash
        }

        if(dbtype == 'sqlite3') {
            const createUser = await dbCRUD.createUser(userDict.name, userDict.email, userDict.password, userArray)
            if(createUser == true || userArray.length > 0) {
                return res.redirect('/login')
            }
            else if(createUser == false) {
                console.log('CreateUser: Bad')
            }
        }
        else if(dbtype == 'mysql') {
            console.log('Still not implemented')
            return res.redirect('/register')
        }
        else {
            userArray.push(userDict)
            return res.redirect('/login')
        }
    }
    catch(err) {
        console.log("Register Post: " + err)
    }
    req.flash('error', 'Registration Failed')
    return res.redirect('/register')
})

// ------------
// LogOut Handler
// ------------
app.delete('/logout', userLogout)

// ------------
// GAME
// ------------

app.get('/game', authTrue, (req, res) => res.render('game.ejs', { user: req.user }));
app.post('/game', authTrue, (req, res) => {
    res.sendStatus(500);
});

// ------------
// HELPER FUNCTIONS
// ------------

function authTrue(req, res, next) { // Next on Auth: True
    if(req.isAuthenticated()) {
        return next()
    }
    return res.redirect('/login') // origin=' + req.url)
}

function authFalse(req, res, next) { // Next on Auth: False
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }
    return next() 
}

function userLogout(req, res, next) {
    try {
        req.logOut((err) => err ? console.log('User logout') : console.log(err));
        res.clearCookie('connect.sid', { path: '/' });
    }
    catch(err) {
        console.log(err)
    }

    res.redirect('/login');
}

// ------------
// START THE SERVER
// ------------
app.listen(port, () => console.log(`App listening on port ${port}!`))


