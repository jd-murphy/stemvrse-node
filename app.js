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
// app.use('/images/', express.static('./images'));


app.get('/', (req, res) => {
    res.send("welcome to stemvrse node app! server is live");
});


app.get('/dashboard', (req, res) => {
    getDataFromFirebase().then(function(result){
        res.sendFile('index.html',{root: __dirname});
    });
});


io.on("connection", function (socket) {
    socket.on("loadData", function (notification_request) {
        console.log("loadData event from socket.io!");
        // getLogDataFromFirebase();
        // getPinDataFromFirebase();
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
    return new Promise(function(resolve, reject) {
        var db = admin.database();
        var ref = db.ref("testdata");
        console.log("getLogDataFromFirebase()");
        ref.on("value", function(snapshot) {
            console.log("SNAPSHOT   getDataFromFirebase() ->  ");
            data = snapshot.val()
            console.log("snapshot.val()       data ->")
            console.log(data)
            Object.keys(data).forEach(function (key) {
                // do something with data[key]
                console.log("key");
                console.log(key);
                console.log("data[key]");
                console.log(data[key]);

            });
            resolve(JSON.stringify(data));
            io.emit('newData', JSON.stringify(data));
            console.log("io.emit notify!!!!      ( app.js )    ->")
        });
    });
}
        
