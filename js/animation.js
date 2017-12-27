/**
 * Created by totor on 2017-06-11.
 */

// animation delay 변경 (1x, 2x, 3x, 4x -배속)
function setPlaySpeed(){
    animation_delay = Number(document.getElementById("sel_speed").value);
}

// play button click event
function playInput(){

    // change button css
    if(animation_state == "play"){
        console.log("play clicked and change button state as pause")
        // 만약 pause상태 였을 경우 flag를 false로 다시 setting
        resume_flag = false;
        animation_flag = false;
        pause(); // play시 버튼 상태를 pause로 변경.
    }else if(animation_state == "pause"){
        console.log("pause clicked and change button state as resume")
        resume_flag = true;
        resume(); // pause가 클릭됬을 경우.
        return;
    }

    // 플래그가 true일 경우 함수를 실행하지 않고 return. (즉 이미 재생되고있을 경우 그냥 pass)
    if(!animation_flag) {
        console.log("replay or play")
        animation_flag = true;
        if(vis_type == 1) trackAnimation();
        else if(vis_type ==2) trackAnimation_withTwoLaps();

    }else {
        return;
    }

    // delayed Loop 가 완전히 끝났을 경우 flag를 true로 하고 함수종료
    animation_flag = true;

}


function trackAnimation_withTwoLaps(){
    setTimeout(function () {
        // resume 버튼 클릭되었을 경우 애니메이션 정지
        if(resume_flag) return;


        // ref_animation_index = d.values[animation_index].x;
        // 우선 postion?일 경우일 때는 origin lap의 데이터에 맞는 reference data의 index를 먼저 구해야함.

        var origin_x_value = Number(selected_features[0].values[animation_index].x);
        // console.log("x value: " + origin_x_value + ", positionIndex: " + all_features[39].);
        var ref_x_values =  _.pluck(selected_features[0].ref_values, 'x'); // ref_x_values == position Index of x
        ref_animation_index = bisect_for_animation(ref_x_values, origin_x_value, 0, ref_x_values.length-1);
        // console.log("x value: " + origin_x_value + ", ref x value: " + ref_x_values[ref_animation_index]);

        // ****************** animation for line chart *************** //
        // **** 1. for origin line chart **** //
        var focuses = d3.select("#canvas").selectAll("svg")
            .selectAll(".focus");

        // set all focus elements' style to display
        focuses.style("display", null);

        focuses.selectAll(".chart_tooltip").attr("transform", function(d){
            var ty = y.get(this);
            origin_x_value = d.values[animation_index].x;

            return "translate(" + x(d.values[animation_index].x) + "," + ty(d.values[animation_index].feature_val) + ")";
        });

        focuses.selectAll("text")
            .text( function (d) { return + d.values[animation_index].feature_val.toFixed(3); });

        focuses.selectAll("line.tooltip_line").attr("transform", function(d){
            return "translate(" + x(d.values[animation_index].x) + "," + height +")";
        });

        var plot_focuses = d3.select("#canvas").selectAll("svg")
            .selectAll("text.plot_info_focus");
        plot_focuses.text( function(d){ return +d.values[animation_index].feature_val.toFixed(3); });

        // **** 2. for reference line chart **** //
        var ref_focuses = d3.select("#canvas").selectAll("svg")
            .selectAll(".focus-ref");
        ref_focuses.style("display", null);

        ref_focuses.selectAll(".chart_tooltip-ref").attr("transform", function(d){
            var ty = y.get(this);
            return "translate(" + x(d.ref_values[ref_animation_index].x) + "," + ty(d.ref_values[ref_animation_index].feature_val) + ")";

        });
        ref_focuses.selectAll("text.chart_tooltip-ref")
            .text( function (d) {
                return +d.ref_values[ref_animation_index].feature_val.toFixed(3);
            });

        var ref_plot_focuses = d3.select("#canvas").selectAll("svg")
            .selectAll("text.plot_info_focus-ref");
        ref_plot_focuses.text( function(d){ return +d.ref_values[ref_animation_index].feature_val.toFixed(3); });

        // ************** block for animation things *************** //
        var track_focus = d3.select("#track_focus1");
        track_focus.attr("transform", "translate(" + track_x(merged_track_data.origin[animation_index].long) + "," + track_y(merged_track_data.origin[animation_index].lat) + ")");
        // track_focus.select("text").text(merged_track_data.origin[animation_index].long + ", " + merged_track_data.origin[animation_index].lat);

        var track_focus_ref = d3.select("#track_focus1-ref");
        track_focus_ref.attr("transform", "translate(" + track_x(merged_track_data.ref[ref_animation_index].long) + "," + track_y(merged_track_data.ref[ref_animation_index].lat) + ")");
        // track_focus_ref.select("text").text(merged_track_data.ref[ref_animation_index].long + ", " + merged_track_data.ref[ref_animation_index].lat);

        // rotate by steering value
        var steer_focus = d3.select("#steer_focus1");
        steer_focus.select("image.steer")
            .attr("transform", "scale(0.5), translate(150, 50), rotate(" + steer_data[animation_index] + ", 40, 40)");
        steer_focus.select("image.steer-ref")
            .attr("transform", "scale(0.5), translate(250, 50), rotate(" + ref_steer_data[ref_animation_index] + ", 40, 40)");

        // steer_focus.select("text.steer_value")
        //     .text(steer_data[animation_index].toFixed(3));
        // steer_focus.select("text.steer-ref_value")
        //     .text(ref_steer_data[ref_animation_index].toFixed(3));
        var steer_diff = Math.abs(steer_data[animation_index]) - Math.abs(ref_steer_data[ref_animation_index]);
        steer_focus.select("text.steer_value")
            .text(function(){
                if(steer_diff >= 0) return "+"+steer_diff.toFixed(2);
                else return steer_diff.toFixed(2);
            })
            .style("fill", "WhiteSmoke");


        var brake_focus = d3.select("#brake_focus1");
        brake_focus.select("rect.value")
            .attr("width", 1+ brake_data[animation_index]);
        brake_focus.select("rect.value-ref")
            .attr("width", 1+ ref_brake_data[ref_animation_index]);

        var brake_diff = brake_data[animation_index] - ref_brake_data[ref_animation_index];
        brake_focus.select("text.brake_value")
            .text(function(){
                if(brake_diff >= 0) return "+"+brake_diff.toFixed(2);
                else return brake_diff.toFixed(2);
            })
            .style("fill", "WhiteSmoke");


        var gas_focus = d3.select("#gas_focus1");
        gas_focus.select("rect.value")
            .attr("width", 1+gas_data[animation_index]);
        gas_focus.select("rect.value-ref")
            .attr("width", 1+ref_gas_data[ref_animation_index]);

        var gas_diff = gas_data[animation_index] - ref_gas_data[ref_animation_index];
        gas_focus.select("text.gas_value")
            .text(function(){
                if(gas_diff >= 0) return "+"+gas_diff.toFixed(2);
                else return gas_diff.toFixed(2);
            })
            .style("fill", "WhiteSmoke");


        var gear_focus = d3.select("#gear_focus1");
        gear_focus.select("text.value")
            .text(gear_data[animation_index]);
        gear_focus.select("text.value-ref")
            .text(ref_gear_data[ref_animation_index]);

        var rpm_focus = d3.select("#rpm_focus1");
        rpm_focus.select("text.value")
            .text(Math.round(rpm_data[animation_index]));
        rpm_focus.select("text.value-ref")
            .text(Math.round(ref_rpm_data[ref_animation_index]));


        // ************** END of animation code *************** //
        animation_index++;
        // if ( animation_index < animation_length){ => origin ver.
        if ( animation_index < animation_range[1]){ // => coordinated by zoomed range
            trackAnimation_withTwoLaps();
        }else{
            animation_index = animation_range[0] // => coordinated by zoomed range
            resetPlay();
        }
    },animation_delay) // change this time (in milliseconds) to delay
}

function resetPlay(){
    animation_flag = false;
    var button = d3.select("#button_play").classed("btn-success", false);
    button.select("span").attr("class", "glyphicon glyphicon-play");
    animation_state = "play";
}
function pause() {
    animation_state = 'pause';
    var button = d3.select("#button_play").classed("btn-success", true);
    button.attr("value", "false");
    button.select("span").attr("class", "glyphicon glyphicon-pause");
}
function resume() {
    animation_state = "play";
    var button = d3.select("#button_play").classed("btn-success", true);
    button.attr("value", "true");
    button.select("span").attr("class", "glyphicon glyphicon-play");
    window.clearTimeout();
}

