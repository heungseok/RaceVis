/**
 * Created by totor on 2017-06-11.
 */
// draw_ref_LineGraph();
// draw_ref_Track();
// draw_ref_SubInfo();

function drawLineGraph_withTwoLaps() {
    // console.log(merged_selected_features);
    console.log(selected_features);
    /*************************** DRAWING CHART ******************************/
    svg = d3.select("#canvas").selectAll("svg")
        .data(selected_features)
        .enter().append("svg")
        .attr("width", width + margin.left + margin.right + margin_for_plot_info)
        .attr("height", height + margin.bottom + margin.top)
        .append("g")
        .attr("id", function (d) {
            return d.id.split(" ")[0];
            // return d.id.replace(/\s/g, ''); // regx, remove space for setting id
        })
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .each(function (d) {
            var origin_y0 = d3.extent(d.values, function(c) { return +c.feature_val;});
            var ref_y0 = d3.extent(d.ref_values, function(c) { return +c.feature_val;});

            var union_y0 = d3.extent(_.union(origin_y0, ref_y0));
            var ty = y.set(this, d3.scaleLinear()
                .range([height, 0]))
            // local feature에 대한 y range setting
                .domain(union_y0);

            line.set(this, d3.line().curve(d3.curveBasis)
                .x(function(c){ return x(c.x);})
                .y(function(c){ return ty(c.feature_val); }));

        });

    // ************* Assign clipPath to each line area *********************//
    // clipPath init. ref-http://visualize.tistory.com/331
    d3.select("#canvas").selectAll("svg").append("defs").append("clipPath")
        .attr("id",  function (d) {
            return "clip_" + d.id.split(" ")[0];
        })
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    // end of init. clipPath

    // ************* draw each path line (ref Lap 먼저, 다음 origin Lap) *********************//
    svg.append("path")
        .attr("class", "line ref")
        .attr("d", function(d) { return line.get(this)(d.ref_values); })
        .attr("clip-path", function (d) {
            return "url(#clip_" + d.id.split(" ")[0] + ")";
        });

    svg.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line.get(this)(d.values); })
        .attr("clip-path", function (d) {
            return "url(#clip_" + d.id.split(" ")[0] + ")";
        });

    // ************* Append plot detail info *********************//
    svg.append("text")
        .attr("class", "plot_info_focus")
        .attr("y", height*0.1)
        .attr("x", width + margin_for_plot_info*0.1 )
        .style("fill", "steelblue")
        .style("font-size", "15px")
        .text("origin");

    svg.append("text")
        .attr("class", "plot_info_focus_max")
        .attr("y", height*0.1 + 25)
        .attr("x", width + margin_for_plot_info*0.1 )
        .style("fill", "steelblue")
        .style("font-size", "12px")
        .text("max");
        // .text(function(d){ return d.origin_max.toFixed(3); });

    svg.append("text")
        .attr("class", "plot_info_focus_min")
        .attr("y", height*0.1 + 50  )
        .attr("x", width + margin_for_plot_info*0.1 )
        .style("fill", "steelblue")
        .style("font-size", "12px")
        .text("min");
        // .text(function(d){ return d.origin_min.toFixed(3); });

    svg.append("text")
        .attr("class", "plot_info_focus-ref")
        .attr("y", height*0.1)
        .attr("x", 10+width + margin_for_plot_info/2)
        .style("fill", "red")
        .style("font-size", "15px")
        .text("ref");

    svg.append("text")
        .attr("class", "plot_info_focus_max-ref")
        .attr("y", height*0.1 + 25)
        .attr("x", 10+width + margin_for_plot_info/2)
        .style("fill", "red")
        .style("font-size", "12px")
        .text("max");
        // .text(functio?n(d){ return d.ref_max.toFixed(3); });

    svg.append("text")
        .attr("class", "plot_info_focus_min-ref")
        .attr("y", height*0.1 + 50  )
        .attr("x", 10+width + margin_for_plot_info/2)
        .style("fill", "red")
        .style("font-size", "12px")
        .text("min");
        // .text(function(d){ return d.ref_min.toFixed(3); });


    // ************* Append x-axis, y-axis *********************//
    // append text label
    svg.append("text")
        .attr("y", height - 50)
        .attr("x", 10)
        .text(function(d) { return d.id; });

    // define y axis && set max/min value
    for (var i=0; i<selected_features.length; i++){
        var id = "g#" + selected_features[i].id.split(" ")[0];

        var origin_y0 = d3.extent(selected_features[i].values, function(c) { return +c.feature_val;});
        var ref_y0 = d3.extent(selected_features[i].ref_values, function(c) { return +c.feature_val;});

        var union_y0 = d3.extent(_.union(origin_y0, ref_y0));
        var y_range = d3.scaleLinear()
            .range([height, 0])
            .domain(union_y0);

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

        // init max/min value
        // selected_features[i].origin_min = origin_y0[0];
        // selected_features[i].origin_max = origin_y0[1];
        // selected_features[i].ref_min = ref_y0[0];
        // selected_features[i].ref_max = ref_y0[1];
        // d3.select(id).select(".plot_info_focus_max").text(selected_features[i].origin_max.toFixed(3))
        // d3.select(id).select(".plot_info_focus_min").text(selected_features[i].origin_min.toFixed(3))
        // d3.select(id).select(".plot_info_focus_max-ref").text(selected_features[i].ref_max.toFixed(3))
        // d3.select(id).select(".plot_info_focus_min-ref").text(selected_features[i].ref_min.toFixed(3))


    }

    // ************* Append each tooltip *********************//

    // ******** origin tooltip ********** //
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
        .style("fill", "steelblue")
        .text("nothing");

    // append x line.
    focus.append("line")
        .attr("class", "tooltip_line")
        .style("stroke", "#fff")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.9)
        .attr("y1", -height)
        .attr("y2", height);

    // ******** reference tooltip ********** //
    var ref_focus = svg.append("g")
        .attr("class", "focus-ref")
        .style("display", "none");

    // append the circle at the interaction
    ref_focus.append("circle")
        .attr("class", "chart_tooltip-ref")
        .attr("r", 4.5);
    // place the value at the interaction
    ref_focus.append("text")
        .attr("class", "chart_tooltip-ref")
        .attr("x", 9)
        .attr("dy", ".35em")
        .style("fill", "red")
        .text("nothing");


    // **************** Init mouse event, zoom brush, zoom brush on Chart ********** //
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

    // ################################ ZOOM BRUSH PART (on ZOOM CANVAS) ###############################
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

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range()); // 이걸로 초기 zoom range를 x.range()로 setting함. 없애면 brush 안보임.

    // 마지막으로 mouse over effect 활성, 마지막에 선언함으로서 chart위에 brush와 겹치면서 잘 동작될 수 있음.
    d3.select("#canvas").selectAll(".overlay")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mousemove", mousemove_twoLaps);


}

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


    // append text label
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
        .style("fill", "steelblue")
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

