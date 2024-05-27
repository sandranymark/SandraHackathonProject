import express from 'express';
import session from 'express-session';
import bodyparser from 'body-parser';
import Datastore from 'nedb-promises';
import authorize from './security/authorize.js';
import expressEjsLayouts from 'express-ejs-layouts';

// Create express app
const app = express();

// Set-up database
const db = new Datastore({ filename: 'users.db', autoload: true });

// Setup view engine
app.set('view engine', 'ejs')
app.set('views', 'public');
app.set('layout', './layouts/full-width')


// Middlewares
app.use(session({
    secret: 'de215515a3fc4809be32a96c1a51f809',
    resave: false,
    saveUninitialized: true
}));

app.use(expressEjsLayouts);
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.static('public'));

// Routing
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.post('/login', async (req, res) => {

    const { username, password } = req.body;
    const existingUser = await db.findOne({ username, password });
    
    if(existingUser) {
        req.session.user = existingUser;
        res.redirect('/');
        return;
    }

    res.render('login', {
        title: 'Login',
        error: 'Wrong username or password'
    });
});


app.get('/', authorize(['admin', 'member']), (req, res) => res.render('index', { title: 'Start', user: req.session.user }));

app.get('/register', (req, res) => res.render('register', { title: 'Registration' }));

app.post('/register', async (req, res) => {
    
    const { username, password, confirm_password } = req.body;

    // ... Do validation
    if(password != confirm_password) {
        // ... Password missmatch, return user to register
    }


    // ... Create user
    try {
        const user = await db.insert({ username, password, role: 'member' })
        req.session.user = user;
        res.redirect('/');
    } catch(error) {
        console.error(error);
    }
});

app.get('/foobar', authorize('admin'), (req, res) => res.render('foobar', { title: 'Admin-only page', user: req.session.user }));

app.get('/forbidden', (req, res) => res.render('forbidden', { title: 'Forbidden' }));

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(8000, () => console.log('Listening on port: 8000'));