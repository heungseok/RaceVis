/**
 * Created by totor on 2017-06-11.
 */

function setPlaySpeed(){
    animation_delay = Number(document.getElementById("sel_speed").value);
}

function playInput(){
    // when play button clicked, the animation function call;
    trackAnimation();
}

function trackAnimation(){
    setTimeout(function () {
        // ************** block for animation things *************** //
        var track_focus = d3.select("#track_focus1");
        track_focus.attr("transform", "translate(" + track_x(track_data[animation_index].long) + "," + track_y(track_data[animation_index].lat) + ")");

        // rotate by steering value
        var steer_focus = d3.select("#steer_focus1");
        steer_focus.select("image")
            .attr("transform", "translate(0, 25), rotate(" + steer_data[animation_index] + ", 35, 35)");
        steer_focus.select("text")
            .text("Steering degree: " + steer_data[animation_index]);

        var brake_focus = d3.select("#brake_focus1");
        brake_focus.select("rect")
            .attr("height", 1+ brake_data[animation_index]);
        brake_focus.select("text")
            .text("Brake: " + brake_data[animation_index]);

        var gear_focus = d3.select("#gear_focus1");
        gear_focus.select("text")
            .text("Gear: " + gear_data[animation_index]);

        // animation for line chart
        var focuses = d3.select("#canvas").selectAll("svg")
            .selectAll(".focus");

        // set all focus elements' style to display
        focuses.style("display", null);

        focuses.attr("transform", function(d){

            var y_range = d3.scaleLinear()
                .range([height, 0])
                .domain([
                    d3.min(d.values, function(c) { return c.feature_val; }),
                    d3.max(d.values, function (c) { return c.feature_val })
                ]);

            return "translate(" + x(d.values[animation_index].x) + "," + y_range(d.values[animation_index].feature_val) + ")";

        });

        focuses.selectAll("text")
            .text( function (d) { return + d.values[animation_index].feature_val; });

        // ************** END of animation code *************** //
        animation_index++;
        if ( animation_index < animation_length){
            trackAnimation();
        }else{
            animation_index = 0;
        }
    },animation_delay) // change this time (in milliseconds) to delay
}