function drawTrack_withTwoLaps(){

    /*************************** DRAWING TRACK ******************************/
    // range of track x, y (Longitude, Latitude) setting
    var origin_x0 = d3.extent(merged_track_data.origin, function(d) { return d.long; });
    var ref_x0 = d3.extent(merged_track_data.ref, function(d) { return d.long; });
    var inline_x0 = d3.extent(merged_track_data.inline, function(d) { return d.long; });
    var outline_x0 = d3.extent(merged_track_data.outline, function(d) { return d.long; });

    var union_x0 = d3.extent(_.union(origin_x0, ref_x0, inline_x0, outline_x0));
    // var union_x0 = d3.extent(_.union(origin_x0, ref_x0));
    console.log(union_x0);
    console.log(union_x0[1] - union_x0[0]);
    var abs_x_range = union_x0[1] - union_x0[0];

    var origin_y0 = d3.extent(merged_track_data.origin, function(d) { return d.lat; });
    var ref_y0 = d3.extent(merged_track_data.ref, function(d) { return d.lat; });
    var inline_y0 = d3.extent(merged_track_data.inline, function(d) { return d.lat; });
    var outline_y0 = d3.extent(merged_track_data.outline, function(d) { return d.lat; });

    var union_y0 = d3.extent(_.union(origin_y0, ref_y0, inline_y0, outline_y0));
    // var union_y0 = d3.extent(_.union(origin_y0, ref_y0));
    console.log(union_y0);
    console.log(union_y0[1] - union_y0[0]);
    var abs_y_range = union_y0[1] - union_y0[0];

    track_y = d3.scaleLinear().range([track_height, 0])
        .domain(union_y0);

    track_x = d3.scaleLinear().range([0, abs_x_range *track_height / abs_y_range ])
        .domain(union_x0);

    // setting svg for drawing track
    track_svg = d3.select("#track_canvas").append("svg")
        .attr("width", track_width + track_margin.left + track_margin.right)
        .attr("height", track_height + track_margin.top + track_margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + track_margin.left + "," + track_margin.top + ")");
            // "translate(" + track_width/4+ "," + track_margin.top + ")");


    // *************** Append track line path :***************//

    // draw inline, outline track boundary first
    track_svg.append("path")
        .data([merged_track_data.inline])
        .attr("class", "line boundary inline")
        .attr("d", track_line);

    track_svg.append("path")
        .data([merged_track_data.outline])
        .attr("class", "line boundary outline")
        .attr("d", track_line);

    // draw track line, ref line
    track_svg.append("path")
        .data([merged_track_data.ref])
        .attr("class", "line ref")
        .attr("d", track_line);

    track_svg.append("path")
        .data([merged_track_data.origin])
        .attr("class", "line")
        .attr("d", track_line);



    // ********* Append track focus element (circle) *********** //
    var track_focus = track_svg.append("g")
        .attr("id", "track_focus1");

    track_focus.append("circle")
        .attr("r", 4.5);

    var ref_track_focus = track_svg.append("g")
        .attr("id", "track_focus1-ref");

    ref_track_focus.append("circle")
        .attr("r", 4.5);


    // ********** Init track zoom ************ //
    d3.select("#track_canvas").call(trackZoom);


    // transform to center
    // d3.select("#track_canvas").select("g").attr("transform", "translate(" + track_width/4 + "," + track_margin.top + ")");


}

