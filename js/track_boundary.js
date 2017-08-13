/**
 * Created by totor on 2017-08-13.
 */



function draw_trackBoundary(){

    // file load
    d3.csv("./data/track_boundary/kic_short_meter_boundary_sampled.csv", function(error, data) {
    // d3.csv("./data/track_boundary/kic_short_boundary_sampled.csv", function(error, data) {

        data.forEach(function(d){

            inline_track.push({
                long: parseFloat(d["InX"]),
                lat: parseFloat(d["InY"])
            });

            outline_track.push({
                long: parseFloat(d["OutX"]),
                lat: parseFloat(d["OutY"])
            });
            // inline_track.push({
            //     long: parseFloat(d["InLat"]),
            //     lat: parseFloat(d["InLon"])
            // });
            //
            // outline_track.push({
            //     long: parseFloat(d["OutLat"]),
            //     lat: parseFloat(d["OutLon"])
            // })

        });

        // range of track x, y (Longitude, Latitude) setting
        track_boundary_x_in = d3.scaleLinear().range([0, track_width])
            .domain([
                d3.min(inline_track, function(d) { return d.long;}),
                d3.max(inline_track, function(d) {return d.long;})
            ]);
        track_boundary_y_in = d3.scaleLinear().range([track_height, 0])
            .domain([
                d3.min(inline_track, function(d) {return d.lat;}),
                d3.max(inline_track, function(d) {return d.lat;})
            ]);
        // ****************  draw boundary *********************** //
        // append path (drawing inline track line )
        track_svg.append("path")
            .data([inline_track])
            .attr("class", "line boundary inline")
            .attr("d", track_boundary_inline)

        // range of track x, y (Longitude, Latitude) setting
        track_boundary_x_out = d3.scaleLinear().range([0, track_width])
            .domain([
                d3.min(outline_track, function(d) { return d.long;}),
                d3.max(outline_track, function(d) {return d.long;})
            ]);
        track_boundary_y_out = d3.scaleLinear().range([track_height, 0])
            .domain([
                d3.min(outline_track, function(d) {return d.lat;}),
                d3.max(outline_track, function(d) {return d.lat;})
            ]);

        // append path (drawing inline track line )
        track_svg.append("path")
            .data([outline_track])
            .attr("class", "line boundary outline")
            .attr("d", track_boundary_outline)



    });




}