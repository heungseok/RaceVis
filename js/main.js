/**
 * Created by totor on 2017-06-11.
 */
/* global variable for drawing ling graph */

var margin = {top: 20, right: 20, bottom: 20, left: 70},
    width = document.getElementById("canvas").offsetWidth - margin.left - margin.right,
    height = document.getElementById("canvas").offsetHeight/5 - margin.bottom - margin.top;

var zoom_margin = {top: 20, right: 20, bottom: 20, left: 70},
    zoom_width = width,
    zoom_height = document.getElementById("canvas").offsetHeight/5 - zoom_margin.bottom - zoom_margin.top;

var track_margin = {top: 20, right: 20, bottom: 20, left: 20},
    track_width = document.getElementById("track_canvas").offsetWidth - track_margin.left - track_margin.right,
    track_height = document.getElementById("track_canvas").offsetHeight - track_margin.bottom - track_margin.top;

var sub_margin = {top: 20, right: 20, bottom: 20, left: 20},
    sub_width = document.getElementById("sub_canvas").offsetWidth - track_margin.left - track_margin.right,
    sub_height = document.getElementById("sub_canvas").offsetHeight - track_margin.bottom - track_margin.top;


var x = d3.scaleLinear().range([0, width]);
var zoom_x = d3.scaleLinear().range([0, zoom_width]);
var y = d3.local();


var line = d3.local();
var zoom_line = d3.local();
var bisect = d3.bisector(function (d) { return d.x; }).left;

var xAxis = d3.axisBottom(x);
var zoom_xAxis = d3.axisBottom(zoom_x)

var svg, zoom_svg,
    track_svg, sub_svg;

var all_features;
var selected_features = [];
var selected_feat_names = [];

var track_data = [];
var track_x, track_y;

var track_line = d3.line().curve(d3.curveBasis)
    .x(function(d) { return track_x(d.long); })
    .y(function(d) { return track_y(d.lat); });


// var for sub global data
var steer_data =[],
    brake_data = [],
    gas_data = [],
    gear_data = [];

// variable for for animating
var animation_index =0,
    animation_length,
    animation_flag = false,
    resume_flag = false,
    animation_state = "play",
    animation_delay = 50; // default as 50 milliseconds.


// variable for brush
var brush = d3.brushX()
    .extent([[0,0], [zoom_width, zoom_height]])
    .on("brush end", brush);

var context;


$(document).ready(function () {
    init();
})


function init(){

    d3.csv("./data/2nd_std_file.csv", type, function(error, data) {
    // d3.csv("./data/2nd_std_file_origin.csv", type, function(error, data) {
        if (error) throw error;
        // console.log(data)
        all_features = data.columns.slice(1).map(function(id) {
            // console.log(id)

            return {
                id: id,
                values: data.map(function(d) {
                    return {x: d.x, feature_val: parseFloat(d[id])};    // float로 parsing 해주어야함.
                })
            };
        });

        // filter the specific features ( 기본값은 GPS_Speed / RPM ) & push Lat Long for track line
        selected_features = [];
        var temp_lat = [];
        var temp_long = [];
        var temp_steer = [];

        all_features.forEach(function(d){

            // 각 칼럼의 첫번째 raw 값을 check, nan일 경우 set check box as unavailable
            if(isNaN(d.values[0].feature_val)){
                $("input[type=checkbox]").filter(function() { return this.value == d.id }).attr("disabled", true);
            }

            // default feature로 GPS_Speed, RPM 을 plotting.
            if(d.id == "GPS_Speed (kmh)" || d.id == "RPM (NA)"){
                selected_features.push(d)
                selected_feat_names.push(d.id);
            }else if(d.id == "PosLat (deg)"){
                temp_lat = _.pluck(d.values, 'feature_val');
            }else if(d.id == "PosLon (deg)"){
                temp_long = _.pluck(d.values, 'feature_val');
            }else if(d.id == "Steer_angle (deg)"){
                steer_data = _.pluck(d.values, 'feature_val')
            }else if(d.id == "Pedal_brake (percent)"){
                brake_data = _.pluck(d.values, 'feature_val')
            }else if(d.id == "Gear (NA)"){
                gear_data = _.pluck(d.values, 'feature_val')
            }

        });
        /// ***** assign temp lat long data to global variable *****
        temp_lat.forEach(function(value, index){
            track_data.push({
                long: temp_long[index],
                lat: value
            });

        });
        animation_length = track_data.length;

        // x domain은 TimeStamp 또는 Distance로 ... default로는 TimeStamp
        x0 = d3.extent(data, function(d) {return d.x;})
        x.domain(x0);
        zoom_x.domain(x0);


        drawLineGraph();
        drawTrack();
        drawSubInfo();


    });

}

// This function supports parsing the column from input data.
function type(d, _, columns) {
    d.x = d["TimeStamp (sec)"]
    // d.x = d["TimeStamp"]
    for (var i = 1, n = columns.length, c; i < n; ++i) {
        d[c = columns[i]]  =  +d[c];
        // console.log(d)
        return d;
    }
}


function brush(){
    var s = d3.event.selection || zoom_x.range();
    x.domain(s.map(zoom_x.invert, zoom_x));
    d3.select("#canvas").selectAll("path.line").attr("d", function(d) { return line.get(this)(d.values)});
    d3.select("#canvas").selectAll(".axis--x").call(xAxis);

    var focuses = d3.select("#canvas").selectAll("svg")
        .selectAll(".focus");

    // set all focus elements' style to un-display
    focuses.style("display", "none");

}