function drawTrack(){

    /*************************** DRAWING TRACK ******************************/
    // range of track x, y (Longitude, Latitude) setting
    var origin_x0 = d3.extent(merged_track_data.origin, function(d) { return d.long; });
    var inline_x0 = d3.extent(merged_track_data.inline, function(d) { return d.long; });
    var outline_x0 = d3.extent(merged_track_data.outline, function(d) { return d.long; });

    var union_x0 = d3.extent(_.union(origin_x0, inline_x0, outline_x0));
    console.log("union x0 " + union_x0[0] + ", " + union_x0[1]);

    var origin_y0 = d3.extent(merged_track_data.origin, function(d) { return d.lat; });
    var inline_y0 = d3.extent(merged_track_data.inline, function(d) { return d.lat; });
    var outline_y0 = d3.extent(merged_track_data.outline, function(d) { return d.lat; });

    var union_y0 = d3.extent(_.union(origin_y0, inline_y0, outline_y0));


    track_x = d3.scaleLinear().range([0, track_width])
        .domain(union_x0);
    track_y = d3.scaleLinear().range([track_height, 0])
        .domain(union_y0);

    // setting svg for drawing track
    track_svg = d3.select("#track_canvas").append("svg")
        .attr("width", track_width + track_margin.left + track_margin.right)
        .attr("height", track_height + track_margin.top + track_margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + track_margin.left + "," + track_margin.top + ")");


    // *************** Append track line path :***************//

    // draw inline, outline track boundary first
    track_svg.append("path")
        .data([merged_track_data.inline])
        .attr("class", "line boundary inline")
        .attr("d", track_line)

    track_svg.append("path")
        .data([merged_track_data.outline])
        .attr("class", "line boundary outline")
        .attr("d", track_line)

    // draw track line
    track_svg.append("path")
        .data([merged_track_data.origin])
        .attr("class", "line")
        .attr("d", track_line)


    // append track focus element (circle)
    var track_focus = track_svg.append("g")
        .attr("id", "track_focus1");
    track_focus.append("circle")
        .attr("r", 4.5);





}

