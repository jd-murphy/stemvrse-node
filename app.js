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
var Promise = require('promise');


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
        home: true,
        title: "Home",
        nav: 'nav'
    })
});

app.get('/favorites', (req, res) => {
    res.render('favorites', {
        favorites: true,
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


app.post('/admin-home', verifyAdmin, (req, res) => {
    res.render('admin-home', {
        admin: true,
        title: 'Admin | Home',
        nav: 'admin-nav'
    })
});

app.post('/admin-dashboard', verifyAdmin, (req, res) => {
    res.render('admin-dashboard', {
        dashboard: true, // load dashboard.js
        admin: true,
        title: 'Admin | Dashboard',
        nav: 'admin-nav'
    })
});

app.post('/admin-content', verifyAdmin, (req, res) => {
    res.render('admin-content', {
        content: true, // load admin-content.js
        admin: true,
        title: 'Admin | Content',
        nav: 'admin-nav'
    })
});

app.post('/admin-billing', verifyAdmin, (req, res) => {
    res.render('admin-billing', {
        admin: true,
        title: 'Admin | Billing',
        nav: 'admin-nav'
    })
});


















app.use(function(req, res, next) {      // check if user is admin or not before linking back to home page!!!!
    res.render('admin-404-notice', {
        title: "Error: 404"
    })
    // return res.status(404).send("Error 404 - Page Not Found");
  });
  
  // 500 - Any server error
app.use(function(err, req, res, next) {      // check if user is admin or not before linking back to home page!!!!
    console.log(err)
    return res.status(500).send("Error 500 - Internal Server Error");
  });














io.on("connection", function (socket) {

    socket.on('room', function(room) {
        strippedRoom = room.replace(/[^a-z0-9]/g, '')
        console.log("joining room " + strippedRoom)
        socket.join(strippedRoom);
    });
    


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
    socket.on("passToken", function (data) {  

       


        idToken = data["token"]

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
                        console.log("Email is in admin list!    store token in firebase");
                        email = email.toLowerCase();
                        email = email.replace(/[^a-z0-9]/g, '')
                        token = idToken
                
                        console.log(email)
                        console.log(token)
                
                        var db = admin.database();
                        var ref = db.ref("tokens/" + email); 
                        console.log("storing token for " + email);
                        ref.set({"token": token});
                        socket.emit("validToken") // emit only to the authenticated user
                        
                            
                    } else {
                        console.log("POOOOOOOO email is not valid admin email! ");
                        socket.emit("invalidToken") // emit only to the authenticated user
                        
                    }
                });
            });
            
           
            // ...
        }).catch(function(error) {
            // Handle error
            console.log("error validating admin, rejecting");
            socket.emit("invalidToken") // emit only to the authenticated user
            
            
        });
        
       

        
    });

    socket.on("loadVideos", function (videoInfo) {
        console.log("socket on loadVideos, app.js")
        console.log("calling getVideoDataFromFirebase()")  
        // getVideoDataFromFirebase();
        var db = admin.database();
        var ref = db.ref("videos");
        console.log("getVideoDataFromFirebase()");
        ref.on("value", function(snapshot) {
            console.log("on value, getVideoDataFromFirebase() snapshot")
            data = snapshot.val()
            if (data) {
                io.emit('newVideoData', JSON.stringify(data));
            } 
            else {
                io.emit('newVideoData', null); 
            }
        });
    });
    socket.on("addVideo", function (videoInfo) {  
        console.log("socket on addVideo, app.js")
        console.log("calling addVideo()")
        addVideo(videoInfo);
    });
    socket.on("deleteVideo", function (videoInfo) {  
        console.log("socket on deleteVideo, app.js")
        console.log("calling deleteVideo()")
        deleteVideo(videoInfo);
    });
    socket.on("getFaves", function(user) {
        console.log("socket on getFaves, app.js")
        console.log("getFaves for " + user)
        var db = admin.database();
        email = user.toLowerCase();
        strippedEmail = email.replace(/[^a-z0-9]/g, '')
        var ref = db.ref("favorites/" + strippedEmail); 
        ref.on("value", function(snapshot) {
            console.log("on value, getFaves(" + strippedEmail + ") snapshot")
            data = snapshot.val()
            if (data) {
                console.log("data exists, data is " + data);
                io.emit('faves', { "user": user, "data": data }); // used to be JSON.stringify(data)
            } 
            else {
                console.log("data is null or undefined, data -> " + data);
                io.emit('faves', { "user": user, "data": null }); 
            }
        });
    });
    socket.on("updateFaves", function(data) {
        user = data["user"]
        faves = data["faves"]
        console.log("socket on updateFaves, app.js")
        console.log("calling updateFaves(" + user + ", " + faves + ")")
       
        updateFaves(user, faves);
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


      listAllUsers();

}



function listAllUsers(nextPageToken) {
    // List batch of users, 1000 at a time.
    admin.auth().listUsers(1000, nextPageToken)
      .then(function(listUsersResult) {
        listUsersResult.users.forEach(function(userRecord) {
        //   console.log("user", userRecord.toJSON());                      // commented out for debugging
        //   setUpSocketIONamespace(userRecord.toJSON());
          io.emit("onUserData", userRecord.toJSON()); // emit to all users
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
            io.emit('newClientData', JSON.stringify(data)); // emit to all users  // possibly security flaw, should emit to only admins
        } else {
            io.emit('newClientData', null); // emit to all users  // possibly security flaw, should emit to only admins
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






// function getVideoDataFromFirebase() {
//     var db = admin.database();
//     var ref = db.ref("videos");
//     console.log("getVideoDataFromFirebase()");
//     ref.on("value", function(snapshot) {
//         console.log("on value, getVideoDataFromFirebase() snapshot")
//         data = snapshot.val()
//         if (data) {
//             io.emit('newVideoData', JSON.stringify(data));
//         } 
//         else {
//             io.emit('newVideoData', null); 
//         }
//     });
// }



        


function addVideo(videoInfo) {
    var db = admin.database();
    name = videoInfo.name.toLowerCase();
    strippedName = name.replace(/[^a-z0-9]/g, '')
    var ref = db.ref("videos/" + strippedName); 
    console.log("addVideo(" + strippedName + ")");
    updatedVideoData = { 
            name: videoInfo.name,
            link: videoInfo.link
         }
    ref.set(updatedVideoData);
}
        


function deleteVideo(videoName) {
    console.log("calling deleteVideo() from app.js")
    var db = admin.database();
    name = videoName.toLowerCase();
    strippedName = name.replace(/[^a-z0-9]/g, '')
    var ref = db.ref("videos/" + strippedName);
    console.log("deleteVideo(" + strippedName + ")");
    ref.remove();
}
        



function updateFaves(user, faves) {
    console.log("hello from update faves...")
    var db = admin.database();
    email = user.toLowerCase();
    strippedEmail = email.replace(/[^a-z0-9]/g, '')
    var ref = db.ref("favorites/" + strippedEmail); 
    console.log("updateFaves(" + email + ")"); 
    console.log(faves);
    ref.set(faves);
}
        



        



function verifyAdmin(err, req, res, next) {
  
        admin.auth().verifyIdToken(req.body.token)
            .then(function(decodedToken) {
                var uid = decodedToken.uid;
                var email = decodedToken.email;
                email = email.toLowerCase();
                strippedEmail = email.replace(/[^a-z0-9]/g, '')
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
                            console.log("Email is in admin list!      VALID!       calling next();");
                            
                                
                        } else {
                            console.log("POOOOOOOO email is not valid admin email! ");
                            res.redirect('/home');
                        }
                    });
                    next();
                });
                
               
                // ...
            }).catch(function(error) {
                // Handle error
                console.log("error validating admin, rejecting");
                res.redirect('/home');
            });
    
}





function isAccountHolder(req, res, next) {

    console.log('Authenticating Account Holder status.')
    console.log('For testing and development assume user is Account Holder and return true.')
    return next(); // simply assume user is admin for testing now

}



// function setUpSocketIONamespace(user) {
//     strippedEmail = user.email.replace(/[^a-z0-9]/g, '')
//     console.log("hello from setUpSocketIONamespace() the user's stripped email is " + strippedEmail);
//     var nspFound = false;
//     Object.keys(io.nsps).forEach(function(k) {
//         console.log(io.nsps[k].name)
        
//         if (strippedEmail == io.nsps[k].name) {
//             nspFound = true;
//         }
//     });
//     if (nspFound) {
//         console.log("Namespace FOUND for user " + strippedEmail)
//     } else {
//         console.log("Namespace NOT FOUND for user " + strippedEmail)

//     }

    
// }