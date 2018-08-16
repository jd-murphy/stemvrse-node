$(document).ready(function(){
    console.log("\n\nTHE SCRIPT WAS LOADED!!!!   (home.js)\n\n")
    $(document).arrive("#email", {onceOnly: true}, function() {
        console.log("\n\n#email has arrived!!!!\n\n")
        // 'this' refers to the newly created element
        var email = $(this);

        var socket = io();
        socket.emit('room', email);
    
        socket.on('newVideoData', function (data) {
            console.log("socket.on('newVideoData')");
        
            $("#displayVideos li").remove(); 
            if (data != null) {
                // alert("Responsive state: " + responsive_state());
                rs = responsive_state();
                w = 560;
                h = 315;
                cardMaxWidth = 675;
                if (rs == '767px') {
                    w = 280;
                    h = 157.5;
                }

                var data = JSON.parse(data); //process notication array
                console.log(data);
                Object.keys(data).forEach(function (video) {
                        name = data[video].name
                        link = data[video].link
                        lname = name.toLowerCase();
                        strippedName =  lname.replace(/[^a-z0-9]/g, '');

                        $('#displayVideos').append('<li><div class="card border-info mb-3" id="' + strippedName + '" data-descriptor="video-li" data-video-name="' + name + '" style="max-width:' + cardMaxWidth + ';">' + 
                                '<div class="card-header"><strong>' + name + '<a class="favoriteVideo" href="#favoriteVideo' + strippedName + '" id="favoriteVideo' + strippedName + '" style="float: right;">' + '<img id="favButton' + strippedName + '" src="/assets/favorite.png" data-video-display-name="' + name + '" width="16px" height="16px"></a>' + '</strong></div>' + 
                                '<div class="card-body">' + 
                                ' <h4 class="card-title">Video Info</h4>' + 
                                ' <div>' + 
                                        '<iframe width="' + w + '" height="' + h + '" src="' + link + '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' + 
                                    '</div>' + 
                                    '<p class="card-text"><strong>Name:</strong> ' + name + "<br /><strong>Link:</strong> " + link  + 
                                    '<input type="hidden" name="hiddenName' + strippedName + '" id="hiddenName' + strippedName + '" value="' + name + '">' +
                                    '<input type="hidden" name="hiddenLink' + strippedName + '" id="hiddenLink' + strippedName + '" value="' + link + '">' +
                                    
                                
                            '</div>' + 
                            '</div></li>');
                    });
                }
        });

        socket.on("faves", function(data){
            console.log("socket.on('faves')");
            
            if (data != null) {
            
                user = $("#email").val()
                faves = [];
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

    


        $('#displayVideos').on('click','li div div strong a img', function(e) {

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

        
    
        
        
    

        console.log("Calling   socket.emit('loadVideos')");
        socket.emit('loadVideos', {"room": email});

    }); 
   
});



function filterVideos() {
    console.log("running filterVideos()")
    var videoInput = document.getElementById('filterVideosInput')
    var typedName = videoInput.value.toLowerCase();

    var divs = document.querySelectorAll('[data-descriptor=video-li]');
    for (var i = 0; i < divs.length; i++) {

        videoName = divs[i].getAttribute('data-video-name').toLowerCase();
        divID = divs[i].getAttribute('id');
        hideMe = document.getElementById(divID);
        if (videoName.includes(typedName)) {
            console.log(videoName);
            hideMe.parentNode.classList.remove("hideMe");
        } else {
            hideMe.parentNode.classList.add("hideMe");
        }

        
    }
 }