function drawSubInfo_withTwoLaps() {
    console.log("draw subinfo");
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
        .attr("class", "steer")
        .attr("height", 80).attr("width", 80)
        .attr("xlink:href", "./img/steer.png")
        .attr("transform", "scale(0.5), translate(0, 50)")
        // .attr("transform", "scale(0.5)");
    steering_focus.append("text").attr("class", "steer_value")
        .attr("x", 0).attr("y", 85)
        .text("");

    steering_focus.append("image")
        .attr("class", "steer-ref")
        .attr("height", 80).attr("width", 80)
        .attr("xlink:href", "./img/steer.png")
        .attr("transform", "scale(0.5), translate(130, 50)")
        // .attr("transform", "scale(0.5)");
    steering_focus.append("text").attr("class", "steer-ref_value")
        .attr("x", 80).attr("y", 85)
        .text("");


    // Brake
    var brake_focus = sub_svg.append("g")
        .attr("id", "brake_focus1")
        .attr("transform", "translate(0, 0)");

    brake_focus.append("rect")
        .attr("class", "background")
        .attr("x", 5)
        .attr("y", 110)
        .attr("transform", "rotate(0)")
        .attr("width", 105)
        .attr("height", 20)
        .style("fill", "grey");

    brake_focus.append("rect")
        .attr("class", "value")
        .attr("x", 5)
        .attr("y", 112)
        .attr("transform", "rotate(0)")
        .attr("width", 2)
        .attr("height", 15)
        .style("fill", "steelblue");

    brake_focus.append("rect")
        .attr("class", "background")
        .attr("x", 5)
        .attr("y", 140)
        .attr("transform", "rotate(0)")
        .attr("width", 105)
        .attr("height", 20)
        .style("fill", "grey");

    brake_focus.append("rect")
        .attr("class", "value-ref")
        .attr("x", 5)
        .attr("y", 142)
        .attr("transform", "rotate(0)")
        .attr("width", 2)
        .attr("height", 15)
        .style("fill", "red");
    console.log("draw subinfo before text");

    brake_focus.append("text").attr("class", "brake_value")
        .attr("x", 115).attr("y", 125)
        .text("");
    brake_focus.append("text").attr("class", "brake-ref_value")
        .attr("x", 115).attr("y", 155)
        .text("");
    brake_focus.append("text")
        .attr("x", 5)
        .attr("y", 100)
        .text("BRAKE");
    console.log("draw subinfo finish brake");

    // Gas
    var gas_focus = sub_svg.append("g")
        .attr("id", "gas_focus1")
        // .attr("transform", "translate(0, 250)");
    gas_focus.append("rect")
        .attr("class", "background")
        .attr("x", 5)
        .attr("y", 185)
        .attr("transform", "rotate(0)")
        .attr("width", 105)
        .attr("height", 20)
        .style("fill", "grey");

    gas_focus.append("rect")
        .attr("class", "value")
        .attr("x", 5)
        .attr("y", 187)
        .attr("transform", "rotate(0)")
        .attr("width", 1)
        .attr("height", 15)
        .style("fill", "steelblue");

    gas_focus.append("rect")
        .attr("class", "background")
        .attr("x", 5)
        .attr("y", 215)
        .attr("transform", "rotate(0)")
        .attr("width", 105)
        .attr("height", 20)
        .style("fill", "grey");

    gas_focus.append("rect")
        .attr("class", "value-ref")
        .attr("x", 5)
        .attr("y", 217)
        .attr("transform", "rotate(0)")
        .attr("width", 1)
        .attr("height", 15)
        .style("fill", "red");

    gas_focus.append("text").attr("class", "gas_value")
        .attr("x", 115).attr("y", 200)
        .text("test");
    gas_focus.append("text").attr("class", "gas-ref_value")
        .attr("x", 115).attr("y", 230)
        .text("test");
    gas_focus.append("text")
        .attr("x", 5)
        .attr("y", 175)
        .text("GAS");

    // Gear
    var gear_focus = sub_svg.append("g")
        .attr("id", "gear_focus1")
        // .attr("transform", "translate(360, 0)");

    gear_focus.append("text")
        .attr("class", "value")
        .attr("x", 30)
        .attr("y", 280)
        .style("font-size", "25px")
        .style("fill", "steelblue")
        .text("0");

    gear_focus.append("text")
        .attr("class", "value-ref")
        .attr("x", 60)
        .attr("y", 280)
        .style("font-size", "25px")
        .style("fill", "red")
        .text("0");

    gear_focus.append("text")
        .attr("x", 5)
        .attr("y", 250)
        .text("GEAR");

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
        .attr("class", "background")
        .attr("x", -30)
        .attr("y", -111)
        .attr("transform", "rotate(180)")
        .attr("width", 20)
        .attr("height", 105)
        .style("fill", "grey");

    brake_focus.append("rect")
        .attr("class", "value")
        .attr("x", -25)
        .attr("y", -110)
        .attr("transform", "rotate(180)")
        .attr("width", 10)
        .attr("height", 1)
        .style("fill", "steelblue");

    brake_focus.append("text")
        .text("Brake: ");


    // Gas
    var gas_focus = sub_svg.append("g")
        .attr("id", "gas_focus1")
        .attr("transform", "translate(240, 0)");

    gas_focus.append("rect")
        .attr("class", "background")
        .attr("x", -30)
        .attr("y", -111)
        .attr("transform", "rotate(180)")
        .attr("width", 20)
        .attr("height", 105)
        .style("fill", "grey");

    gas_focus.append("rect")
        .attr("class", "value")
        .attr("x", -25)
        .attr("y", -110)
        .attr("transform", "rotate(180)")
        .attr("width", 10)
        .attr("height", 1)
        .style("fill", "steelblue");

    gas_focus.append("text")
        .text("Gas: ");

    // Gear
    var gear_focus = sub_svg.append("g")
        .attr("id", "gear_focus1")
        .attr("transform", "translate(360, 0)");

    gear_focus.append("text")
        .attr("class", "value")
        .attr("x", 0)
        .attr("y", 65)
        .style("font-size", "25px")
        .style("fill", "steelblue")
        .text("0");

    gear_focus.append("text")
        .text("Gear");


}

