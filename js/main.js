/**
 * Created by totor on 2017-06-11.
 */
/* global variable for drawing ling graph */

var margin = {top: 5, right: 20, bottom: 20, left: 70},
    width = document.getElementById("canvas").offsetWidth - margin.left - margin.right,
    height = document.getElementById("canvas").offsetHeight/5 - margin.bottom - margin.top;

var zoom_margin = {top: 20, right: 20, bottom: 20, left: 70},
    zoom_width = width,
    zoom_height = document.getElementById("canvas").offsetHeight/10 - zoom_margin.bottom - zoom_margin.top;

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
var root_x = "Distance (m)"

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
    animation_range = [],
    animation_flag = false,
    resume_flag = false,
    animation_state = "play",
    animation_delay = 50; // default as 50 milliseconds.



/*   BRUSH on CHART variable  */
var brush_onChart = d3.brushX().on("end", brushedOnChart),
    idleTimeout,
    idleDelay = 350;


/*   ZOOM with BRUSH variable  */

// variable for brush
var brush = d3.brushX()
    .extent([[0,0], [zoom_width, zoom_height]])
    .on("brush end", brushed);

// init zoom listener
var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

var current_zoomRange;

var context;
/***************/

// document가 ready 되었을 때 chart initialization
$(document).ready(function () {
    init();

});


function init(){

    d3.csv("./data/2nd_std_file.csv", type, function(error, data) {
    // d3.csv("./data/2nd_std_file_origin.csv", type, function(error, data) {
        if (error) throw error;

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
            }else if(d.id == "Pedal_throttle (percent)"){
                gas_data = _.pluck(d.values, 'feature_val')
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

        // x domain은 TimeStamp 또는 Distance로 ... default로는 Distance => TimeStamp
        // x0 = d3.extent(data, function(d) {return d.x;}) => 가 string array ['1', '2', '33', ...] 에서 동작하려면
        // x0 = d3.extent(data, function(d) {return +d.x;}) 와같이 coerce를 거쳐야함.
        x0 = d3.extent(data, function(d) {return +d.x;});
        x.domain(x0);
        zoom_x.domain(x0);
        console.log(x0);

        drawLineGraph();
        drawTrack();
        drawSubInfo();
        setBtnState();
        document.getElementById("loading").style.display = "none";

    });


}

// This function supports parsing the column from input data.
function type(d, _, columns) {
    // d.x = d["TimeStamp (sec)"]
    d.x = d[root_x];
    for (var i = 1, n = columns.length, c; i < n; ++i) {
        d[c = columns[i]]  =  +d[c];
        // console.log(d)
        return d;
    }
}


function brushedOnChart(){
    var s = d3.event.selection;

    if (!s) {
        // if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
        // zoomReset();
        // 지금은 !s일 경우 do nothing
    }else{
        console.log("brushed on chart!");
        console.log("current x domain is (before change from brush): " + x.domain());
        // 이미 정의한 brush함수를 호출하는 것은 적절치 않음. 그래서 재구현함.

        // 1. 지정된 brush 영역을 현재 화면에 표시된 x range에 따라 x domain 변경
        // using burshX()
        x.domain(s.map(x.invert, x)); // brushX()말고 그냥 brush()일 경우 x.domain([s[0][0], s[1][0]].map(x.invert, x));

        // 2. 범위에 따라 brush on chart move. 이 코드가 있어야 brush가 chart에 남지않음.
        d3.select("#canvas").selectAll(".chartBrush").call(brush_onChart.move, null);

        // 3. brush로 바꾼 x domain에 따라 상위 zoom brush의 x range 변환, 적용.
        // => brush call을 통해 animation path 변경, x-axis, chart 변경
        console.log("바뀐 x.domain에 따른 zoom-x: "+ zoom_x(x.domain()[0]));
        console.log("바뀐 x.domain에 따른 zoom-x: "+ zoom_x(x.domain()[1]));
        current_zoomRange[0] = zoom_x(x.domain()[0]);
        current_zoomRange[1] = zoom_x(x.domain()[1]);
        d3.select("#zoom_canvas").select("g.brush").call(brush.move, current_zoomRange); // current zoom_range 변경 후 brush move call.

        // 4. End of brush on chart
        console.log("current x domain is (after change from brush): " + x.domain());

    }



}
function idled() {
    idleTimeout = null;
}


function brushed(){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || zoom_x.range();


    current_zoomRange = s;
    console.log(s);
    // current_zoomRange = s.map(zoom_x.invert, zoom_x);
    x.domain(s.map(zoom_x.invert, zoom_x));
    d3.select("#canvas").selectAll("path.line").attr("d", function(d) { return line.get(this)(d.values)});
    d3.select("#canvas").selectAll(".axis--x").call(xAxis);

    console.log("brushed!");
    console.log("current x domain is: " + x.domain());
    // console.log(s.map(zoom_x.invert, zoom_x));

    setAnimationRange_fromZoom(current_zoomRange.map(zoom_x.invert, zoom_x));
    // setAnimationRange_fromZoom(current_zoomRange);

    d3.select("#canvas").selectAll(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));


    // set all focus elements' style to un-display
    var focuses = d3.select("#canvas").selectAll("svg")
        .selectAll(".focus");
    focuses.style("display", "none");

}


