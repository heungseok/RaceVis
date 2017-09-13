/**
 * Created by totor on 2017-06-11.
 */
/* global variable for drawing ling graph */

var margin = {top: 5, right: 20, bottom: 20, left: 50},
    margin_for_plot_info = document.getElementById("canvas").offsetWidth*0.2,
    width = document.getElementById("canvas").offsetWidth - margin.left - margin.right - margin_for_plot_info,
    // height = document.getElementById("canvas").offsetHeight/5 - margin.bottom - margin.top;
    height = window.innerHeight/8 - margin.bottom - margin.top;

var zoom_margin = {top: 20, right: 20, bottom: 20, left: 50},
    zoom_width = width,
    zoom_height = window.innerHeight/10 - zoom_margin.bottom - zoom_margin.top;

var track_margin = {top: 10, right: 30, bottom: 20, left: 30},
    track_width = document.getElementById("track_canvas").offsetWidth - track_margin.left - track_margin.right,
    track_height = document.getElementById("track_canvas").offsetHeight - track_margin.bottom - track_margin.top;

var sub_margin = {top: 10, right: 20, bottom: 20, left: 20},
    sub_width = document.getElementById("sub_canvas").offsetWidth - track_margin.left - track_margin.right,
    // sub_height = document.getElementById("sub_canvas").offsetHeight - track_margin.bottom - track_margin.top;
    sub_height = document.getElementById("row-top container").offsetHeight - sub_margin.bottom - sub_margin.top;

// ************** selected lap, reference lap variable **************** //
var selected_lap=1, selected_ref_lap=1;
var vis_type = 2; // 1: one lap, 2: two laps


// ************** line-graph variable and line function **************** //
var x = d3.scaleLinear().range([0, width]);
var zoom_x = d3.scaleLinear().range([0, zoom_width]);
var y = d3.local();

var line = d3.local();
var zoom_line = d3.local();
var bisect = d3.bisector(function (d) { return d.x; }).left;
var bisect_for_animation = d3.bisector(function (d) { return d; }).left;

var xAxis = d3.axisBottom(x);
var zoom_xAxis = d3.axisBottom(zoom_x)

var svg, zoom_svg,
    track_svg, sub_svg;


var all_features, ref_all_features, merged_all_features =[];
var selected_features = [], ref_selected_features = [], merged_selected_features =[];
var selected_feat_names = [];
// var root_x = "Distance (m)"
var root_x = "PositionIndex";



// ************** track boundary variable and line function **************** //
var track_data = [], ref_track_data =[], merged_track_data={ };
var track_x, track_y,
    ref_track_x, ref_track_y,
    inline_track = [], outline_track = [];


// var track_line = d3.line().curve(d3.curveBasis)
var track_line = d3.line()
    .x(function(d) { return track_x(d.long); })
    .y(function(d) { return track_y(d.lat); });


// ************** track animation variable **************** //
var animation_index =0,
    animation_length,
    animation_range = [],
    ref_animation_index = 0,
    ref_animation_length,
    ref_animation_range,
    animation_flag = false,
    resume_flag = false,
    animation_state = "play",
    animation_delay = 50; // default as 50 milliseconds.



// ************** sub information variable **************** //
var steer_data =[],
    brake_data = [],
    gas_data = [],
    gear_data = [];

var ref_steer_data = [],
    ref_brake_data = [],
    ref_gas_data = [],
    ref_gear_data = [];


/* *************  BRUSH ON CHART (차트위에서 드래그 줌인) variable  ******************/
var brush_onChart = d3.brushX().on("end", brushedOnChart).extent([[0,0], [width, height]]),
    idleTimeout;
/* *************   ZOOM with BRUSH (차트 전체 브러쉬 줌인,아웃) variable *************  */
var brush = d3.brushX()
    .extent([[0,0], [zoom_width, zoom_height]])
    .on("brush end", brushed);
var zoom =  d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

var trackZoom = d3.zoom()
    .scaleExtent([1, 10]) // 1~10배까지만 허용.
    .on("zoom", track_zoomed);

var current_zoomRange;
var context;



/**************************** END of initializing Global variable *******************************************/




// document가 ready 되었을 때 chart initialization
$(document).ready(function () {
    init(vis_type);
});

