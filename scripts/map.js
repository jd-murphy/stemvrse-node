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
        var nyc = {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [-74.0060, 40.7128]
            },
            "properties": {
              "name": "New York City"
            }
          }
       
   

        function drawMap(err, world) {
            if (err) throw err
            
            svg.append("path")
              .datum(nyc)
              .attr("d", path);
           
            svg.append("path")
                .datum(graticule.outline)
                .attr("class", "foreground")
                .attr("d", path);
            svg.append("g")
                .selectAll("path")
                .data(topojson.feature(world, world.objects.countries).features)
                .enter().append("path")
                .attr("d", path);
          }
       

       
          d3.json("https://unpkg.com/world-atlas@1.1.4/world/110m.json", drawMap)
       
        
    
        
        
    

       
    }); 
   
});
