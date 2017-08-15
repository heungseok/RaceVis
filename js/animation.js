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
        trackAnimation();
    }else {
        return;
    }

    // delayed Loop 가 완전히 끝났을 경우 flag를 true로 하고 함수종료
    animation_flag = true;

}

function trackAnimation(){
    setTimeout(function () {
        // resume 버튼 클릭되었을 경우 애니메이션 정지
        if(resume_flag) return;
        
        
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
        brake_focus.select("rect.value")
            .attr("height", 1+ brake_data[animation_index]);
        brake_focus.select("text")
            .text("Brake: " + brake_data[animation_index]);

        var gas_focus = d3.select("#gas_focus1");
        gas_focus.select("rect.value")
            .attr("height", 1+gas_data[animation_index]);
        gas_focus.select("text")
            .text("Gas: " + gas_data[animation_index]);


        var gear_focus = d3.select("#gear_focus1");
        gear_focus.select("text.value")
            .text(gear_data[animation_index]);

        var gas_focus = d3.select("#gas_focus1");
        gas_focus.select("text")
            .text("Gas: " + gas_data[animation_index]);

        // animation for line chart
        var focuses = d3.select("#canvas").selectAll("svg")
            .selectAll(".focus");

        // set all focus elements' style to display
        focuses.style("display", null);

        focuses.selectAll(".chart_tooltip").attr("transform", function(d){

            var y_range = d3.scaleLinear()
                .range([height, 0])
                .domain([
                    d3.min(d.values, function(c) { return c.feature_val; }),
                    d3.max(d.values, function (c) { return c.feature_val })
                ]);

            return "translate(" + x(d.values[animation_index].x) + "," + y_range(d.values[animation_index].feature_val) + ")";

        });

        focuses.selectAll("text")
            .text( function (d) { return + d.values[animation_index].feature_val.toFixed(3); });

        focuses.selectAll("line.tooltip_line").attr("transform", function(d){

            return "translate(" + x(d.values[animation_index].x) + "," + height +")";

        });

        // ************** END of animation code *************** //
        animation_index++;
        // if ( animation_index < animation_length){ => origin ver.
        if ( animation_index < animation_range[1]){ // => coordinated by zoomed range
            trackAnimation();
        }else{
            animation_index = animation_range[0] // => coordinated by zoomed range
            resetPlay()
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