function init(init_type) {
    init_type = init_type || 1;

    document.getElementById("loading").style.display = "block";

    // variable for brush
    brush = d3.brushX()
        .extent([[0,0], [zoom_width, zoom_height]])
        .on("brush end", brushed);

    // init zoom listener
    zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    if(init_type == 1){
        init_with_originLap();
    }else{
        // init type이 1이 아닌 경우: input이 2개.
        init_with_twoLaps();
        // init_with_originLap();
        // init_with_refLap();
    }

}
function init_with_twoLaps() {
    d3.csv("./data/m4_KIC_SHORT.csv", type, function(data) {
        d3.csv("./data/moon_KIC_SHORT.csv", type, function (ref_data) {
            d3.csv("./data/track_boundary/kic_short_meter_boundary_sampled.csv", function(error, track_boundary_data) {

                // 먼저 origin data parsing 한 뒤 merged_all_features에 push
                all_features = data.columns.slice(0).map(function (id) {
                    return {
                        id: id,
                        values: data.map(function (d) {
                            return {x: d.x, feature_val: parseFloat(d[id])};    // float로 parsing 해주어야함.
                        })
                    };
                });

                // 다음으로 ref data parsing 후 origin data의 ref_values 에 push
                ref_data.columns.slice(0).map(function (id) {
                    var temp_index = _.findIndex(all_features, function (item) {
                        return item.id == id;
                    })
                    if (temp_index != -1) {
                        all_features[temp_index].ref_values = ref_data.map(function (d) {
                            return {x: d.x, feature_val: parseFloat(d[id])};    // float로 parsing 해주어야함.
                        });
                    }

                });
                console.log("Finished merging all features")

                // filter the specific features ( 기본값은 GPS_Speed / RPM ) & push Lat Long for track line
                selected_features = [];
                var temp_lat = [];
                var temp_long = [];
                var ref_temp_lat = [];
                var ref_temp_long = [];

                console.log("generating check box by each features, and assign track_data, gas, and etc.");

                // 다음으로 origin data를 기준으로 check box 형성
                all_features.forEach(function (d) {
                    /*
                     // 각 칼럼의 첫번째 raw 값을 check, nan일 경우 set check box as unavailable
                     if(isNaN(d.values[0].feature_val)){
                     $("input[type=checkbox]").filter(function() { return this.value == d.id }).attr("disabled", true);
                     }
                     */
                    // default feature로 GPS_Speed, RPM 을 plotting.
                    if (d.id == "GPS_Speed" || d.id == "RPM") {
                        selected_features.push(d)
                        selected_feat_names.push(d.id);
                        $('.checkbox_wrapper').append("<li class ='checkbox'> " +
                            "<label><input type='checkbox' value=" + d.id + " onclick=handleCBclick(this); checked='checked'>" + d.id + "</label></li>");
                    // }else if(d.id == "RefinedPosLat"){
                    //     temp_lat = _.pluck(d.values, 'feature_val');
                    //     ref_temp_lat = _.pluck(d.ref_values, 'feature_val');
                    // }else if(d.id == "RefinedPosLon"){
                    //     temp_long = _.pluck(d.values, 'feature_val');
                    //     ref_temp_long = _.pluck(d.ref_values, 'feature_val');
                    } else if (d.id == "PosLocalY") {
                        temp_lat = _.pluck(d.values, 'feature_val');
                        ref_temp_lat = _.pluck(d.ref_values, 'feature_val');
                    } else if (d.id == "PosLocalX") {
                        temp_long = _.pluck(d.values, 'feature_val');
                        ref_temp_long = _.pluck(d.ref_values, 'feature_val');
                    } else if (d.id == "Steer_angle") {
                        steer_data = _.pluck(d.values, 'feature_val')
                        ref_steer_data = _.pluck(d.ref_values, 'feature_val')
                    } else if (d.id == "Pedal_brake") {
                        brake_data = _.pluck(d.values, 'feature_val')
                        ref_brake_data = _.pluck(d.ref_values, 'feature_val')
                    } else if (d.id == "Gear") {
                        gear_data = _.pluck(d.values, 'feature_val')
                        ref_gear_data = _.pluck(d.ref_values, 'feature_val')
                    } else if (d.id == "ECU_THROTTLE") {
                        gas_data = _.pluck(d.values, 'feature_val')
                        ref_gas_data = _.pluck(d.ref_values, 'feature_val')
                    } else {
                        $('.checkbox_wrapper').append("<li class ='checkbox'> " +
                            "<label><input type='checkbox' value=" + d.id + " onclick=handleCBclick(this);>" + d.id + "</label></li>");
                    }

                });
                console.log("finished generating checkbox by each features, and assigning focus data");

                /// ***** assign temp lat long data to global variable *****
                temp_lat.forEach(function (value, index) {
                    track_data.push({
                        long: temp_long[index],
                        lat: value
                    });
                });
                ref_temp_lat.forEach(function (value, index) {
                    ref_track_data.push({
                        long: ref_temp_long[index],
                        lat: value
                    });
                });
                merged_track_data.origin = track_data;
                merged_track_data.ref = ref_track_data;

                console.log("merge track boundary data with track data");

                track_boundary_data.forEach(function (d) {

                    inline_track.push({
                        long: parseFloat(d["InX"]),
                        lat: parseFloat(d["InY"])
                    });

                    outline_track.push({
                        long: parseFloat(d["OutX"]),
                        lat: parseFloat(d["OutY"])
                    });
                });
                merged_track_data.inline = inline_track;
                merged_track_data.outline = outline_track;

                console.log("finished merging all track data");
                // animation_length = track_data.length;

                // ********  x domain setting, zoom_x domain setting ******** //
                // 두 데이터의 x 값중 min값과 max값을 골라서 x.domain에 setting
                // x domain은 TimeStamp 또는 Distance로 ... default로는 Distance => TimeStamp

                var origin_x0 = d3.extent(data, function (d) { return +d.x;});
                var ref_x0 = d3.extent(ref_data, function (d) { return +d.x; });
                var union_x0 = d3.extent(_.union(origin_x0, ref_x0));

                x.domain(union_x0);
                zoom_x.domain(union_x0);

                drawLineGraph_withTwoLaps();
                drawTrack_withTwoLaps();
                drawSubInfo_withTwoLaps();
                setBtnState();
                // setAnimationRange_fromZoom(current_zoomRange.map(zoom_x.invert, zoom_x))
                zoomReset();
                document.getElementById("loading").style.display = "none";


            });
        });
    });

}


