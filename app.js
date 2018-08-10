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




app.get('/landing', (req, res)=>{
    res.render('landing');
});



app.get('/home', (req, res) => {
    res.render('home', {
        title: "Home",
        nav: 'nav'
    })
});

app.get('/favorites', (req, res) => {
    res.render('favorites', {
        title: "Favorites",
        nav: 'nav'
    })
});

app.get('/where-in-the-world', (req, res) => {
    res.render('where-in-the-world', {
        title: "Where in the World",
        nav: 'nav'
    })
});

app.get('/researchers', (req, res) => {
    res.render('researchers', {
        title: "Researchers",
        nav: 'nav'
    })
});

app.get('/faqs', (req, res) => {
    res.render('faqs', {
        title: "FAQs",
        nav: 'nav'
    })
});





// this route for account holders (clients only)
app.get('/account', isAccountHolder, (req, res) => {
    res.render('account', {
        title: "Account",
        nav: 'nav'
    })
});











///////////// ADMIN ROUTES //////////////
// app.post('/verify-token', (req, res) => {
//     verifyAdmin(req, res);
//     console.log('hit /verify-token route')
// });


app.get('/admin-home', verifyAdmin, (req, res) => {
    res.render('admin-home', {
        admin: true,
        title: 'Admin | Home',
        nav: 'admin-nav'
    })
});

app.get('/admin-dashboard', verifyAdmin, (req, res) => {
    res.render('admin-dashboard', {
        dashboard: true, // load dashboard.js
        admin: true,
        title: 'Admin | Dashboard',
        nav: 'admin-nav'
    })
});

app.get('/admin-content', verifyAdmin, (req, res) => {
    res.render('admin-content', {
        admin: true,
        title: 'Admin | Content',
        nav: 'admin-nav'
    })
});

app.get('/admin-billing', verifyAdmin, (req, res) => {
    res.render('admin-billing', {
        admin: true,
        title: 'Admin | Billing',
        nav: 'admin-nav'
    })
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
        getClientDataFromFirebase();
        listAllUsers();
    });
    socket.on("deleteAccount", function (username) {  
        console.log("username is " + username)
        deleteAccount(username);
    });
    socket.on("editAccount", function (userInfo) {  
        editAccount(userInfo);
    });
    socket.on("createAccount", function (userInfo) {  
        createAccount(userInfo);
    });
    socket.on("passToken", function (token) {  
        checkToken(token);
        //verifyAdmin(token);//
    });
    socket.on("tokenVerified", function (token) {  
        socket.emit("verified")
        //verifyAdmin(token);//
    });
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



function listAllUsers(nextPageToken) {
    // List batch of users, 1000 at a time.
    admin.auth().listUsers(1000, nextPageToken)
      .then(function(listUsersResult) {
        listUsersResult.users.forEach(function(userRecord) {
          console.log("user", userRecord.toJSON());
          io.emit("onUserData", userRecord)
        });
        if (listUsersResult.pageToken) {
          // List next batch of users.
          listAllUsers(listUsersResult.pageToken)
        }
      })
      .catch(function(error) {
        console.log("Error listing users:", error);
      });
}

  
        



function getClientDataFromFirebase() {
    var db = admin.database();
    var ref = db.ref("clients");
    console.log("getClientDataFromFirebase()");
    ref.on("value", function(snapshot) {
        data = snapshot.val()
        if (data) {
            io.emit('newClientData', JSON.stringify(data));
        } else {
            io.emit('newClientData', null);
        }
    });
}
        


function deleteAccount(username) {
    var db = admin.database();
    var ref = db.ref("clients/" + username);
    console.log("deleteAccount(" + username + ")");
    ref.remove();
}
        


function editAccount(userInfo) {
    var db = admin.database();
    var ref = db.ref("clients/" + userInfo.username); 
    console.log("editAccount(" + userInfo.username + ")"); 
    updatedUserData = { 
            account: userInfo.account,
            email: userInfo.email,
            phone: userInfo.phone
         }
    ref.update(updatedUserData)
}
        


function createAccount(userInfo) {
    var db = admin.database();
    var ref = db.ref("clients/" + userInfo.username); 
    console.log("createAccount(" + userInfo.username + ")");
    updatedUserData = { 
            account: userInfo.account,
            email: userInfo.email,
            phone: userInfo.phone
         }
    ref.set(updatedUserData);
}
        
