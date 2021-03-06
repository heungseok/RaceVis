/**
 * Created by totor on 2017-06-11.
 */

// ******************** Global Variable for drawing d3 objects (line graph, track, sub info, chart) ********************* //
var MIN_WIDTH = 1000;
var MIN_HEIGHT = 700;


// ** main chart variables ** //
var margin = {top: 5, right: 20, bottom: 20, left: 50},
    margin_for_plot_info = document.getElementById("canvas").offsetWidth*0.2,
    width = document.getElementById("canvas").offsetWidth - margin.left - margin.right - margin_for_plot_info,
    // height = document.getElementById("canvas").offsetHeight/5 - margin.bottom - margin.top;
    height = window.innerHeight/8 - margin.bottom - margin.top;

// additional margin to show min, max value next to the line chart
var additional_margin = 20;


// ** zoom component variables ** //
var zoom_margin = {top: 20, right: 20, bottom: 20, left: 50},
    zoom_width = width, // line chart랑 같은 width
    zoom_height = window.innerHeight/12 - zoom_margin.bottom - zoom_margin.top;

// ** track, navigation track variables ** //
var track_margin = {top: 0, right: 10, bottom: 20, left: 50},
    nav_track_margin = {top: 50, right: 50, bottom: 100, left: 50},
    track_width = document.getElementById("track_canvas").offsetWidth - track_margin.left - track_margin.right,
    track_height = document.getElementById("track_canvas").offsetHeight - track_margin.bottom - track_margin.top,

    nav_track_width = document.getElementById("track_nav_canvas").offsetWidth - nav_track_margin.left - nav_track_margin.right,
    // nav_track_height = document.getElementById("row-top container").offsetHeight - nav_track_margin.bottom - nav_track_margin.top;
    nav_track_height = document.getElementById("track_nav_canvas").offsetHeight - nav_track_margin.bottom - nav_track_margin.top;


// ** sub-info components variables ** //
var sub_margin = {top: 0, right: 20, bottom: 0, left: 20},
    sub_width = document.getElementById("sub_canvas").offsetWidth - sub_margin.left - sub_margin.right,
    sub_height = document.getElementById("sub_canvas").offsetHeight - sub_margin.bottom - sub_margin.top;
    // sub_height = document.getElementById("row-top container").offsetHeight - sub_margin.bottom - sub_margin.top;

// ** radar chart variables ** //
var radar_chart_height = document.getElementById("row-top container").offsetHeight*.5,
    radar_chart_width = radar_chart_height;


// Config for the Radar chart
var radar_chart_config = {
    w: radar_chart_width,
    h: radar_chart_height,
    maxValue: 100,
    levels: 5,
    ExtraWidthX: 300
};

// ************** selected lap, reference lap variable **************** //
var selected_lap=1, selected_ref_lap=1;
var vis_type = 2; // 1: one lap, 2: two laps

// ************** line-graph variable and line function **************** //
var x = d3.scaleLinear().range([0, width]);
var zoom_x = d3.scaleLinear().range([0, zoom_width]);
var y = d3.local();
var zoom_limit_pidx = 15; // zoom region limit as 15m
var zoom_limit_time = 2; // zoom region limit as 2 seconds

var line = d3.local();
var bisect = d3.bisector(function (d) { return d.x; }).left;
var bisect_for_animation = d3.bisector(function (d) { return d; }).left;

var xAxis = d3.axisBottom(x);
var xAxis_tooltip;
var zoom_xAxis = d3.axisBottom(zoom_x);

var svg, zoom_svg,
    track_svg, sub_svg, nav_track_svg;

// feature variables
var all_features=[];
var selected_features = [];
var selected_feat_names = [];
var exceptional_features_name = ["Distance", "RefinedPosLon", "RefinedPosLat", "TimeStamp", "PosLat", "PosLon", "AccelForward", "AccelLateral", "Internal Batte", "GPS_PosAccuracy", "GPS_Slope", "PositionIndex", "LapNo", "unknown-channel"]

// x-axis feature
var root_x = "PositionIndex";



// ************** track boundary variable and line function **************** //
var track_data = [], ref_track_data =[], merged_track_data={ };
var track_x, track_y, nav_track_x, nav_track_y;
    inline_track = [], outline_track = [], centerline_track = [];
var track_delta = []; // position index 에 해당하는 delta 값 저장 array
var delta_value_option = "DeltaTimeDelta"; // DeltaTimeDelta, DeltaGPS_Speed, OFF
var delta_MAX_threshold = 1.5;
var delta_MIN_threshold = -1.5;



// var track_line = d3.line().curve(d3.curveBasis)
var track_line = d3.line()
    .x(function(d) { return track_x(d.long); })
    .y(function(d) { return track_y(d.lat); });

var nav_track_line = d3.line()
    .x(function(d) { return nav_track_x(d.long); })
    .y(function(d) { return nav_track_y(d.lat); });

// ************** track animation variable **************** //
var animation_index =0,
    animation_range = [],
    ref_animation_index = 0,
    ref_animation_range = [],
    animation_flag = false,
    resume_flag = false,
    animation_state = "play",
    animation_delay = 50, // default as 50 milliseconds.
    animation_track_data = [],
    animation_delta_data = [],
    animation_track_color;
var gradient_track_width = {"INJE_FULL": 1, "INJE_SHORT": 2, "KIC_FULL": 1, "KIC_SHORT": 4};
var track_boundary_width = {"INJE_FULL": 1, "INJE_SHORT": 2, "KIC_FULL": 1, "KIC_SHORT": 2};
var track_line_width = {"INJE_FULL": 0.5, "INJE_SHORT": 1, "KIC_FULL": 0.5, "KIC_SHORT": 1};
var bisect_for_find_animatingPosition = d3.bisector(function (d) { return d.x; }).left;

var animation_path = d3.line()
    .x(function(d) { return track_x(d.long); })
    .y(function(d) { return track_y(d.lat); });



// ************** sub information variable **************** //
var steer_data =[],
    brake_data = [],
    gas_data = [],
    gear_data = [],
    rpm_data = [],
    speed_data = [],
    timeDelta_data = [];

var ref_steer_data = [],
    ref_brake_data = [],
    ref_gas_data = [],
    ref_gear_data = [],
    ref_speed_data = [],
    ref_rpm_data = [];



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

// track zoom
var trackZoom = d3.zoom()
    .scaleExtent([1, 10]) // 1~10배까지만 허용.
    .on("zoom", track_zoomed);

var current_zoomRange;
var context;

// ************* Track, Session, Lap variables for top navigation bar ************* //
var TRACK_TYPE = "KIC_SHORT"; //


var lap_original=-1;
var lap_reference=-1;
var initialized = false;