function init_with_originLap() {
    d3.csv("./data/m4_KIC_SHORT.csv", type, function(error, data) {
        d3.csv("./data/track_boundary/kic_short_meter_boundary_sampled.csv", function(error, track_boundary_data) {

            if (error) throw error;

            console.log(data)

            all_features = data.columns.slice(0).map(function (id) {

                return {
                    id: id,
                    values: data.map(function (d) {
                        return {x: d.x, feature_val: parseFloat(d[id])};    // float로 parsing 해주어야함.
                    })
                };
            });

            // filter the specific features ( 기본값은 GPS_Speed / RPM ) & push Lat Long for track line
            selected_features = [];
            var temp_lat = [];
            var temp_long = [];


            all_features.forEach(function (d) {

                /*
                 // 각 칼럼의 첫번째 raw 값을 check, nan일 경우 set check box as unavailable
                 if(isNaN(d.values[0].feature_val)){
                 $("input[type=checkbox]").filter(function() { return this.value == d.id }).attr("disabled", true);
                 }
                 */

                // default feature로 GPS_Speed, RPM 을 plotting.
                if (d.id == "GPS_Speed" || d.id == "RPM") {
                    selected_features.push(d)
                    selected_feat_names.push(d.id);
                    $('.checkbox_wrapper').append("<div class ='checkbox'> " +
                        "<label><input type='checkbox' value=" + d.id + " onclick=handleCBclick(this); checked='checked'>" + d.id + "</label></div>");
                    // }else if(d.id == "RefinedPosLat"){
                    //    temp_lat = _.pluck(d.values, 'feature_val');
                    // }else if(d.id == "RefinedPosLon"){
                    //    temp_long = _.pluck(d.values, 'feature_val');
                } else if (d.id == "PosLocalY") {
                    temp_lat = _.pluck(d.values, 'feature_val');
                } else if (d.id == "PosLocalX") {
                    temp_long = _.pluck(d.values, 'feature_val');
                } else if (d.id == "Steer_angle") {
                    steer_data = _.pluck(d.values, 'feature_val')
                } else if (d.id == "Pedal_brake") {
                    brake_data = _.pluck(d.values, 'feature_val')
                } else if (d.id == "Gear") {
                    gear_data = _.pluck(d.values, 'feature_val')
                } else if (d.id == "ECU_THROTTLE") {
                    gas_data = _.pluck(d.values, 'feature_val')
                } else {
                    $('.checkbox_wrapper').append("<div class ='checkbox'> " +
                        "<label><input type='checkbox' value=" + d.id + " onclick=handleCBclick(this);>" + d.id + "</label></div>");
                }

            });
            /// ***** assign temp lat long data to global variable *****
            temp_lat.forEach(function (value, index) {
                track_data.push({
                    long: temp_long[index],
                    lat: value
                });

            });

            merged_track_data.origin = track_data;

            console.log("merge track boundary data with track data");
            track_boundary_data.forEach(function (d) {

                inline_track.push({
                    long: parseFloat(d["InX"]),
                    lat: parseFloat(d["InY"])
                });

                outline_track.push({
                    long: parseFloat(d["OutX"]),
                    lat: parseFloat(d["OutY"])
                });
            });
            merged_track_data.inline = inline_track;
            merged_track_data.outline = outline_track;

            console.log("finished merging all track data");
            animation_length = track_data.length;

            // x domain은 TimeStamp 또는 Distance로 ... default로는 Distance => TimeStamp
            // x0 = d3.extent(data, function(d) {return d.x;}) => 가 string array ['1', '2', '33', ...] 에서 동작하려면
            // x0 = d3.extent(data, function(d) {return +d.x;}) 와같이 coerce를 거쳐야함.
            x0 = d3.extent(data, function (d) {
                return +d.x;
            });
            x.domain(x0);
            zoom_x.domain(x0);
            console.log(x0);

            drawLineGraph();
            drawTrack();
            drawSubInfo();
            setBtnState();
            setAnimationRange_fromZoom(current_zoomRange.map(zoom_x.invert, zoom_x))
            zoomReset();
            document.getElementById("loading").style.display = "none";

        });
    });
}


