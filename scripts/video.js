// STEM-VRSE Node.js Web App 
// Author: Jordan Murphy - 2018
$(document).ready(function(){
    console.log("\n\nTHE SCRIPT WAS LOADED!!!!   (video.js)\n\n")
    $(document).arrive("#email", {onceOnly: true}, function() {
        console.log("\n\n#email has arrived!!!!\n\n")
        // 'this' refers to the newly created element
        var email = $(this).val();

        var socket = io();
        socket.emit('room', email);
        socket.emit('getFaves', email);
    
       

        socket.on("faves", function(data){
            console.log("socket.on('faves')");
            
            if (data != null) {
            
                user = $("#email").val()
                faves = [];
                console.log("data.user")
                console.log(data.user)
                console.log("user")
                console.log(user)
                console.log("data.data")
                console.log(data.data)
                

                if ((data.user == user) && (data.data != null)) {
                    faves = data.data;
                    console.log("faves -> ")
                    console.log(faves);
                    for (var i = 0; i < faves.length; i++) {
                        $('#favButton' + faves[i]).attr('src', "/assets/favorited.png") // favorited video
                    }
                    localStorage.setItem(user, JSON.stringify(faves));
                } else {
                    console.log("wrong user or null array...");
                }

            
            }
        });

    


        $('.favButton').click(function(e) {

            e.preventDefault();
            console.log("clicked fav button...")
            console.log(this.id);
            videoName = this.id.substring(9);
            var displayName = this.getAttribute('data-video-display-name');
            user = $("#email").val();
            console.log("Adding "  + videoName + " to favorites for " + user);
            try {
                faves = JSON.parse(localStorage.getItem(user));
            } catch (err) {
                faves = null;
            }

            if (faves != null) {
                if (faves.includes(videoName)) {
                    var i = faves.indexOf(videoName);
                    faves.splice(i, 1);
                    $('#favButton' + videoName).attr('src', "/assets/favorite.png") // unfavorited video
                    localStorage.setItem(user, JSON.stringify(faves));
                } else {
                    faves.push(videoName);
                }
            } else {
                localStorage.clear();
                faves = []
                faves.push(videoName);
                localStorage.setItem(user, JSON.stringify(faves));
            }
            console.log("faves");
            console.log(faves);
            socket.emit('updateFaves', {"user": user, "faves": faves});
        });

       
        $.getJSON("/assets/videoCoords.json", function(data) {
            var lat, lng;
            console.log("here is the json -> ");
            for (feature in data.features) {
                console.log(data.features[feature].properties.name)
                console.log(data.features[feature].geometry.coordinates)
                name = data.features[feature].properties.name;
                var video = $("#videoDiv").attr("data-video-name");
                if (name == video) {
                    lat = data.features[feature].geometry.coordinates[1];
                    lng = data.features[feature].geometry.coordinates[0];
                    console.log("lat")
                    console.log(lat)
                    console.log("lng")
                    console.log(lng)
                }
                
               
            }
            var mymap = L.map('mapid').setView([lat, lng], 25);
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoiamRtdXJwaHk1MjEiLCJhIjoiY2psMDg3NWYxMTIzbDNrcWtrdmFybHR6bSJ9.r4UtNU5328E6u70IAsarTQ'
            }).addTo(mymap);
        });
        
       
        
        
    

   
        




    }); 
   
});




