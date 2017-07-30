/**
 * Created by totor on 2017-06-11.
 */

function drawLineGraph(){

    /*************************** DRAWING CHART ******************************/
    svg = d3.select("#canvas").selectAll("svg")
        .data(selected_features)
        .enter().append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .append("g")
        .attr("id", function (d) {
            return d.id.split(" ")[0];
            // return d.id.replace(/\s/g, ''); // regx, remove space for setting id
        })
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .each(function (d) {

            var ty = y.set(this, d3.scaleLinear()
                .range([height, 0]))
            // local feature에 대한 y range setting
                .domain([
                    d3.min(d.values, function(c) { return c.feature_val; }),
                    d3.max(d.values, function(c) { return c.feature_val; }) ]);
            // Global feature에 대한 y range setting
            //                            .domain([
            //                                d3.min(features, function(c) { return d3.min(c.values, function(d) { return d.feature_val; }); }),
            //                                d3.max(features, function(c) { return d3.max(c.values, function(d) { return d.feature_val; }); }) ])

            // local feature range (0~ max(y))
//                            .domain([ 0, d3.max(d.values, function(c) { return c.feature_val;}) ]);

            line.set(this, d3.line().curve(d3.curveBasis)
                .x(function(d){ return x(d.x);})
                .y(function(d){ return ty(d.feature_val); }));

            zoom_line.set(this, d3.line().curve(d3.curveBasis)
                .x(function(d){ return x(d.x);})
                .y(function(d){ return ty(d.feature_val); }));

        });

    // clipPath init. ref-http://visualize.tistory.com/331
    d3.select("#canvas").selectAll("svg").append("defs").append("clipPath")
        .attr("id",  function (d) {
            return "clip_" + d.id.split(" ")[0];
        })
        .append("rect")
        .attr("width", width)
        .attr("height", height)

    // assign clipPath to each line area.
    // & draw path line
    svg.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line.get(this)(d.values); })
        .attr("clip-path", function (d) {
            return "url(#clip_" + d.id.split(" ")[0] + ")";
        })


    // end of init. clipPath
    svg.append("text")
        .attr("y", height - 50)
        .attr("x", 10)
        .text(function(d) { return d.id; });

    // define y axis
    for (var i=0; i<selected_features.length; i++){
        var id = "g#" + selected_features[i].id.split(" ")[0];

        var y_range = d3.scaleLinear()
            .range([height, 0])
            //                        .domain([0, d3.max(selected_features[i].values, function (c) { return c.feature_val }) ]);
            .domain([
                d3.min(selected_features[i].values, function(c) { return c.feature_val; }),
                d3.max(selected_features[i].values, function (c) { return c.feature_val })
            ]);

        d3.select(id).append("g")
            .call(d3.axisLeft(y_range).ticks(3))


        // 마지막 인덱스인 그래프에만 x axis
        if( i == selected_features.length -1){
            d3.select(id).append("g")
                .call(xAxis)
                .attr("id", "x-axis")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(" + 0 + "," + height + ")");


        }
    }

    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    // append the circle at the interaction
    focus.append("circle")
        .attr("class", "chart_tooltip")
        .attr("r", 4.5);
    // place the value at the interaction
    focus.append("text")
        .attr("class", "chart_tooltip")
        .attr("x", 9)
        .attr("dy", ".35em")
        .text("nothing");

    // append x line.
    focus.append("line")
        .attr("class", "tooltip_line")
        .style("stroke", "#fff")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.9)
        .attr("y1", -height)
        .attr("y2", height);


    // append the rectangle to capture mouse
    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent")
        // .on("mouseover", function() { focus.style("display", null); }) => 마지막에 따로 선언해야 brush와 충돌일어나지 않음.
        // .on("mousemove", mousemove)
    //

    // ############################### BRUSH on CHART ##############################
    svg.append("g")
        .attr("class", "chartBrush")
        .call(brush_onChart);

    // ################################ ZOOM BRUSH PART ###############################
    zoom_svg = d3.select("#zoom_canvas")
        .append("svg")
        .attr("width", zoom_width + zoom_margin.left + zoom_margin.right)
        .attr("height", zoom_height + zoom_margin.top + zoom_margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


    context = zoom_svg.append("g")
        .attr("class", "context");


    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + 0+ "," + zoom_height + ")")
        .call(zoom_xAxis);
    //
    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range()); // 이걸로 초기 zoom range를 x.range()로 setting함. 없애면 brush 안보임.


    // 마지막으로 mouse over effect 활성, 마지막에 선언함으로서 chart위에 brush와 겹치면서 잘 동작될 수 있음.
    d3.select("#canvas").selectAll(".overlay")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mousemove", mousemove);


}

