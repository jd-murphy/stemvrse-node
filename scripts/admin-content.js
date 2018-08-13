$(document).ready(function(){
    console.log("\n\nTHE SCRIPT WAS LOADED!!!!   (admin-dashboard.js)\n\n")
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
                                     '<a class="nav-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"><span><img src="/assets/glyphicons-137-cogwheel.png" width="16px" height="16px"></span></a>' + 
                                     '<div class="dropdown-menu" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(0px, 40px, 0px);">' + 
                                         '<a class="dropdown-item deleteVideo" data-video-display-name="' + name + '" href="#deleteVideo' + strippedName + '" id="deleteVideo' + strippedName + '">Delete Video</a>' + 
                                     '</div>' + 
                                 '</div>'

             $('#displayVideos').append('<li><div class="card border-info mb-3" id="' + strippedName + '" data-descriptor="video-li" data-video-name="' + name + '" style="max-width: 100rem;">' + 
                     '<div class="card-header"><strong>' + name + dropdownOptions + '</strong></div>' + 
                     '<div class="card-body">' + 
                     ' <h4 class="card-title">Video Info</h4>' + 
                     ' <div width="10rem" height="5.6rem">' + 
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

    
    $('#displayVideos').on('click','li div div strong div div a.deleteVideo', function() {
        videoName = this.id.substring(11);
        var displayName = this.getAttribute('data-video-display-name');
        $("#modalDataDiv").html("You have chosen to DELETE the video: <strong>" + displayName + "</strong><br />Are you sure you want to follow through with this? <br /><strong>This action is irreversible.</strong>");
        $("#decisionModalButton").html("DELETE");
        $("#modalTitle").html("<strong>Delete Video: " + displayName + "</strong>");
        $("#decisionModalButton").removeClass("btn-outline-success");
        $("#decisionModalButton").addClass("btn-outline-danger");
        document.getElementById('hiddenVideoName').value = videoName;
        $("#modalDialog").modal()
    
        });
    
    $("#decisionModalButton").on('click', function() {
        action = $("#decisionModalButton").text();
        name = $('#hiddenVideoName').val();
        switch (action) {
            case "DELETE":
                socket.emit('deleteVideo', name);
                $("#modalDialog").modal('hide');
                break;
            default:
                $("#modalDialog").modal('hide');    
                alert("switch default.... something went wrong... ");
                
        }
        });
    
    
    $("#submitAddNewVideoModal").on('click', function() {
            name = $('#addNewVideoModal-name').val()
            link = $('#addNewVideoModal-link').val();
            
            videoInfo = {
                "name": name,
                "link": link
            } 
            $("#addNewVideoModal").modal('hide');
            socket.emit('addVideo', videoInfo);
            cleanseNewVideoModal();
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