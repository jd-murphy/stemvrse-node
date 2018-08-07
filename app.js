// stemvrse node app 
const express = require('express');
const bodyParser = require('body-parser');
// const fs = require('fs');
const app = express();
const server = require('http').createServer(app);
const admin = require('firebase-admin');
const serviceAccount = process.env.SERVICEACCOUNT
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(server);

// var querystring = require('querystring');
// var https = require('https');
// var path = require('path');
// var request = require("request");

const config = {
    "apiKey": process.env.FIREBASEAPIKEY,
    "authDomain": process.env.AUTHDOMAIN,
    "databaseURL": process.env.DATABASEURL,
    "projectId": process.env.PROJECTID,
    "storageBucket": process.env.STORAGEBUCKET,
    "messagingSenderId": process.env.MESSAGINGSENDERID,
    "serviceAccount": process.env.SERVICEACCOUNT 
  }

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets/', express.static('./assets'));

app.get('/', (req, res) => {
    res.send("welcome to stemvrse node app! server is live");
});

app.get('/dashboard', (req, res) => {
    console.log("\n\nGET /dashboard \n\n")
    res.sendFile('index.html',{root: __dirname});
});

io.on("connection", function (socket) {
    socket.on("loadData", function (notification_request) {
        console.log("loadData event from socket.io!");
        getDataFromFirebase();
        // getPinDataFromFirebase();
    });
    socket.on("deleteUser", function (username) {  
        console.log("username is " + username)
        deleteUser(username);
    });
    socket.on("editUser", function (userInfo) {  
        editUser(userInfo);
    });
    socket.on("createUser", function (data) {  
        createUser(data);
    });
    // socket.on("loadRaidData", function (notification_request) {  
    //     getRaidDataFromFirebase();
    // });
});


// app.get('/api/bot-report', (req, res) => {
//     io.emit('botAlert', req.query);
//     res.send("/api/bot-report has received your request!");
// });


server.listen(PORT, () => {
    console.log("Listening on port " + PORT);
    setUpFirebase();
    // getDataFromFirebase();
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
        console.log("SNAPSHOT   getDataFromFirebase() ->  ");
        data = snapshot.val()
        console.log("snapshot.val()       data ->")
        console.log(data)
        Object.keys(data).forEach(function (key) {
            // do something with data[key]
            // console.log("key");
            // console.log(key);
            // console.log("data[key]");
            // console.log(data[key]);

        });
        io.emit('newData', JSON.stringify(data));
        console.log("io.emit notify!!!!      ( app.js )    ->")
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
    var ref = db.ref("testdata/" + userInfo); // testing
    console.log("editUser(" + userInfo + ")"); // testing
    // var ref = db.ref("testdata/" + userInfo.username);
    // console.log("editUser(" + userInfo.username + ")");
    updatedUserData = { 
            account: userInfo.account,
            email: userInfo.email,
            phone: userInfo.phone
         }

    ref.update(updatedUserData)
    
    
}
        


function createUser(data) {

    console.log("\n\n\nNOT IMPLEMENTED YET    createUser()\n\n")


    var db = admin.database();
    var ref = db.ref("testdata");
    console.log("getDataFromFirebase()");
    ref.once("value", function(snapshot) {
        console.log("SNAPSHOT   getDataFromFirebase() ->  ");
        data = snapshot.val()
        console.log("snapshot.val()       data ->")
        console.log(data)
        Object.keys(data).forEach(function (key) {
            // do something with data[key]
            // console.log("key");
            // console.log(key);
            // console.log("data[key]");
            // console.log(data[key]);

        });
        io.emit('newData', JSON.stringify(data));
        console.log("io.emit notify!!!!      ( app.js )    ->")
    });
}
        


