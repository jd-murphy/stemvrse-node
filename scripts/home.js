$(document).ready(function(){
    console.log("\n\nTHE SCRIPT WAS LOADED!!!!   (home.js)\n\n")
    var socket = io();
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    socket.on('newVideoData', function (data) {
        console.log("socket.on('newVideoData')");
    
    $("#displayVideos li").remove(); 
    if (data != null) {
        var data = JSON.parse(data); //process notication array
        console.log(data);
    Object.keys(data).forEach(function (video) {
            name = data[video].name
            link = data[video].link
            lname = name.toLowerCase();
            strippedName =  lname.replace(/[^a-z0-9]/g, '')

            dropdownOptions =  '<div class="nav-item dropdown" style="float: right;">' + 
                                     '<a class="nav-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"><span><img src="/assets/glyphicons-49-star-empty.png" width="16px" height="16px"></span></a>' + 
                                     '<div class="dropdown-menu" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(0px, 40px, 0px);">' + 
                                         '<a class="dropdown-item favoriteVideo" data-video-display-name="' + name + '" href="#favoriteVideo' + strippedName + '" id="favoriteVideo' + strippedName + '">Favorite Video</a>' + 
                                     '</div>' + 
                                 '</div>'

             $('#displayVideos').append('<li><div class="card border-info mb-3" id="' + strippedName + '" data-descriptor="video-li" data-video-name="' + name + '" style="max-width: 100rem;">' + 
                     '<div class="card-header"><strong>' + name + dropdownOptions + '</strong></div>' + 
                     '<div class="card-body">' + 
                     ' <h4 class="card-title">Video Info</h4>' + 
                     ' <div width="15rem" height="8.4rem">' + 
                            // '<iframe width="560" height="315" src="' + link + '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' + 
                            '<iframe width="auto" height="auto%" src="' + link + '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' + 
                        '</div>' + 
                         '<p class="card-text"><strong>Name:</strong> ' + name + "<br /><strong>Link:</strong> " + link  + 
                         '<input type="hidden" name="hiddenName' + strippedName + '" id="hiddenName' + strippedName + '" value="' + name + '">' +
                         '<input type="hidden" name="hiddenLink' + strippedName + '" id="hiddenLink' + strippedName + '" value="' + link + '">' +
                         
                     
                 '</div>' + 
                 '</div></li>');
        });
    }
    });

    
    $('#displayVideos').on('click','li div div strong div div a.favoriteVideo', function() {
        videoName = this.id.substring(13);
        var displayName = this.getAttribute('data-video-display-name');
       
        console.log("Adding "  + displayName  + " ("+ videoName + ") to your favorites!");
    
        });
    
   

    console.log("Calling   socket.emit('loadVideos')");
    socket.emit('loadVideos');
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