function mousemove_twoLaps() {

    var x_value = x.invert(d3.mouse(this)[0]);
    var x_value_from_origin = 0;
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
        var ty = y.get(this);
        x_value_from_origin = d.values[index].x;
        return "translate(" + x(d.values[index].x) + "," + ty(d.values[index].feature_val) + ")";

    });

    focuses.selectAll("text")
        .text( function (d) { return +d.values[index].feature_val.toFixed(3); });

    focuses.selectAll("line.tooltip_line").attr("transform", function(d){
        index = bisect(d.values, x_value, 0, d.values.length -1);
        return "translate(" + x(d.values[index].x) + "," + height +")";

    });
    var plot_focuses = d3.select("#canvas").selectAll("svg")
        .selectAll("text.plot_info_focus");
    plot_focuses.text(function (d){ return +d.values[index].feature_val.toFixed(3); });




    // ********** reference lap focus **************
    var ref_index = 0;
    var ref_focuses = d3.select("#canvas").selectAll("svg")
        .selectAll(".focus-ref");
    ref_focuses.style("display", null);

    ref_focuses.selectAll(".chart_tooltip-ref").attr("transform", function(d){
        ref_index = bisect(d.ref_values, x_value, 0, d.ref_values.length -1);
        var ty = y.get(this);
        return "translate(" + x(d.ref_values[ref_index].x) + "," + ty(d.ref_values[ref_index].feature_val) + ")";

    });

    ref_focuses.selectAll("text.chart_tooltip-ref")
        .text( function (d) {
            return +d.ref_values[ref_index].feature_val.toFixed(3);
        });
    var ref_plot_focuses = d3.select("#canvas").selectAll("svg")
        .selectAll("text.plot_info_focus-ref");
    ref_plot_focuses.text(function (d){ return +d.ref_values[ref_index].feature_val.toFixed(3); });


    // ****************** moving Track *********************** //
    var track_focus = d3.select("#track_focus1");
    track_focus.attr("transform", "translate(" + track_x(merged_track_data.origin[index].long) + "," + track_y(merged_track_data.origin[index].lat) + ")");

    var ref_track_focus = d3.select("#track_focus1-ref");
    ref_track_focus .attr("transform", "translate(" + track_x(merged_track_data.ref[ref_index].long) + "," + track_y(merged_track_data.ref[ref_index].lat) + ")");

    // ****************** handle Steering, Brake, Gas, Gear ****************//
    // rotate by steering value
    var steer_focus = d3.select("#steer_focus1");
    steer_focus.select("image.steer")
        .attr("transform", "scale(0.5), translate(0, 50), rotate(" + steer_data[index] + ", 35, 35)")
    steer_focus.select("text.steer_value")
        .text(steer_data[index].toFixed(3));

    steer_focus.select("image.steer-ref")
        .attr("transform", "scale(0.5), translate(130, 50), rotate(" + ref_steer_data[ref_index] + ", 35, 35)")
    steer_focus.select("text.steer-ref_value")
        .text(ref_steer_data[ref_index].toFixed(3));



    var brake_focus = d3.select("#brake_focus1");
    brake_focus.select("rect.value")
        .attr("width", 1+ brake_data[index]);
    brake_focus.select("text.brake_value")
        .text(brake_data[index].toFixed(3));
    brake_focus.select("rect.value-ref")
        .attr("width", 1+ ref_brake_data[ref_index]);
    brake_focus.select("text.brake-ref_value")
        .text(ref_brake_data[ref_index]);

    var gas_focus = d3.select("#gas_focus1");
    gas_focus.select("rect.value")
        .attr("width", 1+gas_data[index]);
    gas_focus.select("text.gas_value")
        .text(gas_data[index]);

    gas_focus.select("rect.value-ref")
        .attr("width", 1+ref_gas_data[ref_index]);
    gas_focus.select("text.gas-ref_value")
        .text(ref_gas_data[ref_index]);

    var gear_focus = d3.select("#gear_focus1");
    gear_focus.select("text.value")
        .text(gear_data[index])
    gear_focus.select("text.value-ref")
        .text(ref_gear_data[ref_index]);

}