function drawTrack(){

    /*************************** DRAWING TRACK ******************************/

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


    // append track focus element (circle)
    var track_focus = track_svg.append("g")
        .attr("id", "track_focus1");

    track_focus.append("circle")
        .attr("r", 4.5);


}

function drawSubInfo() {

    /******************** Drawing Sub Info ****************************/

    // setting svg for drawing track
    sub_svg = d3.select("#sub_canvas").append("svg")
        .attr("width", sub_width + sub_margin.left + sub_margin.right)
        .attr("height", sub_height + sub_margin.top + sub_margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + sub_margin.left + "," + sub_margin.top + ")");

    // steering

    var steering_focus = sub_svg.append("g")
        .attr("id", "steer_focus1")

    steering_focus.append("image")
        .attr("height", 80).attr("width", 80)
        .attr("xlink:href", "./img/steer.png")
        .attr("transform", "translate(0, 25)");
    steering_focus.append("text")
        .text("Steering degree: ");


    // Brake
    var brake_focus = sub_svg.append("g")
        .attr("id", "brake_focus1")
        .attr("transform", "translate(120, 0)");

    brake_focus.append("rect")
        .attr("x", -25)
        .attr("y", -110)
        .attr("transform", "rotate(180)")
        .attr("width", 20)
        .attr("height", 1)
        .style("fill", "steelblue");

    brake_focus.append("text")
        .text("Brake: ");


    // Gas
    var gas_focus = sub_svg.append("g")
        .attr("id", "gas_focus1")
        .attr("transform", "translate(240, 0)");

    gas_focus.append("rect")
        .attr("x", -25)
        .attr("y", -110)
        .attr("transform", "rotate(180)")
        .attr("width", 20)
        .attr("height", 1)
        .style("fill", "steelblue");

    gas_focus.append("text")
        .text("Gas: ");

    // Gear
    var gear_focus = sub_svg.append("g")
        .attr("id", "gear_focus1")
        .attr("transform", "translate(360, 0)");
    gear_focus.append("text")
        .text("Gear: ");

}