// function createAdminSecret(email, secret) {
//     console.log("create admin secret...")
//     var db = admin.database();
//     strippedEmail = email.replace(/[^a-z0-9]/,'')
//     console.log("stripped email -> " + strippedEmail)
//     var ref = db.ref("admin/secret/" + strippedEmail); 
//     console.log("createAdminSecret(" + email + ")");
//     ref.set({"secret": secret});
// }
// function getAdminSecret(email) {
//     try {
//         var db = admin.database();
//         strippedEmail = email.replace(/[^a-z0-9]/,'')
//         var ref = db.ref("admin/secret/" + strippedEmail); 
//         console.log("getAdminSecret(" + email + ")");
//         ref.once("value", function(snapshot) {
//             data = snapshot.val()
//             if (data) {
//                 Object.keys(data).forEach(function (retrievedSecret) {
//                     console.log("retrievedSecret ->");
//                     console.log(retrievedSecret)
//                     return {"secret": retrievedSecret};
//                 });
                
//             } else {
//                return {"secret": null};
//             }
//         });
//     } catch (error) {
//         return {"secret": null};
//     }
    
// }
        



function verifyAdmin(req, res, next) {
    console.log("in verifyAdmin(), emit 'verifyToken'...")
    io.emit("verifyToken")

    socket.on('passToken', function(idToken){
        console.log("socket on 'passToken', calling checkToken()")
        checkToken(idToken).then(function(result) {
            console.log("promise resolved!")
            console.log("result -> ")
            console.log(result)
            if (result) {
                console.log("result true! calling next()")
                next();
            } else {
                console.log("result false! redirect to /home")
                res.redirect('/home');
            }
        }, function(err){
            console.log("error in promise resolution...")
            res.redirect('/home');
        })
    })
    
}



function checkToken(idToken) {
    return new Promise(function(resolve, reject){
        try {
            console.log('in checkToken()')
            console.log('idToken ->')
            console.log(idToken)
            admin.auth().verifyIdToken(idToken)
                .then(function(decodedToken) {
                    var uid = decodedToken.uid;
                    var email = decodedToken.email;
                    console.log("uid and email from uath token ->");
                    console.log(uid);
                    console.log(email);
                    var db = admin.database();
                    var ref = db.ref("admin");
                    console.log("get admin emails from firebase");
                    ref.once("value", function(snapshot) {
                        data = snapshot.val()
    
                        Object.keys(data).forEach(function (entry) {
                        
                            if(data[entry].includes(email)) {
                                console.log("Email is in admin list!      VALID!     resolve promise now...")
                                // require('crypto').randomBytes(48, function(err, buffer) {
                                    // var newSecret = buffer.toString('hex');
    
                                    // need to store in firebase! to check in   checkAdminSecret()
                                    // console.log("\n\nCALLING   createAdminSecret()\n\n")
                                    // createAdminSecret(email, newSecret);
                                    resolve(true)
                                    
                                // });
                            } else {
                                console.log("POOOOOOOO email is not valid admin email! ")
                                resolve(false)
                            }
                        });
                    });
                    // ...
                }).catch(function(error) {
                    // Handle error
                    console.log("error validating admin, rejecting");
                    reject("Error")
                });
    
        } catch (error) {
            console.log("error validating admin, rejecting");
            reject("Error")
        }
    }) 
}

// function checkAdminSecret(email, secret) {
//     console.log('Authenticating Admin secret.            [ checkAdminSecret(' + email + ')   (app.js) ]')
//     retrievedSecret = getAdminSecret(email)
//     // check first if null -> return error if null or undefined
//     if (secret === retrievedSecret){
//         console.log("Success, secret is VALID.")
//         return next(); 
//     } else {
//         console.log("failure, secret is NOT VALID.")
//         res.redirect('/home');
//     }
    
// }





function isAccountHolder(req, res, next) {

 // if (user.isAccountHolder) {   // just psuedo code but something like this..
    //     return next();
    // }
    // res.redirect('/home');


    console.log('Authenticating Account Holder status.')
    console.log('For testing and development assume user is Account Holder and return true.')
    return next(); // simply assume user is admin for testing now

}