function mousemove(){

    var x_value = x.invert(d3.mouse(this)[0]);
    var x_value_from_origin = 0;
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
        var ty = y.get(this);

        return "translate(" + x(d.values[index].x) + "," + ty(d.values[index].feature_val) + ")";

    });

    focuses.selectAll("text")
        .text( function (d) { return +d.values[index].feature_val.toFixed(3); });

    focuses.selectAll("line.tooltip_line").attr("transform", function(d){

        return "translate(" + x(d.values[index].x) + "," + height +")";

    });



    // ************* moving Track ************* //
    var track_focus = d3.select("#track_focus1");
    track_focus.attr("transform", "translate(" + track_x(track_data[index].long) + "," + track_y(track_data[index].lat) + ")");



    // ************* handle Steering, Brake, Gas, Gear ******************* //

    // rotate by steering value
    var steer_focus = d3.select("#steer_focus1");
    steer_focus.select("image")
        .attr("transform", "translate(0, 25), rotate(" + steer_data[index] + ", 35, 35)");
    steer_focus.select("text")
        .text("Steering degree: " + steer_data[index]);

    var brake_focus = d3.select("#brake_focus1");
    brake_focus.select("rect.value")
        .attr("height", 1+ brake_data[index]);
    brake_focus.select("text")
        .text("Brake: " + brake_data[index]);

    var gas_focus = d3.select("#gas_focus1");
    gas_focus.select("rect.value")
        .attr("height", 1+gas_data[index]);
    gas_focus.select("text")
        .text("Gas: " + gas_data[index]);

    var gear_focus = d3.select("#gear_focus1");
    gear_focus.select("text.value")
        .text(gear_data[index])

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
            if(vis_type == 2)
                addChart_withTwoLaps(value);
            else
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
        }
    }
}



