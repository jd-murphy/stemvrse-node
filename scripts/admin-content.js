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
            name = video.name
            link = video.link
            name = name.toLowerCase();
            strippedName =  name.replace(/[^a-z0-9]/g, '')

            dropdownOptions =  '<div class="nav-item dropdown" style="float: right;">' + 
                                     '<a class="nav-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"><span><img src="/assets/glyphicons-137-cogwheel.png" width="16px" height="16px"></span></a>' + 
                                     '<div class="dropdown-menu" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(0px, 40px, 0px);">' + 
                                         '<a class="dropdown-item deleteVideo" href="#deleteVideo' + name + '" id="deleteVideo' + name + '">Delete Video</a>' + 
                                     '</div>' + 
                                 '</div>'

             $('#displayVideos').append('<li><div class="card border-info mb-3" style="max-width: 100rem;">' + 
                     '<div class="card-header"><strong>' + name + dropdownOptions + '</strong></div>' + 
                     '<div class="card-body">' + 
                     ' <h4 class="card-title">Video Info</h4>' + 
                        ' <li id="' + strippedName + '" data-descriptor="video-li" data-video-name="' + name + '">' + 
                            '<iframe width="560" height="315" src="' + link + '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' + 
                        '</li>' + 
                         '<p class="card-text"><strong>Name:</strong> ' + name + "<br /><strong>Link:</strong> " + link  + 
                         '<input type="hidden" name="hiddenName' + name + '" id="hiddenName' + name + '" value="' + name + '">' +
                         '<input type="hidden" name="hiddenLink' + name + '" id="hiddenLink' + name + '" value="' + link + '">' +
                         
                     
                 '</div>' + 
                 '</div></li>');
        });
    }
    });

    
    $('#displayVideos').on('click','li div div strong div div a.deleteUser', function() {
        videoName = this.id.substring(10);
        $("#modalDataDiv").html("You have chosen to DELETE the video: <strong>" + videoName + "</strong><br />Are you sure you want to follow through with this? <br /><strong>This action is irreversible.</strong>");
        $("#decisionModalButton").html("DELETE");
        $("#modalTitle").html("<strong>Delete Video: " + videoName + "</strong>");
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