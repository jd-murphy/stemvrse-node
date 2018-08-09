// stemvrse node app 
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const admin = require('firebase-admin');
const serviceAccount = process.env.SERVICEACCOUNT
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(server);
var firebase = require('firebase');
require('firebase/auth');
require('firebase/database');

var path = require('path');


var handlebars = require('express-handlebars').create({
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    defaultLayout: 'main',
    extname: '.hbs'
  });
  


const config = {
    "apiKey": process.env.FIREBASEAPIKEY,
    "authDomain": process.env.AUTHDOMAIN,
    "databaseURL": process.env.DATABASEURL,
    "projectId": process.env.PROJECTID,
    "storageBucket": process.env.STORAGEBUCKET,
    "messagingSenderId": process.env.MESSAGINGSENDERID,
    "serviceAccount": process.env.SERVICEACCOUNT 
  }

firebase.initializeApp(config); 



// app.engine('.hbs',  exphbs({extname: '.hbs', defaultLayout: 'main'}));
// app.set('view engine', '.hbs');
// app.set('views', path.join(__dirname, "views"));



app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, "views"));
app.set('scripts', path.join(__dirname, "scripts"));
  





app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets/', express.static('./assets'));
app.use('/scripts/', express.static('./scripts'));



app.get('/', (req, res) => {     
    res.sendFile('login.html',{root: __dirname});
});




app.get('/home', (req, res) => {
    // res.render('home');
    res.render('home', {
        title: "Home",
        nav: 'nav'
    })
    // res.sendFile('home.html',{root: __dirname});
});

app.get('/favorites', (req, res) => {
    // res.render('home');
    res.render('favorites', {
        title: "Favorites",
        nav: 'nav'
    })
    // res.sendFile('home.html',{root: __dirname});
});

app.get('/where-in-the-world', (req, res) => {
    // res.render('home');
    res.render('where-in-the-world', {
        title: "Where in the World",
        nav: 'nav'
    })
    // res.sendFile('home.html',{root: __dirname});
});

app.get('/researchers', (req, res) => {
    // res.render('home');
    res.render('researchers', {
        title: "Researchers",
        nav: 'nav'
    })
    // res.sendFile('home.html',{root: __dirname});
});

app.get('/faqs', (req, res) => {
    // res.render('home');
    res.render('faqs', {
        title: "FAQs",
        nav: 'nav'
    })
    // res.sendFile('home.html',{root: __dirname});
});

app.get('/account', (req, res) => {
    // res.render('home');
    res.render('account', {
        title: "Account",
        nav: 'nav'
    })
    // res.sendFile('home.html',{root: __dirname});
});











///////////// ADMIN ROUTES //////////////

app.get('/admin-home', verifyAdmin, (req, res) => {
    // res.render('dashboard');
    res.render('admin-home', {
        customScripts: false,
        admin: true,
        title: 'Admin | Home',
        nav: 'admin-nav'
    })
    // res.sendFile('index.html',{root: __dirname});
});

app.get('/admin-dashboard', verifyAdmin, (req, res) => {
    // res.render('dashboard');
    res.render('admin-dashboard', {
        customScripts: true,
        admin: true,
        title: 'Admin | Dashboard',
        nav: 'admin-nav'
    })
    // res.sendFile('index.html',{root: __dirname});
});

app.get('/admin-content', verifyAdmin, (req, res) => {
    // res.render('dashboard');
    res.render('admin-content', {
        customScripts: false,
        admin: true,
        title: 'Admin | Content',
        nav: 'admin-nav'
    })
    // res.sendFile('index.html',{root: __dirname});
});

app.get('/admin-billing', verifyAdmin, (req, res) => {
    // res.render('dashboard');
    res.render('admin-billing', {
        customScripts: false,
        admin: true,
        title: 'Admin | Billing',
        nav: 'admin-nav'
    })
    // res.sendFile('index.html',{root: __dirname});
});


















app.use(function(req, res, next) {      // check if user is admin or not before linking back to home page!!!!
    res.render('fourOhFour', {
        title: "Error: 404",
        nav: 'nav'
    })
    // return res.status(404).send("Error 404 - Page Not Found");
  });
  
  // 500 - Any server error
app.use(function(err, req, res, next) {      // check if user is admin or not before linking back to home page!!!!
    return res.status(500).send("Error 500 - Internal Server Error");
  });




io.on("connection", function (socket) {
    socket.on("loadData", function (notification_request) {
        console.log("loadData event from socket.io!");
        getDataFromFirebase();
    });
    socket.on("deleteUser", function (username) {  
        console.log("username is " + username)
        deleteUser(username);
    });
    socket.on("editUser", function (userInfo) {  
        editUser(userInfo);
    });
    socket.on("createUser", function (userInfo) {  
        createUser(userInfo);
    });
    // socket.on("loadRaidData", function (notification_request) {  
    //     getRaidDataFromFirebase();
    // });
});


server.listen(PORT, () => {
    console.log("Listening on port " + PORT);
    setUpFirebase();
});


function setUpFirebase() {
    console.log("setUpFirebase()")
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(serviceAccount)),
                databaseURL: "https://stemvrse-node.firebaseio.com"
            });
            console.log("firebase initialized!");
        }


function getDataFromFirebase() {
    var db = admin.database();
    var ref = db.ref("testdata");
    console.log("getDataFromFirebase()");
    ref.on("value", function(snapshot) {
        data = snapshot.val()
        if (data) {
            io.emit('newData', JSON.stringify(data));
        } else {
            io.emit('newData', null);
        }
    });
}
        


function deleteUser(username) {
    var db = admin.database();
    var ref = db.ref("testdata/" + username);
    console.log("deleteUser(" + username + ")");
    ref.remove();
}
        


function editUser(userInfo) {
    var db = admin.database();
    var ref = db.ref("testdata/" + userInfo.username); 
    console.log("editUser(" + userInfo.username + ")"); 
    updatedUserData = { 
            account: userInfo.account,
            email: userInfo.email,
            phone: userInfo.phone
         }
    ref.update(updatedUserData)
}
        


function createUser(userInfo) {
    var db = admin.database();
    var ref = db.ref("testdata/" + userInfo.username); 
    console.log("createUser(" + userInfo.username + ")");
    updatedUserData = { 
            account: userInfo.account,
            email: userInfo.email,
            phone: userInfo.phone
         }
    ref.set(updatedUserData);
}
        


function verifyAdmin(req, res, next) {

    // if (user.isAdmin) {   // just psuedo code but something like this..
    //     return next();
    // }
    // res.redirect('/home');


    console.log('Authenticating Admin status.')
    console.log('For testing and development assume user is Admin and return true.')
    return next(); // simply assume user is admin for testing now
}