function addChart_withTwoLaps(id) {

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
        .attr("width", width + margin.left + margin.right  + margin_for_plot_info)
        .attr("height", height + margin.bottom + margin.top)
        .append("g")
        .attr("id", function (d) {
            return d.id.split(" ")[0];
            // return d.id.replace(/\s/g, ''); // regx, remove space for setting id
        })
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .each(function (d) {

            var origin_y0 = d3.extent(d.values, function(c) { return +c.feature_val;});
            var ref_y0 = d3.extent(d.ref_values, function(c) { return +c.feature_val;});

            var union_y0 = d3.extent(_.union(origin_y0, ref_y0));
            var ty = y.set(this, d3.scaleLinear()
                .range([height, 0]))
            // local feature에 대한 y range setting
                .domain(union_y0);

            line.set(this, d3.line().curve(d3.curveBasis)
                .x(function(c){ return x(c.x);})
                .y(function(c){ return ty(c.feature_val); }));

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

    // ************* draw each path line (ref Lap 먼저, 다음 origin Lap) *********************//
    svg.append("path")
        .attr("class", "line ref")
        .attr("d", function(d) { return line.get(this)(d.ref_values); })
        .attr("clip-path", function (d) {
            return "url(#clip_" + d.id.split(" ")[0] + ")";
        });

    svg.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line.get(this)(d.values); })
        .attr("clip-path", function (d) {
            return "url(#clip_" + d.id.split(" ")[0] + ")";
        });

    svg.append("text")
        .attr("y", height - 50)
        .attr("x", 10)
        .text(function(d) { return d.id; });

    // ************* Append plot detail info *********************//
    svg.append("text")
        .attr("class", "plot_info_focus")
        .attr("y", height*0.1)
        .attr("x", width + margin_for_plot_info*0.1 )
        .style("fill", "steelblue")
        .style("font-size", "15px")
        .text("origin");

    svg.append("text")
        .attr("class", "plot_info_focus_max")
        .attr("y", height*0.1 + 25)
        .attr("x", width + margin_for_plot_info*0.1 )
        .style("fill", "steelblue")
        .style("font-size", "12px")
        .text("max");
    // .text(function(d){ return d.origin_max.toFixed(3); });

    svg.append("text")
        .attr("class", "plot_info_focus_min")
        .attr("y", height*0.1 + 50  )
        .attr("x", width + margin_for_plot_info*0.1 )
        .style("fill", "steelblue")
        .style("font-size", "12px")
        .text("min");
    // .text(function(d){ return d.origin_min.toFixed(3); });

    svg.append("text")
        .attr("class", "plot_info_focus-ref")
        .attr("y", height*0.1)
        .attr("x", 10+width + margin_for_plot_info/2)
        .style("fill", "red")
        .style("font-size", "15px")
        .text("ref");

    svg.append("text")
        .attr("class", "plot_info_focus_max-ref")
        .attr("y", height*0.1 + 25)
        .attr("x", 10+width + margin_for_plot_info/2)
        .style("fill", "red")
        .style("font-size", "12px")
        .text("max");
    // .text(functio?n(d){ return d.ref_max.toFixed(3); });

    svg.append("text")
        .attr("class", "plot_info_focus_min-ref")
        .attr("y", height*0.1 + 50  )
        .attr("x", 10+width + margin_for_plot_info/2)
        .style("fill", "red")
        .style("font-size", "12px")
        .text("min");


    // ************** x axis, y axis 생성 ************************ //
    var origin_y0 = d3.extent(target_data.values, function(c) { return +c.feature_val;});
    var ref_y0 = d3.extent(target_data.ref_values, function(c) { return +c.feature_val;});

    var union_y0 = d3.extent(_.union(origin_y0, ref_y0));
    var y_range = d3.scaleLinear()
        .range([height, 0])
        .domain(union_y0);

    svg.append("g")
        .call(d3.axisLeft(y_range).ticks(3));

    // *** x axis **** //
    svg.append("g")
        .call(xAxis)
        .attr("id", "x-axis")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + 0 + "," + height + ")");

    // 마지막 line x-axis에 맞추기.
    var foc_lines = document.getElementsByClassName("tooltip_line");
    for (var i =0; i<foc_lines.length-1; i++){
        foc_lines[i].setAttribute("y2", height);
    }
    foc_lines[foc_lines.length - 1].setAttribute("y2", 0);

    // ***  chart title ***
    svg.append("text")
        .attr("y", height - 50)
        .attr("x", 10)
        .text(id);

    // ************** tooltip 생성 ************************ //
    // ******** origin tooltip ********** //
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
        .style("fill", "steelblue")
        .text("nothing");

    // append x line.
    focus.append("line")
        .attr("class", "tooltip_line")
        .style("stroke", "#fff")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.9)
        .attr("y1", -height)
        .attr("y2", height);

    // ******** reference tooltip ********** //
    var ref_focus = svg.append("g")
        .attr("class", "focus-ref")
        .style("display", "none");

    // append the circle at the interaction
    ref_focus.append("circle")
        .attr("class", "chart_tooltip-ref")
        .attr("r", 4.5);
    // place the value at the interaction
    ref_focus.append("text")
        .attr("class", "chart_tooltip-ref")
        .attr("x", 9)
        .attr("dy", ".35em")
        .style("fill", "red")
        .text("nothing");



    // **************** Init mouse event, zoom brush, zoom brush on Chart ********** //
    // append the rectangle to capture mouse
    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent");

    // ************ brush on chart 추가 ***************
    svg.append("g")
        .attr("class", "chartBrush")
        .call(brush_onChart);

    // ************ Enable to work mouse hovering ***************
    d3.select("#canvas").selectAll(".overlay")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mousemove", mousemove_twoLaps);




    // ************ set the all circles as invisible ************//
    d3.select("#canvas").selectAll("svg")
        .selectAll(".focus")
        .style("display", "none");
    d3.select("#canvas").selectAll("svg")
        .selectAll(".focus-ref")
        .style("display", "none");


    d3.select("#zoom_canvas").select("g.brush").call(brush.move, current_zoomRange);

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

    d3.select("#canvas").selectAll(".overlay")
        .on("mouseover", function() { focus.style("display", null); })
        // .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);


    // set the all circles as invisible
    var focuses = d3.select("#canvas").selectAll("svg")
        .selectAll(".focus");
    focuses.style("display", "none");


}


