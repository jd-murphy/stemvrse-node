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
        var detectionRadius = 25;
       
   
        queue()
            .defer(d3.json, "https://unpkg.com/world-atlas@1.1.4/world/110m.json")
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
                // .on("mouseover", function(d) {
                //     d3.select(this).style("fill", "#0092ac");
                //     d3.select(this).attr("d", path.pointRadius(function(d) { return 23; }));
            
                //     console.log(d.properties.name);
                // })
                // .on("mouseout", function() {
                //     d3.select(this).style("fill", "#0fdbff");
                //     d3.select(this).attr("d", path.pointRadius(function(d) { return 20; }));
                // });
                .on("click", function(d) {
                    var nearby = [],
                        mc = d3.mouse(this),
                        c1 = {cx: mc[0], cy: mc[1], r: detectionRadius };
                    
                    svg.selectAll(".symbol").each(function () {
                        var c2 = {cx: +this.getAttribute("cx"),
                                        cy: +this.getAttribute("cy"),
                                        r: +this.getAttribute("r")};
                                if (circleOverlapQ(c1, c2))
                                    nearby.push(d.properties.name);
                    }); // each
                    
                    if (nearby.length)
                        alert("These shapes are within click radius: " + nearby.join(", "));
                    else alert("No shapes within click radius.");
                    
                });

           

          }
       

       
        //   d3.json("https://unpkg.com/world-atlas@1.1.4/world/110m.json", drawMap)
       
            // var detectionRadius = 25;

            // var svg = d3.select("body").append("svg:svg")
            //     .attr("width", 500)
            //     .attr("height", 500)
            //     .style("padding", "5px")
            //     .on("mousemove", findshapes)
            //     .on("click", function() {
            //         var nearby = [],
            //             mc = d3.mouse(this),
            //             c1 = {cx: mc[0], cy: mc[1], r: detectionRadius };
                    
            //         svg.selectAll(".detectable").each(function () {
            //             switch (this.nodeName) {
            //                 case "circle":
            //                     var c2 = {cx: +this.getAttribute("cx"),
            //                             cy: +this.getAttribute("cy"),
            //                             r: +this.getAttribute("r")};
            //                     if (circleOverlapQ(c1, c2))
            //                         nearby.push(this.id);
            //                     break;

            //                 default:
            //                     alert("shape not supported");
            //             }            
            //         }); // each
                    
            //         if (nearby.length)
            //             alert("These shapes are within click radius: " + nearby.join(", "));
            //         else alert("No shapes within click radius.");
                    
            //     });

            
    
        
        
    

       
    }); 
   
});

function circleOverlapQ (c1, c2) {
    var distance = Math.sqrt(
        Math.pow(c2.cx - c1.cx, 2) + 
        Math.pow(c2.cy - c1.cy, 2)
    );
    if (distance < (c1.r + c2.r)) {
        return true;
    } else {
        return false;
    }
}

function findshapes() {
    var mouseCoords = d3.mouse(this);
    mv.attr("cx", mouseCoords[0] )
      .attr("cy", mouseCoords[1] );
}
