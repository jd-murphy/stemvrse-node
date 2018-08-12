$(document).ready(function(){
    console.log("\n\nTHE SCRIPT WAS LOADED!!!!   (admin-dashboard.js)\n\n")
    var socket = io();
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    socket.on('newVideoData', function (data) {
    
    $("#displayVideos li").remove(); 
    if (data != null) {
        var data = JSON.parse(data); //process notication array

     Object.keys(data).forEach(function (video) {
            name = video.name
            link = video.link
             
             dropdownOptions =  '<div class="nav-item dropdown" style="float: right;">' + 
                                     '<a class="nav-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"><span><img src="/assets/glyphicons-137-cogwheel.png" width="16px" height="16px"></span></a>' + 
                                     '<div class="dropdown-menu" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(0px, 40px, 0px);">' + 
                                         '<a class="dropdown-item editVideo" href="#editVideo' + name + '" id="editVideo' + name + '">Edit Video</a>' + 
                                         '<a class="dropdown-item deleteVideo" href="#deleteVideo' + name + '" id="deleteVideo' + name + '">Delete Video</a>' + 
                                     '</div>' + 
                                 '</div>'

             $('#displayData').append('<div class="card border-info mb-3" style="max-width: 100rem;">' + 
                     '<div class="card-header"><strong>' + name + dropdownOptions + '</strong></div>' + 
                     '<div class="card-body">' + 
                     ' <h4 class="card-title">Video Info</h4>' + 
                        ' <li id="' +  + '" data-descriptor="video-li" data-video-name="' +  + '">' + 
                            '<iframe width="560" height="315" src="' +  + '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' + 
                        '</li>' + 
                         '<p class="card-text"><strong>Name:</strong> ' + name + "<br /><strong>Link:</strong> " + link  + 
                         '<input type="hidden" name="hiddenName' + name + '" id="hiddenName' + name + '" value="' + name + '">' +
                         '<input type="hidden" name="hiddenLink' + name + '" id="hiddenLink' + name + '" value="' + link + '">' +
                         
                     
                 '</div>' + 
                 '</div>');
        });
    }
    });

    $("#submitAddNewVideoModal").on('click', function() {
        name = $('#addNewVideoModal-name').val()
        link = $('#addNewVideoModal-link').val();
        
        userInfo = {
            "name": name,
            "link": link,
           
        } 
        $("#addNewVideoModal").modal('hide');
        socket.emit('addVideo', userInfo);
        cleanseNewVideoModal();
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
            hideMe.classList.remove("hideMe");
        } else {
            hideMe.classList.add("hideMe")
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