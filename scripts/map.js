$(document).ready(function(){
    console.log("\n\nTHE SCRIPT WAS LOADED!!!!   (map.js)\n\n")
    $(document).arrive("#email", {onceOnly: true}, function() {
        console.log("\n\n#email has arrived!!!!\n\n")
        // 'this' refers to the newly created element
        var email = $(this).val();

        var socket = io();
        socket.emit('room', email);
    

        const svg = d3.select("svg")
        const myProjection = d3.geoNaturalEarth1()
        const path = d3.geoPath().projection(myProjection)
        const graticule = d3.geoGraticule()
       
       
   
        queue()
            .defer(d3.json, "https://unpkg.com/world-atlas@1.1.4/world/110m.json") //https://github.com/topojson/world-atlas#world/110m.json
            .defer(d3.json, "../assets/videoCoords.json")
            .await(drawMap);


        function drawMap(err, world, videoCoord) {
            if (err) throw err

            
           
            svg.append("path")
                .datum(graticule.outline)
                .attr("class", "foreground")
                .attr("d", path);

            svg.append("g")
                .selectAll("path")
                .data(topojson.feature(world, world.objects.countries).features)
                .enter().append("path")
                .attr("d", path);

            svg.selectAll(".symbol")
                .data(videoCoord.features)
                .enter().append("path")
                .attr("class", "symbol")
                .attr("d", path.pointRadius(function(d) { return 20; }))
                .on("mouseover", function(d) {
                    var x = d3.event.pageX;
                    var y = d3.event.pageY;
                    // var x = d3.mouse(this)[0];
                    // var y = d3.mouse(this)[1];
                    console.log("Coords of mouse ->     x: " + x + "   y: " + y);
                 
                    
                    
                    d3.select(this).style("fill", "#00d8ff");
                    d3.select(this).attr("d", path.pointRadius(function(d) { return 23; }));
                    var nearby = [];
                    var center = d.geometry.coordinates;
                
                    svg.selectAll(".symbol").each(function (c) {
                        neighborCenter = c.geometry.coordinates;
                        // console.log("clicked center: " + center + "    neighbor center: " + neighborCenter);
                        xDiff = Math.abs(center[0] - neighborCenter[0]);
                        yDiff = Math.abs(center[1] - neighborCenter[1]);
                
                        
                        if (xDiff < 10 && yDiff < 10) {
                            // console.log("Distance apart for closest neighbors  x: " + xDiff + "   y: " + yDiff);
                            nearby.push({"name": c.properties.name, "displayName": c.properties.displayName })
                        }
                
                
                    }); 
                    console.log("nearby")
                    console.log(nearby)
                    nearbyLI = ""
                    for (result in nearby) {
                        var li = '<div class="nearbyLI" id="popup' + nearby[result].name + '"><strong>' + nearby[result].displayName + '</strong></div>'
                        nearbyLI += li;
                    }
                    $(".nearbyLI").remove();
                    $("#tooltip ul").append(nearbyLI);

                    var xPosition = x;
                    if (xPosition > 800) {
                        xPosition -= 210;
                    }
                    var yPosition = y;
                    if (yPosition > 500) {
                        yPosition -= 100;
                    }


					d3.select("#tooltip")
						.style("left", (xPosition + 5) + "px")
						.style("top", yPosition + "px")
						// .text("testing text...");


					d3.select("#tooltip").classed("hidden", false);



                    // console.log("here's the d");
                    // console.log(d);
                })
                .on("mouseout", function() {
                    d3.select(this).style("fill", "#16d7f9");
                    d3.select(this).attr("d", path.pointRadius(function(d) { return 20; }));
              
                    // $("#popup").addClass("hideMe")
                    d3.select("#tooltip").classed("hidden", true);


                })
                .on("click", function(d) {
                    var nearby = [];
                    var center = d.geometry.coordinates;
                
                    svg.selectAll(".symbol").each(function (c) {
                        neighborCenter = c.geometry.coordinates;
                        // console.log("clicked center: " + center + "    neighbor center: " + neighborCenter);
                        xDiff = Math.abs(center[0] - neighborCenter[0]);
                        yDiff = Math.abs(center[1] - neighborCenter[1]);
                
                        
                        if (xDiff < 10 && yDiff < 10) {
                            // console.log("Distance apart for closest neighbors  x: " + xDiff + "   y: " + yDiff);
                            nearby.push({"name": c.properties.name, "displayName": c.properties.displayName })
                        }
                
                
                    }); 
                    console.log("nearby")
                    console.log(nearby)
                    
                    // $("#displayVideos li").addClass("hideMe");
                    for (result in nearby) {
                        // $("#displayVideos").append('<div class="nearbyResults" id="' + nearby[result].name + '"><strong>' + nearby[result].displayName + '</strong></div>')
                        console.log("Finding and showing ->  " + nearby[result].name)
                        var video = document.getElementById(nearby[result].name);

                        // var li = video.parentNode
                        console.log("video.classList")
                        console.log(video.classList)
                        video.classList.remove("hideMe");
                    }
                    
                    
                    
                });

           

          }


       

       
      
    
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



                        $('#displayVideos').append('<li class="hideMe"><div class="card border-info mb-3" id="' + strippedName + '" data-descriptor="video-li" data-video-name="' + name + '" style="max-width:' + cardMaxWidth + ';">' + 
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
            socket.emit('getFaves', email);
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
                        // $('#' + faves[i]).parent().removeClass("hideMe");
                    }
                
                    localStorage.setItem(user, JSON.stringify(faves));
                    // $("#noFaves").hide();
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
        // socket.emit('getFaves', email);
       
            

            
    
        
        
    

       
    }); 
   
});