function mousemove(){

    var x_value = x.invert(d3.mouse(this)[0]);
    var index = 0;

    var focuses = d3.select("#canvas").selectAll("svg")
        .selectAll(".focus");

    // 마지막 line x-axis에 맞추기.
    var foc_lines = document.getElementsByClassName("tooltip_line");
    foc_lines[foc_lines.length - 1].setAttribute("y2", 0);


    // set all focus elements' style to display
    focuses.style("display", null);

    focuses.selectAll(".chart_tooltip").attr("transform", function(d){
        index = bisect(d.values, x_value, 0, d.values.length -1);

        var y_range = d3.scaleLinear()
            .range([height, 0])
            .domain([
                d3.min(d.values, function(c) { return c.feature_val; }),
                d3.max(d.values, function (c) { return c.feature_val })
            ]);

        return "translate(" + x(d.values[index].x) + "," + y_range(d.values[index].feature_val) + ")";

    });

    focuses.selectAll("text")
        .text( function (d) { return +d.values[index].feature_val.toFixed(3); });

    focuses.selectAll("line.tooltip_line").attr("transform", function(d){

        index = bisect(d.values, x_value, 0, d.values.length -1);
        return "translate(" + x(d.values[index].x) + "," + height +")";

    });


    // moving Track
    var track_focus = d3.select("#track_focus1");
    track_focus.attr("transform", "translate(" + track_x(track_data[index].long) + "," + track_y(track_data[index].lat) + ")");

    // handle Steering, Brake, Gas, Gear

    // rotate by steering value
    var steer_focus = d3.select("#steer_focus1");
    steer_focus.select("image")
        .attr("transform", "translate(0, 25), rotate(" + steer_data[index] + ", 35, 35)");
    steer_focus.select("text")
        .text("Steering degree: " + steer_data[index]);

    var brake_focus = d3.select("#brake_focus1");
    brake_focus.select("rect")
        .attr("height", 1+ brake_data[index]);
    brake_focus.select("text")
        .text("Brake: " + brake_data[index]);

    var gas_focus = d3.select("#gas_focus1");
    gas_focus.select("rect")
        .attr("height", 1+gas_data[index]);
    gas_focus.select("text")
        .text("Gas: " + gas_data[index]);

    var gear_focus = d3.select("#gear_focus1");
    gear_focus.select("text")
        .text("Gear: " + gear_data[index])
        .style("color", "#9d9d9d");



    // this is for get array data by id
    // console.log(_.where(all_features), function(item) { console.log(item); return item.id=="Steer_angle (deg)"});
}


function updateChart(value, checked){
    ///////////////// update data ///////////////////////

    // chart 업데이트 by the checked value of check-box (_.pluck => dictionary array의 특정 value만을 array로 return.)
    var feat_names = _.pluck(selected_features, 'id'); // current feat_names

    // if checked is true
    if(checked){
        // if the value is NOT contained in array, then add to the array
        if(! (_.contains(feat_names, value)) ){
            // selected features array update
            all_features.forEach(function (d) {
                if(d.id == value){
                    selected_features.push(d);
                }
            });
            // add target chart (해당 value값을 가진 chart 추가)
            addChart(value);

        }

        // if checked is false
    }else{
        // if the value is contained in array, then remove from the array
        if(_.contains(feat_names, value)){
            var index = _.indexOf(feat_names, value);
            console.log(value, index);
            console.log(selected_features)

            // remove target chart (해당 value값을 가진 chart 삭제)
            removeChart(value, index);

            selected_features.splice(index, 1);
        }
    }
}