// *****************************  Global Color Variable ****************************** //
// var COLOR_POSITIVE = '#FF0000';
// var COLOR_NEGATIVE = '#00FF00';
// pastel tone color (red, green)
var COLOR_POSITIVE = '#ff6961';
var COLOR_NEGATIVE = '#61ff69';

var COLOR_ORIGIN = '#ee337d';
var COLOR_REF = '#00adeb';

// *****************************  Comments and Guide variables ****************************** //
var split_comments= [];
var split_guides = [];
var split_scores= [];


// **************************** END of initializing Global variable ******************************************* //


// document가 ready 되었을 때 chart initialization
$(document).ready(function () {
    init(vis_type);
});

// window resize
window.addEventListener("resize", resize);
function resize(){

    if(window.innerWidth <= MIN_WIDTH || window.innerHeight <= MIN_HEIGHT){
        // Open modal and Set all elements invisible
        document.getElementById("warningModal").style.display = "block";
    }else{
        // Close modal and Set all elements visible
        document.getElementById("warningModal").style.display = "none";
    }

}

function init(init_type) {
    init_type = init_type || 1;

    document.getElementById("loading").style.display = "block";

    if(window.innerWidth <= MIN_WIDTH || window.innerHeight <= MIN_HEIGHT){
        console.log("current width:" + window.innerWidth + ", current height:" + window.innerHeight);
        document.getElementById("warningModal").style.display = "block";
        // document.getElementById("loading").style.display = "none";
        //     return;
    }

    // variable for brush
    brush = d3.brushX()
        .extent([[0,0], [zoom_width, zoom_height]])
        .on("brush end", brushed);

    // init zoom listener
    // zoom = d3.zoom()
    //     .scaleExtent([1, Infinity])
    //     .translateExtent([[0, 0], [width, height]])
    //     .extent([[0, 0], [width, height]])
    //     .on("zoom", zoomed);

    if(init_type == 1){
        init_with_originLap();
    }else{
        // init type이 1이 아닌 경우: input이 2개.
        init_summaryInfo();
        init_with_twoLaps();
    }



}
function init_with_twoLaps() {
    if(initialized) return;

    d3.csv("./data/A-comparison.csv", type, function(data) {
        d3.csv("./data/B-comparison.csv", type, function (ref_data) {
            d3.csv("./data/track_boundary/"+ TRACK_TYPE.toLowerCase() + ".csv", function(error, track_boundary_data) {

                // ******* time delta data load ********* //
                d3.csv("./data/comparison.csv", function(error, track_delta_data){

                    // 먼저 origin data parsing 한 뒤 merged_all_features에 push
                    all_features = data.columns.slice(0).map(function (id) {
                        return {
                            id: id,
                            values: data.map(function (d) {
                                return {x: +d.x, feature_val: parseFloat(d[id])};    // float로 parsing 해주어야함.
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
                                return {x: +d.x, feature_val: parseFloat(d[id])};    // float로 parsing 해주어야함.
                            });
                        }
                    });

                    console.log("Finished merging all features")
                    console.log(all_features);

                    // filter the specific features ( 기본값은 GPS_Speed / RPM ) & push Lat Long for track line
                    selected_features = [];
                    var temp_lat = [];
                    var temp_long = [];
                    var ref_temp_lat = [];
                    var ref_temp_long = [];

                    console.log("generating check box by each features, and assign track_data, gas, and etc.");

                    // 다음으로 origin data를 기준으로 check box 형성

                    $('.checkbox_wrapper').html('');
                    all_features.forEach(function (d) {

                        // 먼저 exceptional_features_name에 있는 id가 걸릴 경우 break;
                        if (exceptional_features_name.includes(d.id))
                            return;

                        /*
                         // 각 칼럼의 첫번째 raw 값을 check, nan일 경우 set check box as unavailable
                         if(isNaN(d.values[0].feature_val)){
                         $("input[type=checkbox]").filter(function() { return this.value == d.id }).attr("disabled", true);
                         }
                         */

                        // process default feature: GPS_Speed, gripUsage
                        if (d.id == "GPS_Speed" || d.id == "GripUsage") {
                            selected_features.push(d)
                            selected_feat_names.push(d.id);

                            if(d.id == "GPS_Speed"){
                                speed_data = _.pluck(d.values, 'feature_val');
                                ref_speed_data = _.pluck(d.ref_values, 'feature_val');
                            }

                            // check box items assign
                            $('.checkbox_wrapper').append("<li class ='checkbox'> " +
                                "<label><input type='checkbox' value=" + d.id + " onclick=handleCBclick(this); checked='checked'>" + d.id + "</label></li>");

                            // process sub info, track coordination
                        } else{
                            if (d.id == "RPM"){
                                rpm_data = _.pluck(d.values, 'feature_val');
                                ref_rpm_data = _.pluck(d.ref_values, 'feature_val');
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
                            } else if (d.id == "Pedal_throttle") {
                                gas_data = _.pluck(d.values, 'feature_val')
                                ref_gas_data = _.pluck(d.ref_values, 'feature_val')
                            } else if (d.id == "timeDelta"){
                                timeDelta_data = _.pluck(d.values, 'feature_val');
                            }

                            // check box items assign
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
                    merged_track_data.origin_time_delta = timeDelta_data;

                    console.log("merge track boundary data with track data");

                    // init track data;
                    inline_track = [];
                    outline_track = [];
                    centerline_track = [];


                    track_boundary_data.forEach(function (d) {

                        inline_track.push({
                            long: parseFloat(d["In_x"]),
                            lat: parseFloat(d["In_y"])
                        });

                        outline_track.push({
                            long: parseFloat(d["Out_x"]),
                            lat: parseFloat(d["Out_y"])
                        });

                        centerline_track.push({
                            long: parseFloat(d["Center_x"]),
                            lat: parseFloat(d["Center_y"]),
                            x: +d["PositionIndex"]
                        });

                    });
                    merged_track_data.inline = inline_track;
                    merged_track_data.outline = outline_track;
                    merged_track_data.centerline = centerline_track;

                    // track_delta data init
                    track_delta= []; // 전역 변수 초기화
                    track_delta = track_delta_data.map(function(data){
                        return{
                            x: parseInt(data["PositionIndex"]), // x is pidx
                            TimeDelta: parseFloat(data["DeltaTimeDelta"]), // 일단 소수점 3자리로 round
                            SpeedDelta: parseFloat(data["DeltaGPS_Speed"]),
                            GripDelta: parseFloat(data["DeltaGripUsage"]),
                            GripA: parseFloat(data["GripUsageA"]),
                            GripB: parseFloat(data["GripUsageB"])
                        }
                    });
                    console.log(track_delta);
                    setDeltaColorRange(delta_value_option);



                    console.log("finished merging all track data");
                    // animation_length = track_data.length;

                    // ********  x domain setting, zoom_x domain setting ******** //
                    // 두 데이터의 x 값중 min값과 max값을 골라서 x.domain에 setting
                    // x domain은 TimeStamp 또는 Distance로 ... default로는 Distance => TimeStamp

                    var origin_x0 = d3.extent(data, function (d) { return +d.x;});
                    var ref_x0 = d3.extent(ref_data, function (d) { return +d.x; });
                    var union_x0 = d3.extent(_.union(origin_x0, ref_x0));

                    console.log(union_x0);
                    x.domain(union_x0);
                    zoom_x.domain(union_x0);

                    drawLineGraph_withTwoLaps();
                    drawTrack_withTwoLaps();
                    drawSubInfo_withTwoLaps();
                    setBtnState();
                    zoomReset();
                    track_zoomReset();
                    document.getElementById("loading").style.display = "none";


                });
            });
        });
    });

}


function init_summaryInfo(){
    //  ******* comment box contents ********* //
    d3.json("./data/comparison.json", function(error, track_info_data) {
        console.log(track_info_data);


        var track_name = track_info_data.track_info.TrackName;
        set_trackType(track_name); // set global trackType
        var split = track_info_data.track_info.Split;
        var optimal_time = track_info_data.optimal_info;
        optimal_time = GetStringFromSec(optimal_time);
        var nSplits = Object.keys(split).length;
        var track_length = split[nSplits - 1];


        $('#sector_track_info').html('');
        $('#sector_track_info').append('' + track_name + ', ' + track_length + 'm<br />Optimal: <span style="color:' + COLOR_NEGATIVE + '">' + optimal_time + '</span>');


        var btn_margin = 10;
        var btn_width = Math.round(width-(nSplits-1)*btn_margin)/nSplits;

        var split_record=[];
        var split_record_ref=[];
        var sector_name='';


        for(var z=0; z<nSplits; z++){
            if(z==0){
                sector_name = 'FULL';
            }
            else{
                sector_name = 'S'+z;
            }

            split_record[z] = track_info_data.sector_info[sector_name].Laptime_A;
            split_record_ref[z] = track_info_data.sector_info[sector_name].Laptime_B;

            split_comments[z] = track_info_data.sector_info[sector_name].comments;
            split_guides[z] = track_info_data.sector_info[sector_name].guides;

            split_scores[z] = [
                [
                    {"area": "ACCEL", "value": track_info_data.sector_info[sector_name].driver_score_B.ACCEL},
                    {"area": "BRAKING", "value": track_info_data.sector_info[sector_name].driver_score_B.BRAKING},
                    {"area": "DISTANCE", "value": track_info_data.sector_info[sector_name].driver_score_B.DISTANCE},
                    {"area": "EDGE", "value": track_info_data.sector_info[sector_name].driver_score_B.EDGE},
                    {"area": "LINE", "value": track_info_data.sector_info[sector_name].driver_score_B.LINE},
                    {"area": "STEERING", "value": track_info_data.sector_info[sector_name].driver_score_B.STEERING}
                ],
                [
                    {"area": "ACCEL", "value": track_info_data.sector_info[sector_name].driver_score_A.ACCEL},
                    {"area": "BRAKING", "value": track_info_data.sector_info[sector_name].driver_score_A.BRAKING},
                    {"area": "DISTANCE", "value": track_info_data.sector_info[sector_name].driver_score_A.DISTANCE},
                    {"area": "EDGE", "value": track_info_data.sector_info[sector_name].driver_score_A.EDGE},
                    {"area": "LINE", "value": track_info_data.sector_info[sector_name].driver_score_A.LINE},
                    {"area": "STEERING", "value": track_info_data.sector_info[sector_name].driver_score_A.STEERING}
                ]
            ];
        }

        //console.log(split_comments);

        var split_record_diff = [];
        var split_record_string = [];
        var split_record_string_ref = [];

        for(z=0; z<nSplits; z++){
            split_record_diff[z] = split_record[z] - split_record_ref[z];

            /*if(z==0){
             split_record_string[z] = GetStringFromSec(split_record[z]);
             split_record_string_ref[z] = GetStringFromSec(split_record_ref[z]);
             }
             else{*/
            split_record_string[z] = GetStringFromSec(split_record[z],split_record_ref[z]);
            split_record_string_ref[z] = GetStringFromSec(split_record_ref[z]);
            //}
        }

        for(z=0; z<nSplits; z++){

            if(z==0) {
                $('#split-table-contents').append('<td width="500" align="center"><button type="button"  style="width:100%; border:0px; padding:0px;" class="btn btn-split" value="'+split[0]+'-'+split[nSplits-1]+'" onclick="setBrushRange(this,0)">'+'<table width="100%" height="100%"><tr><td width="10%" style="background-color:'+GetValueColor(split_record_diff[z],-0.5,0.5)+'"></td><td>FULL: ' + split_record_string[0] +'</td></tr></table>'+'</button></td>');
                //$('#split-table-contents').append('<td width="500" align="center"><button type="button"  style="width:100%;background-color:'+GetValueColor(split_record_diff[z],-0.5,0.5)+'" class="btn btn-split" value="'+split[0]+'-'+split[nSplits-1]+'" onclick="setBrushRange(this,0)">FULL: ' + split_record_string[0] + '</button></td>');
            }else {
                $('#split-table-contents').append('<td align="center" width="10">&nbsp;</td>');
                //$('#split-table-contents').append('<td width="500" align="center"><button type="button"  style="width:100%; background-color:'+GetValueColor(split_record_diff[z],-0.1,0.1)+'" class="btn btn-split" value="'+split[z-1]+'-'+split[z]+'" onclick="setBrushRange(this,'+z+')">S'+z+': ' + split_record_string[z] + '</button></td>');
                $('#split-table-contents').append('<td width="500" align="center"><button type="button"  style="width:100%; border:0px; padding:0px;" class="btn btn-split" value="'+split[z-1]+'-'+split[z]+'" onclick="setBrushRange(this,'+z+')">'+'<table width="100%" height="100%"><tr><td width="10%" style="background-color:'+GetValueColor(split_record_diff[z],-0.1,0.1)+'"></td><td>S'+z+': ' + split_record_string[z] +'</td></tr></table>'+'</button></td>');
            }


        }

        var strClass = "btn ";

        if(split_record_diff[z]<=0) strClass ='btn btn-negative';
        else strClass='btn btn-positive';

        $('#split-table-header').attr('width',Math.round(width));
        $('#split-table-header').append('<button type="button"  style="width:'+btn_width+'px;" class="'+strClass+'" value="'+split[z]+'-'+split[z+1]+'" onclick="setBrushRange(this,'+(z+1)+')">' +
            'S' +(z+1)+
            '</button>');

        // init FULL sector btn
        // $('#split-table-header').append('<button type="button" '+ ' class="'+strClass+'" value="'+split[0]+'-'+split[nSplits-1]+'" onclick="setBrushRange(this,0)">' +
        //     'FULL' +
        //     '</button>');

        for(z=0; z<nSplits-1; z++){
            if(split_record_diff[z+1]<=0) strClass ='btn btn-negative';
            else strClass='btn btn-positive';

            $('#split-table-header').append('<button type="button"  style="width:'+btn_width+'px; margin-left:'+btn_margin+'px;" class="'+strClass+'" value="'+split[z-1]+'-'+split[z]+'" onclick="setBrushRange(this,'+(z)+')">' +
                'S' +(z)+
                '</button>');

            // $('#split-table-header').append('<button type="button" ' + ' margin-left:'+btn_margin+'px;" class="'+strClass+'" value="'+split[z]+'-'+split[z+1]+'" onclick="setBrushRange(this,'+(z+1)+')">' +
            //     'S' +(z+1)+
            //     '</button>');
        }
        /*
         for(z=0; z<nSplits; z++){
         if(split_record_diff[z]>0)
         $('#split-table-contents-ref').append('<td align="center" width='+tbl_width+'align="center" style="color:'+ COLOR_NEGATIVE + ';">'+split_record_string_ref[z]+'</td>');
         else
         $('#split-table-contents-ref').append('<td align="center" width='+tbl_width+'align="center" style="color:'+ COLOR_POSITIVE + ';">'+split_record_string_ref[z]+'</td>');
         }
         */
        UpdateRadarGuideComments(0);

        // ********************* drawing radar chart ******************** //
        // drawing radar chart
        d3.select('#radar_chart')
            .selectAll('svg')
            .append('svg')
            .attr("width", radar_chart_width)
            .attr("height", radar_chart_height);
    });
}


// This function supports parsing the column from input data.
function type(d, _, columns) {
// data를 칼럼으로 나누고, LapNo가 selected Lap과 같을 경우만 parsing
    d.x = d[root_x];
    for (var i = 1, n = columns.length, c; i < n; ++i) {
        d[c = columns[i]] = +d[c];
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
        console.log(s);

        // limit zoom range
        var temp = s.map(x.invert, x);

        if(root_x == "PositionIndex"){

            if(temp[1]-temp[0] < zoom_limit_pidx){
                d3.select("#canvas").selectAll(".chartBrush").call(brush_onChart.move, null);
                return;
            }

        }else if(root_x == "TimeStamp"){

            if(temp[1]-temp[0] < zoom_limit_time){
                d3.select("#canvas").selectAll(".chartBrush").call(brush_onChart.move, null);
                return;
            }

        }


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
    // console.log(s);
    // current_zoomRange = s.map(zoom_x.invert, zoom_x);
    console.log(current_zoomRange);
    console.log(s.map(zoom_x.invert, zoom_x));

    // limit zoom range
    var temp = s.map(zoom_x.invert, zoom_x);

    // check zoom limit
    if(root_x == "PositionIndex"){
        if(temp[1]-temp[0] < zoom_limit_pidx) return;
    }else if(root_x == "TimeStamp"){
        if(temp[1]-temp[0] < zoom_limit_time) return;
    }


    // update x domain by zoom range
    x.domain(s.map(zoom_x.invert, zoom_x));


    // **** update y scale **** //
    d3.select("#canvas").selectAll("svg").select("g").each(function(d){

        var union_y0;

        if(d.ref_values !== undefined){
            var origin_y0 = d3.extent(d.values, function(c) {
                if(c.x >=x.domain()[0] && c.x <=x.domain()[1]) { return +c.feature_val; }
            });
            var ref_y0 = d3.extent(d.ref_values, function(c) {
                if(c.x >=x.domain()[0] && c.x <=x.domain()[1]) { return +c.feature_val; }
            });
            union_y0 = d3.extent(_.union(origin_y0, ref_y0));
        }else{
            union_y0 = d3.extent(d.values, function(c) {
                if(c.x >=x.domain()[0] && c.x <=x.domain()[1]) { return +c.feature_val; }
            });
        }

        var ty = y.set(this, d3.scaleLinear()
            .range([height, 0]))
            .domain(union_y0); // local feature에 대한 y range setting

        line.set(this, d3.line().curve(d3.curveBasis)
            .x(function(c){ return x(c.x);})
            .y(function(c){ return ty(c.feature_val); }));

    });

    // **** update y axis **** //
    for (var i=0; i<selected_features.length; i++){
        var id = "g#" + selected_features[i].id.split(" ")[0];
        var union_y0;

        if(selected_features[i].ref_values !== undefined){
            var origin_y0 = d3.extent(selected_features[i].values, function(c) {
                if(c.x >=x.domain()[0] && c.x <=x.domain()[1]) { return +c.feature_val; }
            });
            var ref_y0 = d3.extent(selected_features[i].ref_values, function(c) {
                if(c.x >=x.domain()[0] && c.x <=x.domain()[1]) { return +c.feature_val; }
            });
            union_y0 = d3.extent(_.union(origin_y0, ref_y0));
        }else{
            union_y0 = d3.extent(selected_features[i].values, function(c) {
                if (c.x >= x.domain()[0] && c.x <= x.domain()[1]) return +c.feature_val;
            });
        }

        var y_range = d3.scaleLinear().range([height, 0]).domain(union_y0);
        d3.select(id).select(".axis.axis--y").call(d3.axisLeft(y_range).ticks(3));
    }

    d3.select("#canvas").selectAll("path.line").attr("d", function(d) { return line.get(this)(d.values); });
    d3.select("#canvas").selectAll("path.line.ref").attr("d", function(d) { return line.get(this)(d.ref_values); });
    d3.select("#canvas").selectAll(".axis--x").call(xAxis);

    console.log("brushed!");
    console.log("current x domain is: " + x.domain());
    // console.log(s.map(zoom_x.invert, zoom_x));

    setAnimationRange_fromZoom(current_zoomRange.map(zoom_x.invert, zoom_x));
    setMinMax_by_animationRange();

    // setAnimationRange_fromZoom(current_zoomRange);

    // set all focus elements' style to un-display
    var focuses = d3.select("#canvas").selectAll("svg")
        .selectAll(".focus");
    focuses.style("display", "none");

    var focuses_ref = d3.select("#canvas").selectAll("svg")
        .selectAll(".focus-ref");
    focuses_ref.style("display", "none");

    // update current triangle position
    d3.select("#animation_index_controller")
        .attr("transform", function(d){
            d.x = current_zoomRange[0];
            return "translate(" + current_zoomRange[0] + ", " +  "-5 ) rotate(180)";
        })

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
    // if(root_x == "TimeStamp")
    //     return;

    // clear the animation range (composed of index of data); animation_range는 data의 index를 담고 있음.
    animation_range = [];

    var originX0 = s[0].toFixed(1),
        originX1 = s[1].toFixed(1),
        targetX0 = 0,
        targetX1 = 0;

    all_features.forEach(function (data){

        if (data.id == root_x){
            targetX1 = data.values.length-1;

            for (var i=0; i<data.values.length-1; i++){
                if (data.values[i].feature_val <= originX0  &&  data.values[i+1].feature_val > originX0) {
                    targetX0 = i;
                }
                if (data.values[i].feature_val <= originX1  &&  data.values[i+1].feature_val > originX1) {
                    targetX1 = i + 1;
                }
            }
            // setting animation range and initializing animation_index ( 애니메이션 인덱스 재조절)
            animation_range.push(targetX0);
            animation_range.push(targetX1);
            setRefAnimationRange_fromOrigin();

            animation_index = targetX0;

            return;
        }
    });
    if (typeof track_svg != 'undefined')
        drawing_animationPath()

}

function setRefAnimationRange_fromOrigin(){

    // init ref_animation_range
    ref_animation_range = [];

    // extract referances x value array
    var ref_x_values =  _.pluck(selected_features[0].ref_values, 'x'); // ref_x_values == position Index of x

    // find ref strat & end position with origin x value array
    var ref_start = bisect_for_animation(ref_x_values, selected_features[0].values[animation_range[0]].x, 0, ref_x_values.length-1);
    var ref_end = bisect_for_animation(ref_x_values, selected_features[0].values[animation_range[1]].x, 0, ref_x_values.length-1);

    // update ref_animation range
    ref_animation_range.push(ref_start);
    ref_animation_range.push(ref_end);

    return;

}

function setAnimationIndex_by_triangle(dragged_x){

    var transformed_x = zoom_x.invert(dragged_x);
    animation_index = bisect(selected_features[0].values, transformed_x, 0, selected_features[0].values.length -1);

}

function setMinMax_by_animationRange(){

    selected_features.forEach(function(data, i){

        var temp_arr = _.pluck(data.values, "feature_val").slice(animation_range[0], animation_range[1]);

        var origin_extent = d3.extent(temp_arr);

        selected_features[i].origin_max = origin_extent[1];
        selected_features[i].origin_min = origin_extent[0];

        var id = "g#" + data.id.split(" ")[0];
        d3.select(id).select(".plot_info_focus_max").text('\ue093 '+selected_features[i].origin_max.toFixed(3));
        d3.select(id).select(".plot_info_focus_min").text('\ue094 '+selected_features[i].origin_min.toFixed(3));



        // reference's values
        if(data.ref_values !== undefined){
            var temp_arr_ref = _.pluck(data.ref_values, "feature_val").slice(ref_animation_range[0], ref_animation_range[1]);
            var ref_extent = d3.extent(temp_arr_ref);
            selected_features[i].ref_max = ref_extent[1];
            selected_features[i].ref_min = ref_extent[0];
            d3.select(id).select(".plot_info_focus_max-ref").text('\ue093 '+selected_features[i].ref_max.toFixed(3));
            d3.select(id).select(".plot_info_focus_min-ref").text('\ue094 '+selected_features[i].ref_min.toFixed(3));
        }else{
            d3.select(id).select(".plot_info_focus_max-ref").text("");
            d3.select(id).select(".plot_info_focus_min-ref").text("");
        }


        // var id = "g#" + data.id.split(" ")[0];
        // d3.select(id).select(".plot_info_focus_max").text(selected_features[i].origin_max.toFixed(3));
        // d3.select(id).select(".plot_info_focus_min").text(selected_features[i].origin_min.toFixed(3));
        // d3.select(id).select(".plot_info_focus_max-ref").text(selected_features[i].ref_max.toFixed(3));
        // d3.select(id).select(".plot_info_focus_min-ref").text(selected_features[i].ref_min.toFixed(3));

    })
}

function updateTimeDelta(start, end){

    // extract timeDelta object from the list of all features
    var delta_array = _.pluck(_.where(all_features, {id:"timeDelta"})[0].values, "feature_val");
    var delta_value = delta_array[end] - delta_array[start];
    d3.select("#time-delta-value")
        .text("Time Delta: " + delta_value.toFixed(3));

    /*
    // If use the value of time delta as average value
    // slice array from the index of the start and the end
    delta_array = delta_array.slice(start, end);

    // calculate delta_sum and delta_avg
    var delta_sum = delta_array.reduce(function(a, b) { return a+b});
    var delta_avg = delta_sum / delta_array.length;

    // update text
    d3.select("#time-delta-value")
        .text("Avg. Time delta: " + delta_avg.toFixed(3));
    */
}


function drawing_animationPath() {
    // clean previous animation path
    d3.selectAll("path.animation_path").remove();
    d3.selectAll("path.nav_animation_path").remove();
    d3.select("#animation_path_wrapper").remove();


    // if animation is playing, force to stop
    resume_flag = true;
    resume();

    // reset animation track_data
    animation_track_data = [];
    animation_delta_data = [];

    // var position_indices = _.pluck(selected_features[0].values, "x");

    // Position Index일 경우 animation path drawing (uniformly sample path length && split those to draw with gradient color)
    if(root_x=="PositionIndex" && delta_value_option != "OFF"){

        // ***************** animation_range의 start value & end value 값을 찾아야함. => axis 바꾼뒤에 여기서 start index, end index를 못찾는 경우가 생김. *************** //
        var centerLine_start_index = bisect_for_find_animatingPosition(merged_track_data.centerline,
            selected_features[0].values[animation_range[0]].x);

        var centerLine_end_index = bisect_for_find_animatingPosition(merged_track_data.centerline,
            selected_features[0].values[animation_range[1]].x);

        // animation start index ~ end index 사이 값을 animation track data array 에 push
        // + origin lap data 의 time delta 값도 push
        for(var i=centerLine_start_index; i<centerLine_end_index; i++){
            animation_track_data.push({
                'long': merged_track_data.centerline[i].long,
                'lat': merged_track_data.centerline[i].lat,
                'x': merged_track_data.centerline[i].x
            });

            if(delta_value_option == "DeltaGPS_Speed")
                animation_delta_data.push(track_delta[i].SpeedDelta);
            else if(delta_value_option == "DeltaTimeDelta")
                animation_delta_data.push(track_delta[i].TimeDelta);
            else if(delta_value_option == "GripUsageA")
                animation_delta_data.push(track_delta[i].GripA);
            else if(delta_value_option == "GripUsageB")
                animation_delta_data.push(track_delta[i].GripB);
            else if(delta_value_option == "DeltaGripUsage")
                animation_delta_data.push(track_delta[i].GripDelta);
        }

        // setting the time delta color palette (지금은 안씀. 이 코드는 매번 선택된 레인지에 따라서 변화할 때만 사용.
        // animation_color_domain = d3.extent(animation_delta_data);
        // animation_track_color = d3.scaleLinear().domain(animation_color_domain).range(['red', 'green']);

        // console.log(quads(samples(track_line(animation_track_data), sample_precision, animation_delta_data)));
        // drawing animation path.
        // 1. draw animation path to main track line
        var sample_precision = 0.79;
        // 0.79로 했을 때 가장 근사치가 나오긴하는데 (현재 가진 animation point array length랑 내부적으로 생성하는 패쓰를 uniformly 0.79로 샘플 했을 때 가장 근사함.. 나중에 문제 있을듯)
        d3.select("#track_canvas").select("svg").select("g")
            .append("g").attr("id", "animation_path_wrapper")
            .selectAll("path")
            .data(quads(samples(track_line(animation_track_data), sample_precision, animation_delta_data)))
            .enter().append("path")
            .attr("class", "animation_path")
            .attr("d", function(d) { return lineJoin(d[0], d[1], d[2], d[3], gradient_track_width[TRACK_TYPE])})
            .style("fill", function(d) { return animation_track_color(d.delta)})
            .style("stroke", function(d) { return animation_track_color(d.delta)})
            // .style("fill-opacity", function(d) {
            //     if (d.timeDelta > -1 && d.timeDelta < 1) return 0.5;
            //     else return 1;
            // })
            .style("fill-opacity", 0.4)
            .style("z-index", -1);

        d3.select("#table_split_selector").attr("class","");

        // Time Stamp 일 경우 animation path drawing (일반 path drawing)
    }else{
    // else if(root_x=="TimeStamp"){

        // time stamp가 축일 경우 centerline 으로 그리지 말고, 우선은 origin track 따라 그리기.
        // 센터라인에 큰 의미가 있다면 바꿀수 있겠으나 추가 연산이 필요함.
        for(var i=animation_range[0]; i<animation_range[1]; i++){
            animation_track_data.push(track_data[i]);
        }

        d3.select("#track_canvas").select("svg").select("g")
            .append("g").attr("id", "animation_path_wrapper")
            .append("path")
            .data([animation_track_data])
            .attr("class", "animation_path")
            .attr("d", track_line)
            .style("stroke", "#FFF")
            .style("stroke-width", 4)
            .style("stroke-opacity", 0.4)
            .style("stroke-dasharray", 2) /* 값이 클수록 간격이 넒어짐 */
            .style("animation", "dash 30s linear");

        // Disable split selector if root_x is TimeStamp
        if(root_x=="TimeStamp")
            d3.select("#table_split_selector").attr("class","hidden");
        else
            d3.select("#table_split_selector").attr("class","");
    }


    // 2. draw animation path to navigation track line
    d3.select("#track_nav_canvas").select("svg").select("g").append("path")
        .data([animation_track_data])
        .attr("class", "nav_animation_path")
        .attr("d", nav_track_line)
        .style("stroke", "#D41313")
        .style("stroke-width", 4)
        .style("stroke-opacity", 0.8);

    // switch the order of html elements
    switchTrackElementsOrder();

    // update time delta
    updateTimeDelta(animation_range[0], animation_range[1]);

}

function switchTrackElementsOrder() {
    try {
        var track_parentNode = document.getElementById("animation_path_wrapper").parentNode;
        track_parentNode.insertBefore(track_parentNode.lastChild, track_parentNode.firstChild);
    } catch (e){
        console.log("There is no animation range, thus no animation path wrapper element")
    }
}


// ********************** Gradient color utility ****************************** //

// Sample the SVG path uniformly with the specified precision. (precision이 낮을 수록 더 잘게 쪼개고 resolution이 높아짐)
function samples(d, precision) {
    console.log(animation_delta_data);
    var path = document.createElementNS(d3.namespaces.svg, "path");
    path.setAttribute("d", d);

    var n = path.getTotalLength(), t = [0], i = 0, dt = precision;
    console.log(n);
    // calculate our custom precsion (lap 길이와 동일한 path length를 만들기 위해)
    var custom_precision = n / animation_delta_data.length;
    console.log(custom_precision);
    // while ((i += dt) < n) {
    while ((i += custom_precision) < n) {
        t.push(i);
    }
    t.push(n);

    return t.map(function(t) {
        // console.log(t);
        // console.log(animation_delta_data_delta[Math.round(t)]);
        var p = path.getPointAtLength(t), a = [p.x, p.y];
        a.t = t / n;
        // a.timeDelta = animation_delta_data[Math.round(t)];
        return a;
    });
}

// Compute quads of adjacent points [p0, p1, p2, p3].
function quads(points) {
    return d3.range(points.length - 1).map(function(i) {
        var a = [points[i - 1], points[i], points[i + 1], points[i + 2]];
        a.t = (points[i].t + points[i + 1].t) / 2;
        // set time Delta value as random
        // a.timeDelta = Math.random() * (animation_color_domain[1] - animation_color_domain[0]) + animation_color_domain[0];

        // proxy of time delta
        if(animation_delta_data[i] > delta_MAX_threshold)
            a.delta = delta_MAX_threshold;
        else if(animation_delta_data[i] < delta_MIN_threshold)
            a.delta = delta_MIN_threshold;
        else
            a.delta = animation_delta_data[i];



        return a;
    });
}

// Compute stroke outline for segment p12.
function lineJoin(p0, p1, p2, p3, width) {
    var u12 = perp(p1, p2),
        r = width / 2,
        a = [p1[0] + u12[0] * r, p1[1] + u12[1] * r],
        b = [p2[0] + u12[0] * r, p2[1] + u12[1] * r],
        c = [p2[0] - u12[0] * r, p2[1] - u12[1] * r],
        d = [p1[0] - u12[0] * r, p1[1] - u12[1] * r];

    if (p0) { // clip ad and dc using average of u01 and u12
        var u01 = perp(p0, p1), e = [p1[0] + u01[0] + u12[0], p1[1] + u01[1] + u12[1]];
        a = lineIntersect(p1, e, a, b);
        d = lineIntersect(p1, e, d, c);
    }

    if (p3) { // clip ab and dc using average of u12 and u23
        var u23 = perp(p2, p3), e = [p2[0] + u23[0] + u12[0], p2[1] + u23[1] + u12[1]];
        b = lineIntersect(p2, e, a, b);
        c = lineIntersect(p2, e, d, c);
    }

    return "M" + a + "L" + b + " " + c + " " + d + "Z";
}

// Compute intersection of two infinite lines ab and cd.
function lineIntersect(a, b, c, d) {
    var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3,
        y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3,
        ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
    return [x1 + ua * x21, y1 + ua * y21];
}

// Compute unit vector perpendicular to p01.
function perp(p0, p1) {
    var u01x = p0[1] - p1[1], u01y = p1[0] - p0[0],
        u01d = Math.sqrt(u01x * u01x + u01y * u01y);
    return [u01x / u01d, u01y / u01d];
}

// ********************** END of gradient color utility ****************************** //
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

function update_current_zoom(changed_zoom_range){
    console.log("update zoom_range");
    console.log(changed_zoom_range);
    current_zoomRange = changed_zoom_range;
    d3.select("#animation_index_controller")
        .attr("transform", "translate(" + current_zoomRange[0] + ", " +  "-5 ) rotate(180)")

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

function setBrushRange(btn,split){
    // 1. btn value를 split해서 brush 조정할 range값을 parsing
    var range = btn.value.split("-").map(Number);
    var sector_type = 0;

    // define our brush extent to be begin and end
    // zoom_x(value) => 실제 값을 zoom_x의 scale값에 대응한 값으로 return해줌.
    current_zoomRange[0] = zoom_x(range[0]);
    current_zoomRange[1] = zoom_x(range[1]);



    d3.select("#zoom_canvas").select("g.brush").call(brush.move, current_zoomRange);


    if(btn.innerText.includes("FULL"))
        sector_type = 1;

    // zoom to specific track area
    zoomTo(range, sector_type);
    // Update comment table
    UpdateRadarGuideComments(split);

}
function zoomTo(range, sector_type){

    // **** ZOOM & PANNING to Track ****
    // All that’s necessary for panning and zooming is a translation [tx, ty] and a scale factor k.
    // When a zoom transform is applied to an element at position [x0, y0], its new position becomes [tx + k × x0, ty + k × y0].

    // - Range 가 full 일 경우 if(sector_type==1)
    // zoom reset 호출.
    if(sector_type == 1){
        track_zoomReset();
        return;
    }

    // - Full이 아닐 경우. if(sector_type==0)

    // 1) 먼저 pidx 값을 track range로 변환해야하는데, center_x, center_y 값이 리니어하지 않으므로, 직접 값을 iterate하면서 찾아야함.
    var first_index, second_index, middle_index;
    var count = 0;
    // range의 시작점이 트랙의 시작점일 경우, 1을 더해서 track line과 매칭되도록 설정.
    if(range[0]==0) range[0]++;

    for(var i=0; i<merged_track_data.centerline.length; i++){

        if(merged_track_data.centerline[i].x == Math.round(range[0])){
            first_index = i;
            count++;
        }else if(merged_track_data.centerline[i].x == Math.round(range[1])){
            second_index = i;
            count++;
        }

        // 두 인덱스 모두 채웠을 경우 for loop exit
        if(count==2) break;
    }

    // 2) calculate the target index (middle of first and second index)
    middle_index = Math.round((first_index+second_index)/2);

    console.log(merged_track_data);
    // 3) Gratuitous zoom the area
    d3.select("#track_canvas").call(trackZoom).transition()
        .duration(400)
        .call(trackZoom.transform, d3.zoomIdentity
            .translate(track_width/2, track_height/2)
            .scale(1.2)
            .translate(-track_x(merged_track_data.centerline[middle_index].long),
                -track_y(merged_track_data.centerline[middle_index].lat)))

}

function UpdateRadarGuideComments(split)
{
    $('#split_name').html('');

    if(split ==0 ) $('#split_name').append('FULL');
    else $('#split_name').append('SECTOR '+split);

    $('#guide_tab').html('');
    $('#guide_tab').append(split_guides[split]);

    $('#comment-table-contents').html('');

    Object.keys(split_comments[split]).forEach(function(key){

        if(split_comments[split][key][0] <=0){
            var sign = "";
            var color = COLOR_NEGATIVE;
        }
        else{
            sign = "+";
            color = COLOR_POSITIVE;
        }

        $('#comment-table-contents').append("<tr>" +
            "<td>" + key + '</td><td><span style="color:'+color+'">' + sign+split_comments[split][key][0] + split_comments[split][key][1] +"</span></td><td>" + split_comments[split][key][2] + "</td>");
    });


    RadarChart.draw("#radar_chart", split_scores[split], radar_chart_config);

}

// ****************** Track zoom utils ********************* //
function track_zoomed(){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    d3.select("#track_canvas").select("g").attr("transform", d3.event.transform);


    // console.log(d3.event.transform);
    // d3.select("#main_track_lines_wrapper").
    //     attr("transform", transform_track_byTrackType_inTrack_zoomed);

}
function track_zoomReset(){
    // panning the track to 25% of the width

    // with transition time
    d3.select("#track_canvas").call(trackZoom).transition()
        .duration(200)
        // .attr("transform", transform_track_byTrackType_inZoomReset)
        .call(trackZoom.transform, d3.zoomIdentity
            .translate(track_width/4, 0));

    // without transition time
    // trackZoom.transform(d3.select("#track_canvas"), d3.zoomIdentity
    //     .translate(track_width/4, 0));

    // d3.select("#main_track_lines_wrapper").
    //     attr("transform", transform_track_byTrackType);

}
function track_dragged(d){
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}
function transform_track_byTrackType_inZoomReset(){
    if(TRACK_TYPE.includes("INJE"))
        return "translate(" + track_width/2 + ",0) rotate(90)";
    else
        return "translate(" + track_width/4 + ",0)";
}

function transform_track_byTrackType_inTrack_zoomed(event){
    if(TRACK_TYPE.includes("INJE"))
        return "rotate(90)";
    else
        return;
}




// Transform the string to second //
function GetStringFromSec(sec, sec_ref)
{
    var mode = typeof sec_ref === 'undefined' ?  0 : 1;
    var is_positive = true;
    var value = 0.0;
    var ret;

    if(mode==0){        // convert sec
        value = sec;
    }else{               // convert diff
        value = sec-sec_ref;
    }

    if(value<0){
        value = Math.abs(value);
        is_positive = false;
    }

    console.log(new Date(value * 1000).toISOString());

    if(value>=3600.0){
        ret = new Date(value * 1000).toISOString().substr(11, 12);
    }else if(value>=60.0){
        ret = new Date(value * 1000).toISOString().substr(14, 9);
    }else{
        ret = new Date(value * 1000).toISOString().substr(17, 6);
    }

    //console.log(ret);

    if(ret[0]=='0') ret = ret.substr(1);

    console.log(ret);

    if(is_positive == false){
        ret = '-'+ret;
    }else{
        if(mode == 1) ret = '+'+ret;
    }

    return ret;
}

function track_selector(element){
    // track selector (button click listener of the top of the screen)
    // css selector =>  .sel_track li a

    // trackType change
    set_trackType(element.innerText);

    // ??? 용섭씨코드
    var selText = $(this).text();
    console.log(selText);
    if(!$(this).parent().hasClass("disabled")) {
        $(this).parents('.dropdown').find('.dropdown-toggle').html(selText + '<span class="caret"></span>');
        //$("#sel_session").removeClass("hidden");
    }
}

function set_trackType(selected_track){
    // INJE (full, short)
    // KIC (full, short)
    if(selected_track === TRACK_TYPE){
        // nothing
    }else {
        TRACK_TYPE = selected_track;
    }
}

function session_selector(){

    // session dropdown click listener
    // when clicked, lap selectors of origin and reference are generated.
    // css selector => .sel_session li a
    console.log("session selector");


    var selText = $(this).text();
    selText = selText.split('(');

    if(!$(this).parent().hasClass("disabled")) {
        $(this).parents('.dropdown').find('.dropdown-toggle').html(selText[0] + '<span class="caret"></span>');
        //$("#sel_lap").removeClass("hidden");

        d3.json("./data/session_info/info_std_oragi_kicshort_86_session-0.json", function (error, session_info) {
            console.log(session_info);

            var nLaps = session_info.total_laps;

            $("#sel_lap_list").html('<li class="dropdown-header">Lap</li>');
            for (var lap = 0; lap < nLaps; lap++) {
                var _lap = lap + 1;
                var laptime = session_info.lap_info[lap].lapTime;

                $("#sel_lap_list").append('<li id="sel_lap_list_' + lap + '"><a href="#" onClick="SelectOriginLap(' + lap + ','+laptime+');">' + (lap + 1) + ' Lap / ' + GetStringFromSec(laptime) + ' </a></li>');

            }
        });
    }
}

function reference_session_selector(){

    // session dropdown click listener
    // when clicked, lap selectors of origin and reference are generated.
    // css selector => .sel_session li a
    console.log("reference session selector");


    var selText = $(this).text();
    selText = selText.split('(');

    //console.log(sessName);
    if(!$(this).parent().hasClass("disabled")) {
        $(this).parents('.dropdown').find('.dropdown-toggle').html(selText[0] + '<span class="caret"></span>');
        //$("#sel_lap_ref").removeClass("hidden");

        d3.json("./data/session_info/info_std_oragi_kicshort_86_session-0.json", function (error, session_info) {
            console.log(session_info);

            var nLaps = session_info.total_laps;

            $("#sel_lap_ref_list").html('<li class="dropdown-header">Lap</li>');
            for (var lap = 0; lap < nLaps; lap++) {
                var _lap = lap + 1;
                var laptime = session_info.lap_info[lap].lapTime;

                $("#sel_lap_ref_list").append('<li id="sel_lap_list_ref_' + lap + '"><a href="#" onClick="SelectReferenceLap(' + lap + ','+laptime+');">' + (lap + 1) + ' Lap / ' + GetStringFromSec(laptime) + ' </a></li>');

            }
        });
    }
}

function SelectOriginLap(lap,laptime)
{

    $("#sel_lap_list").parents('.dropdown').find('.dropdown-toggle').html('<font color="'+COLOR_ORIGIN+'">' + (lap + 1) + ' Lap (' + GetStringFromSec(laptime)+') <span class="caret"></span>');

    lap_original = lap + 1;
    //$("#sel_session_ref").removeClass("hidden");
}

function SelectReferenceLap(lap,laptime)
{

    $("#sel_lap_ref_list").parents('.dropdown').find('.dropdown-toggle').html('<font color="'+COLOR_REF+'">'+(lap + 1) + ' Lap (' + GetStringFromSec(laptime)+')</font> <span class="caret"></span>');

    lap_reference = lap + 1;

    //$("#finish_select").removeClass("hidden");

}

function FinishSelect()
{
    console.log("Original Lap:"+lap_original+", Reference Lap:"+lap_reference);


}


// Colorize value with difference.
function GetValueColor(value, minus_threshold, plus_threshold)
{
    var r = 255, g = 255, b = 255;
    if(value <= minus_threshold){       // return green
        r = b = 0;
    }

    else if(value >= plus_threshold){   // return red
        g= b= 0;
    }

    else {
        if (value < 0) {                // preserve green and increase b, r
            b = r = 255-(Math.round(Math.abs(value) * 255 / Math.abs(minus_threshold))) ;
        }

        else{                           // preserve red and increase b, r
            b = g = 255-(Math.round(Math.abs(value) * 255 / Math.abs(plus_threshold)));
        }
    }
    var ret = "rgb("+r+","+g+","+b+");"   // color(r,g,b);
    console.log(value);
    console.log(ret);
    return ret;
}


function setDeltaOption(){
    delta_value_option = document.getElementById("delta_option").value;
    setDeltaColorRange(delta_value_option);
    drawing_animationPath();
}

// set domain/range according to delta value (animation color palette)
function setDeltaColorRange(delta_option){

    if(delta_option == "DeltaTimeDelta"){
        delta_MIN_threshold = -0.05;
        delta_MAX_threshold = 0.05;
        animation_track_color = d3.scaleLinear().domain([delta_MIN_threshold , 0, delta_MAX_threshold]).range(['green', 'rgba(255,255,255, 0.7)', 'red']);

    }else if(delta_option == "DeltaGPS_Speed"){
        delta_MIN_threshold = -5;
        delta_MAX_threshold = 5;
        animation_track_color = d3.scaleLinear().domain([delta_MIN_threshold, 0, delta_MAX_threshold]).range(['red', 'rgba(255,255,255, 0.7)', 'green']);
    }else if(delta_option == "DeltaGripUsage"){
        delta_MIN_threshold = -5;
        delta_MAX_threshold = 5;
        animation_track_color = d3.scaleLinear().domain([delta_MIN_threshold, 0, delta_MAX_threshold]).range(['red', 'rgba(255,255,255, 0.7)', 'green']);
    } else if(delta_option == "GripUsageA" || delta_option == "GripUsageB"){
        delta_MIN_threshold = 20;
        delta_MAX_threshold = 100;
        animation_track_color = d3.scaleLinear().domain([0, 100]).range(['yellow', 'red']);
        // animation_track_color = d3.scaleLinear().domain([0, 100]).range(['WhiteSmoke', 'red']);
    }
    else if(delta_option == "OFF"){
        // nothing;
    }

}