$(document).ready(function(){
    console.log("\n\nTHE SCRIPT WAS LOADED!!!!   (home.js)\n\n")
    var socket = io();
    
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
                    strippedName =  lname.replace(/[^a-z0-9]/g, '')

                    // dropdownOptions =  '<div class="nav-item dropdown" style="float: right;">' + 
                    //                         '<a class="nav-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"><span><img src="/assets/favorite.png" width="16px" height="16px"></span></a>' + 
                    //                         '<div class="dropdown-menu" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(0px, 40px, 0px);">' + 
                    //                             '<a class="dropdown-item favoriteVideo" data-video-display-name="' + name + '" href="#favoriteVideo' + strippedName + '" id="favoriteVideo' + strippedName + '">Favorite Video</a>' + 
                    //                         '</div>' + 
                    //                     '</div>'

                    $('#displayVideos').append('<li><div class="card border-info mb-3" id="' + strippedName + '" data-descriptor="video-li" data-video-name="' + name + '" style="max-width:' + cardMaxWidth + ';">' + 
                            '<div class="card-header"><strong>' + name + '<a class="favoriteVideo" href="#" id="favoriteVideo' + strippedName + '" style="float: right;">' + '<img id="favButton' + strippedName + '" src="/assets/favorite.png" data-video-display-name="' + name + '" width="16px" height="16px"></a>' + '</strong></div>' + 
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

            var data = JSON.parse(data); //process notication array
            console.log(data);
            faves = []
            Object.keys(data).forEach(function (fav) {
                    console.log("fav -> " + fav);
                    faves.append(fav);
            });
            user = $("#email").val()
            localStorage.setItem(user, JSON.stringify(faves));
        }
    });

    $('#displayVideos').on('click','li div div strong a img', function(e) {
        // clientUserName = this.id.substring(8);
        // $("#modalDataDiv").html("You have chosen to EDIT the user: <strong>" + clientUserName + "</strong>");
        // $("#decisionModalButton").html("EDIT");
        // $("#modalTitle").html("<strong>Edit User: " + clientUserName + "</strong>");
        // $("#decisionModalButton").removeClass("btn-outline-danger");
        // $("#decisionModalButton").addClass("btn-outline-success");
        // document.getElementById('hiddenUsername').value = clientUserName;
        // $("#modalDialog").modal();

        e.preventDefault();
        console.log("clicked fav button...")
        console.log(this.id);
        videoName = this.id.substring(9);
        var displayName = this.getAttribute('data-video-display-name');
        user = $("#email").val();
        console.log("Adding "  + displayName  + " ("+ videoName + ") to you favorites for user " + user + "!");
        faves = JSON.parse(localStorage.getItem(user));
        console.log("Here is the faves array retrieved from localstorage -> ");
        console.log("faves before ");
        console.log(faves);
        if (faves != null) {
            if (faves.includes(videoName)) {
                faves.remove(videoName);
            } else {
                faves.push(videoName);
            }
        } else {
            faves = []
            faves.push(videoName);
        }
        console.log("faves after ");
        console.log(faves);
        socket.emit('updateFaves', {"user": user, "faves": faves});
    });

    
  
    
    
   

    console.log("Calling   socket.emit('loadVideos')");
    socket.emit('loadVideos');
    user = $("#email").val()
    // console.log("Calling   socket.emit('getFaves')  for user  " + user);
    // socket.emit('getFaves', user);



    
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


function addNewVideo() {
    cleanseNewVideoModal();
    $("#addNewVideoModal").modal();
}
function cleanseNewVideoModal(){
    $('#addNewVideoModal-name').val("");
    $('#addNewVideoModal-link').val("");
}
// function faveMe(e, element, socket) {
//     e.preventDefault();
//     console.log("clicked fav button...")
//     console.log(element.id);
//     videoName = element.id.substring(9);
//     var displayName = element.getAttribute('data-video-display-name');
//     user = $("#email").val();
//     console.log("Adding "  + displayName  + " ("+ videoName + ") to you favorites for user " + user + "!");
//     faves = JSON.parse(localStorage.getItem(user));
//     console.log("Here is the faves array retrieved from localstorage -> ");
//     console.log("faves before ");
//     console.log(faves);
//     if (faves != null) {
//         if (faves.includes(videoName)) {
//             faves.remove(videoName);
//         } else {
//             faves.push(videoName);
//         }
//     } else {
//         faves = []
//         faves.push(videoName);
//     }
//     console.log("faves after ");
//     console.log(faves);
//     socket.emit('updateFaves', {"user": user, "faves": faves});
// }      //called so -> onclick="faveMe(event,this,socket);"