function removeChart(id, index) {

    var target_id = "g#" + id.split(" ")[0];
    
    // svg 제거 (g+id)의 parent => SVG
    d3.select(target_id)
        .select(function() { return this.parentNode; })
        .remove();

    // 만약 제거하려는 차트가 마지막 index의 svg일 경우 차트 없앤 뒤에 새로운 x axis생성
    if(index == selected_features.length-1 && (selected_features.length-1) != 0){
        d3.select("g#" + selected_features[index-1].id.split(" ")[0])
            .append("g")
            .call(xAxis)
            .attr("id", "x-axis")
            .attr("transform", "translate(" + 0 + "," + height + ")");

    }

    // selected_features의 길이가 1보다 클 경우(마지막 남은 svg를 지웠다면 이부분은 의미없음) -> 마지막 line x-axis에 맞추기.
    if (selected_features.length > 1){
        var foc_lines = document.getElementsByClassName("tooltip_line");
        for (var i =0; i<foc_lines.length-1; i++){
            foc_lines[i].setAttribute("y2", height);
        }
        foc_lines[foc_lines.length - 1].setAttribute("y2", 0);
    }

    // 해당 index의 element 삭제.
    selected_features.splice(index, 1);
}


function setBtnState() {
    if(root_x == "PositionIndex"){
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
        document.getElementById("loading").style.display = "block";
        console.log("type is different, change the axis");
        root_x = axis_type.value;
        clearAllSVG_for_xAxis_switch();
        init(vis_type);

    }
}

function clearAllSVG_for_xAxis_switch() {

    d3.select("#zoom_canvas").select("svg").remove();
    d3.select("#canvas").selectAll("svg").remove();
    d3.select("#track_canvas").selectAll("svg").remove();
    d3.select("#sub_canvas").selectAll("svg").remove();
    animation_range = [];
    animation_index = 0;
}

function clearAllSVG() {

    d3.select("#zoom_canvas").select("svg").remove();
    d3.select("#canvas").selectAll("svg").remove();
    d3.select("#track_canvas").selectAll("svg").remove();
    d3.select("#sub_canvas").selectAll("svg").remove();

    // data clean
    animation_range = [];
    animation_index = 0;
    steer_data = [], brake_data = [], gas_data = [], gear_data = [];
    track_data = [], inline_track = [], outline_track = [];
    all_features= [], selected_features = [];
}




















function draw_ref_LineGraph(){

    ref_selected_features.forEach(function (ref_data){

        // g select (origin data)
        var ref_graph_svg = d3.select("g#"+ref_data.id).select( function() { return this.parentNode; });


        // parent node(svg) select, and add clipPath
        ref_graph_svg
            .append("defs").append("clipPath")
            .attr("id",  function (d) {
                return "clip_ref-" + d.id;
            })
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        ref_graph_svg
            .data([ref_data])
            .append("g")
            .attr("id", function (d) {
                console.log(d);
                return "ref-" + d.id;
            })
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            // path append
            .append("path")
            .attr("class", "line ref")
            .attr("d", function(d) {

                var ty = y.set(this, d3.scaleLinear()
                    .range([height, 0]))
                // local feature에 대한 y range setting
                    .domain([
                        d3.min(d.values, function(c) { return c.feature_val; }),
                        d3.max(d.values, function(c) { return c.feature_val; }) ]);

                line.set(this, d3.line().curve(d3.curveBasis)
                    .x(function(d){ return x(d.x); })
                    .y(function(d){ return ty(d.feature_val); }));

                return line.get(this)(d.values);
            })
            .attr("clip-path", function (d) {
                return "url(#clip_ref-" + ref_data.id + ")";
            })

        var focus = d3.select("g#ref-"+ref_data.id)
            .append("g")
            .attr("class", "focus-ref")
            .style("display", "none");

        // append the circle at the interaction
        focus.append("circle")
            .attr("class", "chart_tooltip-ref")
            .attr("r", 4.5);
        // place the value at the interaction
        focus.append("text")
            .attr("class", "chart_tooltip-ref")
            .attr("x", 9)
            .attr("dy", ".35em")
            .style("fill", "red")
            .text("nothing");


    });
}