/*

function init(){

    d3.csv("./data/2nd_std_file.csv", type, function(error, data) {
    // d3.csv("./data/2nd_std_file_origin.csv", type, function(error, data) {
        if (error) throw error;

        all_features = data.columns.slice(0).map(function(id) {
            // console.log(id)

            return {
                id: id,
                values: data.map(function(d) {
                    return {x: d.x, feature_val: parseFloat(d[id])};    // float로 parsing 해주어야함.
                })
            };
        });
        console.log(all_features)

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
            /!*if(d.id == "GPS_Speed" || d.id == "RPM"){
                selected_features.push(d)
                selected_feat_names.push(d.id);
            }else if(d.id == "PosLat"){
                temp_lat = _.pluck(d.values, 'feature_val');
            }else if(d.id == "PosLon"){
                temp_long = _.pluck(d.values, 'feature_val');
            }else if(d.id == "Steer_angle"){
                steer_data = _.pluck(d.values, 'feature_val')
            }else if(d.id == "Pedal_brake"){
                brake_data = _.pluck(d.values, 'feature_val')
            }else if(d.id == "Gear"){
                gear_data = _.pluck(d.values, 'feature_val')
            }else if(d.id == "Pedal_throttle"){
                gas_data = _.pluck(d.values, 'feature_val')
            }*!/
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
        draw_trackBoundary();
        drawSubInfo();
        setBtnState();
        setAnimationRange_fromZoom(current_zoomRange.map(zoom_x.invert, zoom_x))
        document.getElementById("loading").style.display = "none";

        // all feature 데이터 비우기
        all_features = [];


    });

}
*/

// This function supports parsing the column from input data.
// function type(d, _, columns) {
//
//     d.x = d[root_x];
//     for (var i = 1, n = columns.length, c; i < n; ++i) {
//         d[c = columns[i]]  =  +d[c];
//         // console.log(d)
//         return d;
//     }
// }

// This function supports parsing the column from input data.
function type(d, _, columns) {
// data를 칼럼으로 나누고, LapNo가 selected Lap과 같을 경우만 parsing
    d.x = d[root_x];
    for (var i = 1, n = columns.length, c; i < n; ++i) {

        if(parseInt(d["LapNo"]) == parseInt(selected_lap)) {
            d[c = columns[i]] = +d[c];
            return d;
        }

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
    d3.select("#canvas").selectAll("path.line.ref").attr("d", function(d) { return line.get(this)(d.ref_values)});
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

    var focuses_ref = d3.select("#canvas").selectAll("svg")
        .selectAll(".focus-ref");
    focuses_ref.style("display", "none");

}


function zoomIn(value) {
    value = value || 1; // value가 지정됬을 때에는 받은 parameter 값으로, 아니면 1로 default

    console.log(value)
    console.log("zoom in!");

    // zoom in시 우측, 좌측의 값 차이가 매우 적을 경우 (threshold as 1) 함수 종료
    if (current_zoomRange[1]-current_zoomRange[0] < 2) return;

    // 나중에는 형재 레인지의 10%씩 뺴고 더해야할듯.
    current_zoomRange[0] += value;
    current_zoomRange[1] -= value;

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

    // call zoomIn function for adjusting each end of range
    zoomIn(0.5)
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

// ****************** Track zoom utils ********************* //
function track_zoomed(){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    d3.select("#track_canvas").select("g").attr("transform", d3.event.transform);
}
function track_zoomReset(){
    trackZoom.transform(d3.select("#track_canvas"), d3.zoomIdentity);
}
function track_dragged(d){
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}