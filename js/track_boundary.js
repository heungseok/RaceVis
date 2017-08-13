/**
 * Created by totor on 2017-08-13.
 */

var inline_track=[], outline_track=[];

function draw_trackBoundary(){

    // file load
    d3.csv("./data/track_boundary/kic_short_boundary_sampled.csv", function(error, data) {
        console.log(data);

        data.forEach(function(d){

            inline_track.push({
                long: parseFloat(d["InLat"]),
                lat: parseFloat(d["InLon"])
            });

            outline_track.push({
                long: parseFloat(d["OutLat"]),
                lat: parseFloat(d["OutLon"])
            })

        });

        // range of track x, y (Longitude, Latitude) setting
        track_boundary_x = d3.scaleLinear().range([0, track_width])
            .domain([
                d3.min(inline_track, function(d) { return d.long;}),
                d3.max(inline_track, function(d) {return d.long;})
            ]);
        track_boundary_y = d3.scaleLinear().range([track_height, 0])
            .domain([
                d3.min(inline_track, function(d) {return d.lat;}),
                d3.max(inline_track, function(d) {return d.lat;})
            ]);

        // append path (drawing inline track line )
        track_svg.append("path")
            .data([inline_track])
            .attr("class", "line boundary inline")
            .attr("d", track_boundary_line)

        // range of track x, y (Longitude, Latitude) setting
        track_boundary_x = d3.scaleLinear().range([0, track_width])
            .domain([
                d3.min(outline_track, function(d) { return d.long;}),
                d3.max(outline_track, function(d) {return d.long;})
            ]);
        track_boundary_y = d3.scaleLinear().range([track_height, 0])
            .domain([
                d3.min(outline_track, function(d) {return d.lat;}),
                d3.max(outline_track, function(d) {return d.lat;})
            ]);

        // append path (drawing inline track line )
        track_svg.append("path")
            .data([outline_track])
            .attr("class", "line boundary outline")
            .attr("d", track_boundary_line)



    });


    // draw inline

    /*************************** DRAWING TRACK ******************************/
    /*
    // range of track x, y (Longitude, Latitude) setting
    track_x = d3.scaleLinear().range([0, track_width])
        .domain([
            d3.min(track_data, function(d) { return d.long;}),
            d3.max(track_data, function(d) {return d.long;})
        ]);
    track_y = d3.scaleLinear().range([track_height, 0])
        .domain([
            d3.min(track_data, function(d) {return d.lat;}),
            d3.max(track_data, function(d) {return d.lat;})
        ]);

    // setting svg for drawing track
    track_svg = d3.select("#track_canvas").append("svg")
        .attr("width", track_width + track_margin.left + track_margin.right)
        .attr("height", track_height + track_margin.top + track_margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + track_margin.left + "," + track_margin.top + ")");

    // append path (drawing track)
    track_svg.append("path")
        .data([track_data])
        .attr("class", "line")
        .attr("d", track_line)



    */


    // draw outline

}