function zoomIn() {
    console.log("zoom in!");

    // zoom in시 우측, 좌측의 값 차이가 매우 적을 경우 (threshold as 1) 함수 종료
    if (current_zoomRange[1]-current_zoomRange[0] < 2) return;

    // 나중에는 형재 레인지의 10%씩 뺴고 더해야할듯.
    current_zoomRange[0] += 1;
    current_zoomRange[1] -= 1;

    // x.domain(current_zoomRange.map(zoom_x.invert, zoom_x));
    // d3.select("#canvas").selectAll("path.line").attr("d", function(d) { return line.get(this)(d.values)});
    // d3.select("#canvas").selectAll(".axis--x").call(xAxis);
    //
    // setAnimationRange_fromZoom(current_zoomRange.map(zoom_x.invert, zoom_x));
    //
    // d3.select("#canvas").selectAll(".zoom").call(zoom.transform, d3.zoomIdentity
    //     .scale(width / (current_zoomRange[1] - current_zoomRange[0]))
    //     .translate(-current_zoomRange[0], 0));

    // set all focus elements' style to un-display
    var focuses = d3.select("#canvas").selectAll("svg")
        .selectAll(".focus");
    focuses.style("display", "none");

    // brush move
    // brush.extent(current_zoomRange[0], current_zoomRange[1])
    d3.select("#zoom_canvas").select("g.brush").call(brush.move, current_zoomRange);

}

function zoomOut() {
    console.log("zoom out!");

    // zoom out 시 우측, 좌측의 값이 zoom_range를 벗어날 경우 return.
    if (current_zoomRange[0]-1 < zoom_x.range()[0] || current_zoomRange[1]+1 > zoom_x.range()[1]) return;

    // 나중에는 형재 레인지의 10%씩 뺴고 더해야할듯.
    current_zoomRange[0] -= 1;
    current_zoomRange[1] += 1;

    // set all focus elements' style to un-display
    var focuses = d3.select("#canvas").selectAll("svg")
        .selectAll(".focus");
    focuses.style("display", "none");

    // brush move
    // brush.extent(current_zoomRange[0], current_zoomRange[1])
    d3.select("#zoom_canvas").select("g.brush").call(brush.move, current_zoomRange);

}

function setAnimationRange_fromZoom(s){

    // clear the animation range (composed of index of data); animation_range는 data의 index를 담고 있음.
    animation_range = [];

    var originX0 = s[0].toFixed(1),
        originX1 = s[1].toFixed(1),
        targetX0, targetX1;

    all_features.forEach(function (data){
        if (data.id == root_x){

            for (var i=0; i<data.values.length-1; i++){
                if (data.values[i].feature_val <= originX0 && data.values[i+1].feature_val >= originX0)
                    targetX0 = i;
                if (data.values[i].feature_val <= originX1 && data.values[i+1].feature_val >= originX1)
                    targetX1 = i+1;
            }
            // setting animation range and initializing animation_index ( 애니메이션 인덱스 재조절)
            animation_range.push(targetX0);
            animation_range.push(targetX1);
            animation_index = targetX0;

            return;
        }
    });
    if (typeof track_svg != 'undefined')
        drawing_animationPath()

}

function drawing_animationPath() {
    // clean previous animation path
    track_svg.select("path.animation_path").remove();

    // if animation is playing, force to stop
    resume_flag = true;
    resume();

    animation_track_data = [];
    for(var i=animation_range[0]; i<animation_range[1]; i++){
        animation_track_data.push(track_data[i]);
    }

    // append path (drawing track)
    track_svg.append("path")
        .data([animation_track_data])
        .attr("class", "animation_path")
        .attr("d", track_line)
        .style("z-index", -1);

}

function zoomed(){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    console.log("zooming!")
    x.domain(t.rescaleX(zoom_x).domain());
    console.log(t.rescaleX(zoom_x).domain())

    d3.select("#canvas").selectAll("path.line").attr("d", function(d) { return line.get(this)(d.values)});
    d3.select("#canvas").selectAll(".axis--x").call(xAxis);
    // context select
    d3.select("#zoom_canvas").select("g.brush").call(brush.move, x.range().map(t.invertX, t));

}

function zoomReset() {
    console.log("zoom reset!");

    var t = d3.zoomIdentity.translate(0, 0).scale(1);
    current_zoomRange = t;

    // brush reset
    d3.select("#zoom_canvas").select("g.brush").call(brush.move, null);

}


function setBrushRange(btn){
    // 1. btn value를 split해서 brush 조정할 range값을 parsing
    var range = btn.value.split("-").map(Number);

    // define our brush extent to be begin and end
    // zoom_x(value) => 실제 값을 zoom_x의 scale값에 대응한 값으로 return해줌.
    current_zoomRange[0] = zoom_x(range[0]);
    current_zoomRange[1] = zoom_x(range[1]);

    d3.select("#zoom_canvas").select("g.brush").call(brush.move, current_zoomRange);


}
