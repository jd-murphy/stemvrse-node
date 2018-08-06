// stemvrse node app 
const express = require('express');
const bodyParser = require('body-parser');
// const fs = require('fs');
const app = express();
const server = require('http').createServer(app);
// const admin = require('firebase-admin');
// const serviceAccount = process.env.SERVICEACCOUNT
const PORT = process.env.PORT || 3000;
// const io = require('socket.io')(server);

// var querystring = require('querystring');
// var https = require('https');
// var path = require('path');
// var request = require("request");

// const config = {
//     "apiKey": process.env.FIREBASEAPIKEY,
//     "authDomain": process.env.AUTHDOMAIN,
//     "databaseURL": process.env.DATABASEURL,
//     "projectId": process.env.PROJECTID,
//     "storageBucket": process.env.STORAGEBUCKET,
//     "messagingSenderId": process.env.MESSAGINGSENDERID,
//     "serviceAccount": process.env.SERVICEACCOUNT 
//   }


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// app.use('/images/', express.static('./images'));


app.get('/', (req, res) => {
    res.send("welcome to stemvrse node app! server is live");
});


app.get('/dashboard', (req, res) => {
    res.send("this is the other page for the node app");
});


// io.on("connection", function (socket) {
//     socket.on("loadLogData", function (notification_request) {
//         getLogDataFromFirebase();
//         getPinDataFromFirebase();
//     });
//     socket.on("loadRaidData", function (notification_request) {  
//         getRaidDataFromFirebase();
//     });
// });


// app.get('/api/bot-report', (req, res) => {
//     io.emit('botAlert', req.query);
//     res.send("/api/bot-report has received your request!");
// });


server.listen(PORT, () => {
    console.log("Listening on port " + PORT);
    // setUpFirebase();
});


// function setUpFirebase() {
//     console.log("setUpFirebase()")
//             admin.initializeApp({
//                 credential: admin.credential.cert(JSON.parse(serviceAccount)),
//                 databaseURL: 'https://twilio-bot-1601d.firebaseio.com/'
//                 });
//             console.log("firebase initialized!");
//         }


// function getLogDataFromFirebase() {
//             var db = admin.database();
//             var ref = db.ref("logs");
//             console.log("getLogDataFromFirebase()");
//             ref.on("value", function(snapshot) {
//                 console.log("SNAPSHOT   getLogDataFromFirebase() ->  ");
//                 data = snapshot.val()
//                 // console.log("snapshot.val()       data ->")
//                 // console.log(data)
//                 io.emit('notify', JSON.stringify(data));
//                 console.log("io.emit notify!!!!      ( app.js )    ->")
//             });
//         }
        