function addChart(id) {

    // 이전 x-axis 삭제
    d3.select("#x-axis")
        .remove();

    // extract target data which is stored in last index of selected_features
    var target_data = selected_features[selected_features.length-1];

    ///////////////// update Chart /////////////////// => d3.document 참고해서 수정할것..
    console.log(target_data);
    svg = d3.select("#canvas").selectAll("svg").data(selected_features).enter()
    //                var update_svg = d3.select("#canvas").selectAll("svg").data(selected_features).enter()
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .append("g")
        .attr("id", function (d) {
            return d.id.split(" ")[0];
            // return d.id.replace(/\s/g, ''); // regx, remove space for setting id
        })
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .each(function (d) {

            var ty = y.set(this, d3.scaleLinear()
                .range([height, 0]))
            // local feature에 대한 y range setting
                .domain([
                    d3.min(d.values, function(c) { return c.feature_val; }),
                    d3.max(d.values, function(c) { return c.feature_val; }) ]);

            line.set(this, d3.line().curve(d3.curveBasis)
                .x(function(d){ return x(d.x);})
                .y(function(d){ return ty(d.feature_val); }));

        });

    // clipPath init. ref-http://visualize.tistory.com/331
    d3.select("#canvas").selectAll("svg").append("defs").append("clipPath")
        .attr("id",  function (d) {
            return "clip_" + d.id.split(" ")[0];
        })
        .append("rect")
        .attr("width", width)
        .attr("height", height)

    // assign clipPath to each line area.
    // & draw path line
    svg.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line.get(this)(d.values); })
        .attr("clip-path", function (d) {
            return "url(#clip_" + d.id.split(" ")[0] + ")";
        });

    // end of init. clipPath



    svg.append("text")
        .attr("y", height - 50)
        .attr("x", 10)
        .text(function(d) { return d.id; });

    var y_range = d3.scaleLinear()
        .range([height, 0])
        .domain([
            d3.min(target_data.values, function(d) { return d.feature_val; }),
            d3.max(target_data.values, function(d) { return d.feature_val; })
        ]);

    svg.append("text")
        .attr("y", height - 50)
        .attr("x", 10)
        .text(id);

    svg.append("g")
        .call(d3.axisLeft(y_range).ticks(3));


    // x axis
    svg.append("g")
        .call(xAxis)
        .attr("id", "x-axis")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + 0 + "," + height + ")");


    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    // append x line.
    focus.append("line")
        .attr("class", "tooltip_line")
        .style("stroke", "#fff")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.9)
        .attr("y1", -height)
        .attr("y2", 0);

    // 마지막 line x-axis에 맞추기.
    var foc_lines = document.getElementsByClassName("tooltip_line");
    for (var i =0; i<foc_lines.length-1; i++){
        foc_lines[i].setAttribute("y2", height);
    }
    foc_lines[foc_lines.length - 1].setAttribute("y2", 0);

    focus.append("circle")
        .attr("class", "chart_tooltip")
        .attr("r", 4.5);
    focus.append("text")
        .attr("class", "chart_tooltip")
        .attr("x", 9)
        .attr("dy", ".35em")
        .text("nothing");

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent")

    // ************ brush on chart 추가 ***************
    svg.append("g")
        .attr("class", "chartBrush")
        .call(brush_onChart);

    // ************ Enable to work mouse hovering ***************
    d3.select("#canvas").selectAll(".overlay")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mousemove", mousemove);


    // set the all circles as invisible
    var focuses = d3.select("#canvas").selectAll("svg")
        .selectAll(".focus");
    focuses.style("display", "none");


}

function removeChart(id, index) {

    var target_id = "g#" + id.split(" ")[0];

    d3.select(target_id)
        .select(function() { return this.parentNode; })
        .remove();

    // 만약 제거하려는 차트가 마지막 svg일 경우 차트 없앤 뒤에 새로운 x axis생성
    if(index == selected_features.length-1 && (selected_features.length-1) != 0){
        d3.select("g#" + selected_features[index-1].id.split(" ")[0])
            .append("g")
            .call(xAxis)
            .attr("id", "x-axis")
            .attr("transform", "translate(" + 0 + "," + height + ")");
    }

    // 마지막 line x-axis에 맞추기.
    var foc_lines = document.getElementsByClassName("tooltip_line");
    for (var i =0; i<foc_lines.length-1; i++){
        foc_lines[i].setAttribute("y2", height);
    }
    foc_lines[foc_lines.length - 1].setAttribute("y2", 0);

}


function setBtnState() {
    if(root_x == "Distance (m)"){
        // document.getElementById("btn-type-dist").
        d3.select("#btn-type-dist").classed("btn-success", true);
        d3.select("#btn-type-time").classed("btn-success", false);
    }else{
        d3.select("#btn-type-time").classed("btn-success", true);
        d3.select("#btn-type-dist").classed("btn-success", false);
    }
}

function axisSwitch(axis_type){
    console.log(axis_type.value);
    if(root_x == axis_type.value){
        console.log("type is same, do nothing");
    }else{
        console.log("type is different, change the axis");
        root_x = axis_type.value;
        clearAllSVG();
        init();

    }
}

function clearAllSVG() {

    d3.select("#zoom_canvas").select("svg").remove();
    d3.select("#canvas").selectAll("svg").remove();
    d3.select("#track_canvas").selectAll("svg").remove();
    d3.select("#sub_canvas").selectAll("svg").remove();
}