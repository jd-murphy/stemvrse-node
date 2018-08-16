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
                .attr("data-metadata", topojson.feature(world, world.objects.countries).feature)
                .enter().append("path")
                .attr("d", path);

            svg.selectAll(".symbol")
                .data(videoCoord.features)
                .enter().append("path")
                .attr("class", "symbol")
                .attr("d", path.pointRadius(function(d) { return 10; }))
                .on("mouseover", function() {
                    d3.select(this).style("fill", "magenta");
                    d3.select(this).attr("d", path.pointRadius(function(d) { return 20; }));
                })
                .on("mouseout", function() {
                    d3.select(this).style("fill", "#0fdbff");
                    d3.select(this).attr("d", path.pointRadius(function(d) { return 10; }));
                });


          }
       

       
        //   d3.json("https://unpkg.com/world-atlas@1.1.4/world/110m.json", drawMap)
       
        
    
        
        
    

       
    }); 
   
});

