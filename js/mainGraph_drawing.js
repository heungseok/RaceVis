/**
 * Created by totor on 2017-06-11.
 */

function drawLineGraph_withTwoLaps() {
    // console.log(merged_selected_features);
    console.log(selected_features);
    /*************************** DRAWING CHART ******************************/
    svg = d3.select("#canvas").selectAll("svg")
        .data(selected_features)
        .enter()
        // for responsive charts //
        .append("div").classed("svg-container.line-chart", true) // container class to make it responsive
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet") // responsive SVG needs these 2 attributes and no width and height attr
        .attr("viewBox","0 0 " + (width+margin.left+margin.right+margin_for_plot_info)
            + " " + (height+margin.bottom+margin.top))
        .classed("svg-content-responsive", true) // class to make it responsive
        // for non-responsive chart //
        // .attr("width", width + margin.left + margin.right + margin_for_plot_info)
        // .attr("height", height + margin.bottom + margin.top)
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
        .attr("x", additional_margin+width + margin_for_plot_info*0.1 +20)
        .style("fill", COLOR_ORIGIN)
        .style("font-size", "15px")
        .text("origin");

    // svg.append("image")
    //     .attr("class", "plot_info_focus_max_arrow")
    //     .attr("height", 20).attr("width", 20)
    //     .attr("xlink:href", "./img/arrow_origin.png")
    //     .attr("transform", "translate(" + (width+additional_margin) + ", " + (height*.225) + ")")

    svg.append("text")
        .attr("class", "plot_info_focus_max glyphicon")
        .attr("y", height*0.1 + 25)
        .attr("x", additional_margin+width + margin_for_plot_info*0.1 )
        .style("fill", COLOR_ORIGIN)
        .style("font-size", "12px")
        .text("max");
    // .text(function(d){ return d.origin_max.toFixed(3); });

    // svg.append("image")
    //     .attr("class", "plot_info_focus_min_arrow")
    //     .attr("height", 20).attr("width", 20)
    //     .attr("xlink:href", "./img/arrow_origin(rev).png")
    //     .attr("transform", "translate(" + (width+additional_margin) + ", " + (height*.6) + ")")

    svg.append("text")
        .attr("class", "plot_info_focus_min glyphicon")
        .attr("y", height*0.1 + 50  )
        .attr("x", additional_margin+width + margin_for_plot_info*0.1 )
        .style("fill", COLOR_ORIGIN)
        .style("font-size", "12px")
        .text("min");
    // .text(function(d){ return d.origin_min.toFixed(3); });

    svg.append("text")
        .attr("class", "plot_info_focus-ref")
        .attr("y", height*0.1)
        .attr("x", additional_margin+width + margin_for_plot_info*0.5 +20)
        .style("fill", COLOR_REF)
        .style("font-size", "15px")
        .text("ref");

    svg.append("text")
        .attr("class", "plot_info_focus_max-ref glyphicon")
        .attr("y", height*0.1 + 25)
        .attr("x", additional_margin+width + margin_for_plot_info*0.5)
        .style("fill", COLOR_REF)
        .style("font-size", "12px")
        .text("max");
    // .text(functio?n(d){ return d.ref_max.toFixed(3); });

    // svg.append("image")
    //     .attr("class", "plot_info_focus_max_arrow")
    //     .attr("height", 20).attr("width", 20)
    //     .attr("xlink:href", "./img/arrow_ref.png")
    //     .attr("transform", "translate(" + (width+additional_margin+margin_for_plot_info*.4) + ", " + (height*.225) + ")")

    svg.append("text")
        .attr("class", "plot_info_focus_min-ref glyphicon")
        .attr("y", height*0.1 + 50)
        .attr("x", additional_margin+width + margin_for_plot_info*0.5)
        .style("fill", COLOR_REF)
        .style("font-size", "12px")
        .text("min");
    // .text(function(d){ return d.ref_min.toFixed(3); });

    // svg.append("image")
    //     .attr("class", "plot_info_focus_max_arrow")
    //     .attr("height", 20).attr("width", 20)
    //     .attr("xlink:href", "./img/arrow_ref(rev).png")
    //     .attr("transform", "translate(" + (width+additional_margin+margin_for_plot_info*.4) + ", " + (height*.6) + ")")


    // ************* Append x-axis, y-axis *********************//
    // append text label
    svg.append("text")
        .attr("class", "chart_label")
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
            .attr("class", "axis axis--y")
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
        .style("fill", COLOR_ORIGIN)
        .text("nothing");

    // append x line.
    focus.append("line")
        .attr("class", "tooltip_line")
        .style("stroke", "#fff")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.9)
        .attr("y1", -height)
        .attr("y2", height);


    // ******** init x axis value tooltip ******** //
    focus.append("text")
        .attr("class", "chart_tooltip-x_value")
        .attr("x", -50)
        .attr("dy", ".35em")
        .style("fill", "white")
        .text("");


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
        .style("fill", COLOR_REF)
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
        .append("div").classed("svg-container.line-chart", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width+margin.left+margin.right+margin_for_plot_info)
                + " " + (zoom_height+zoom_margin.bottom+zoom_margin.top))
        .classed("svg-content-responsive", true)
        // .attr("width", zoom_width + zoom_margin.left + zoom_margin.right)
        // .attr("height", zoom_height + zoom_margin.top + zoom_margin.bottom)
        .append("g")
        .attr("transform", "translate(" + zoom_margin.left + "," + zoom_margin.top + ")")

    context = zoom_svg.append("g")
        .attr("class", "context");

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + 0+ "," + zoom_height + ")")
        .call(zoom_xAxis);

    context.append("g")
        .attr("class", "brush")
        .attr("id", "overall_brush")
        .call(brush)
        .call(brush.move, x.range()); // 이걸로 초기 zoom range를 x.range()로 setting함. 없애면 brush 안보임.

    context.append("text")
        .attr("id", "time-delta-value")
        .attr("x", 0)
        .attr("y", zoom_height/2)
        .attr("dy", ".35em")
        .style("fill", "white")
        .text("Time delta");



    // 마지막으로 mouse over effect 활성, 마지막에 선언함으로서 chart위에 brush와 겹치면서 잘 동작될 수 있음.
    d3.select("#canvas").selectAll(".overlay")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mousemove", mousemove_twoLaps);

}

function drawTrack_withTwoLaps(){

    /*************************** DRAWING TRACK ******************************/
    // range of track x, y (Longitude, Latitude) setting
    var origin_x0 = d3.extent(merged_track_data.origin, function(d) { return d.long; });
    var ref_x0 = d3.extent(merged_track_data.ref, function(d) { return d.long; });
    var inline_x0 = d3.extent(merged_track_data.inline, function(d) { return d.long; });
    var outline_x0 = d3.extent(merged_track_data.outline, function(d) { return d.long; });
    var centerline_x0 = d3.extent(merged_track_data.centerline, function(d) { return d.long; });

    var union_x0 = d3.extent(_.union(origin_x0, ref_x0, inline_x0, outline_x0, centerline_x0));
    console.log(union_x0);
    console.log(union_x0[1] - union_x0[0]);
    var abs_x_range = union_x0[1] - union_x0[0];

    var origin_y0 = d3.extent(merged_track_data.origin, function(d) { return d.lat; });
    var ref_y0 = d3.extent(merged_track_data.ref, function(d) { return d.lat; });
    var inline_y0 = d3.extent(merged_track_data.inline, function(d) { return d.lat; });
    var outline_y0 = d3.extent(merged_track_data.outline, function(d) { return d.lat; });
    var centerline_y0 = d3.extent(merged_track_data.centerline, function(d) { return d.lat; });

    var union_y0 = d3.extent(_.union(origin_y0, ref_y0, inline_y0, outline_y0, centerline_y0));
    console.log(union_y0);
    console.log(union_y0[1] - union_y0[0]);

    var abs_y_range = union_y0[1] - union_y0[0];

    track_y = d3.scaleLinear().range([track_height, 0])
        .domain(union_y0);

    track_x = d3.scaleLinear().range([0, abs_x_range *track_height / abs_y_range ])
        .domain(union_x0);

    // setting svg for drawing track
    track_svg = d3.select("#track_canvas")
        .append("div").classed("svg-container.main-track", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (track_width + track_margin.left + track_margin.right)
            + " " + (track_height + track_margin.top + track_margin.bottom))
        .classed("svg-content-responsive", true)
        .attr("transform",
            "translate(" + track_margin.left + "," + track_margin.top + ")")
        // .attr("width", track_width + track_margin.left + track_margin.right)
        // .attr("height", track_height + track_margin.top + track_margin.bottom)
        .append("g")
        .attr("id", "main_track_lines_wrapper")
        .attr("transform", transform_track_byTrackType);


    // *************** Append track line path :***************//

    // draw inline, outline track boundary first
    track_svg.append("path")
        .data([merged_track_data.inline])
        .attr("class", "line boundary inline")
        .attr("d", track_line)
        .style("stroke-width", track_boundary_width[TRACK_TYPE]);


    track_svg.append("path")
        .data([merged_track_data.outline])
        .attr("class", "line boundary outline")
        .attr("d", track_line)
        .style("stroke-width", track_boundary_width[TRACK_TYPE]);


    // draw track line, ref line & focus element (circle)
    track_svg.append("path")
        .data([merged_track_data.ref])
        .attr("class", "line ref")
        .attr("d", track_line)
        .style("stroke-width", track_line_width[TRACK_TYPE]);

    var ref_track_focus = track_svg.append("g")
        .attr("id", "track_focus1-ref");
    ref_track_focus.append("circle")
        .attr("r", 4.5);

    track_svg.append("path")
        .data([merged_track_data.origin])
        .attr("class", "line")
        .attr("d", track_line)
        .style("stroke-width", track_line_width[TRACK_TYPE]);

    var track_focus = track_svg.append("g")
        .attr("id", "track_focus1");
    track_focus.append("circle")
        .attr("r", 4.5);

    // ********** Init track zoom ************ //
    d3.select("#track_canvas").call(trackZoom);

    // panning the track to 25% of the width
    // d3.select("#track_canvas").call(trackZoom.transform, d3.zoomIdentity
    //     .translate(track_width/4, 0));


    // *************************** Draw Navigation Track *************************** //
    var width_ratio = nav_track_width/track_width;
    nav_track_x = d3.scaleLinear().range([0, abs_x_range *(nav_track_height*width_ratio) / abs_y_range ])
        .domain(union_x0);
    nav_track_y = d3.scaleLinear().range([(nav_track_height*width_ratio), 0])
        .domain(union_y0);

    // setting svg for drawing track
    nav_track_svg = d3.select("#track_nav_canvas")
        .append("div").classed("svg-container.main-track", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (nav_track_width + nav_track_margin.left + nav_track_margin.right)
            + " " + (nav_track_height + nav_track_margin.top + nav_track_margin.bottom))
        .classed("svg-content-responsive", true)
        // .append("svg")
        // .append("svg")
        // .attr("width", nav_track_width + nav_track_margin.left + nav_track_margin.right)
        // .attr("height", nav_track_height + nav_track_margin.top + nav_track_margin.bottom)
        .attr("transform", "translate(" + nav_track_width*0.1 + "," + nav_track_height/5 + ") scale(1.5)")
        .append("g")
        .attr("transform", transform_nav_track_byTrackType);




    // *************** Append track line path :***************//
    // draw inline, outline track boundary first
    nav_track_svg.append("path")
        .data([merged_track_data.inline])
        .attr("class", "line boundary inline")
        .attr("d", nav_track_line);

    nav_track_svg.append("path")
        .data([merged_track_data.outline])
        .attr("class", "line boundary outline")
        .attr("d", nav_track_line);


}



function drawSubInfo_withTwoLaps() {
    console.log("draw subinfo");
    /******************** Drawing Sub Info ****************************/
    // setting svg for drawing track
    sub_svg = d3.select("#sub_canvas")
        // for responsive chart //
        .append("div").classed("svg-container.sub-info", true) // container class to make it responsive
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet") // responsive SVG needs these 2 attributes and no width and height attr
        .attr("viewBox","0 0 " + (sub_width + sub_margin.left + sub_margin.right)
            + " " + (sub_height + sub_margin.top + sub_margin.bottom))
        .classed("svg-content-responsive", true) // class to make it responsive
        // for non-responsive chart //
        // .append("svg")
        // .attr("width", sub_width + sub_margin.left + sub_margin.right)
        // .attr("height", sub_height + sub_margin.top + sub_margin.bottom)

        .append("g")
        .attr("transform",
            "translate(" + sub_margin.left + "," + sub_margin.top + ")");

    // FOCUS position vars
    var text_x_pos = 0;
    var font_size = "18px";

    // ***************** FOCUS SVGs ****************** //
    // steering
    var steering_focus = sub_svg.append("g")
        .attr("id", "steer_focus1")

    steering_focus.append("image")
        .attr("class", "steer")
        .attr("height", 80).attr("width", 80)
        .attr("xlink:href", "./img/steer_origin.png")
        .attr("transform", "scale(0.5), translate(150, 50)")


    steering_focus.append("image")
        .attr("class", "steer-ref")
        .attr("height", 80).attr("width", 80)
        .attr("xlink:href", "./img/steer_ref.png")
        .attr("transform", "scale(0.5), translate(250, 50)")


    steering_focus.append("text")
        .attr("x", text_x_pos)
        .attr("y", 40)
        .style("font-size", font_size)
        .text("STR");
    steering_focus.append("text").attr("class", "steer_value")
        .attr("x", text_x_pos).attr("y", 60)
        .style("font-size", font_size)
        .style("fill", "WhiteSmoke")
        .text("0.00");

    // ******** Brake ********* //
    var brake_focus = sub_svg.append("g")
        .attr("id", "brake_focus1")
        .attr("transform", "translate(0, 0)");

    var brake_focus_rect_y = 85;

    brake_focus.append("rect")
        .attr("class", "background")
        .attr("x", 70)
        .attr("y", brake_focus_rect_y)
        .attr("transform", "rotate(0)")
        .attr("width", 105)
        .attr("height", 20)
        .style("fill", "grey");

    brake_focus.append("rect")
        .attr("class", "value")
        .attr("x", 70)
        .attr("y", brake_focus_rect_y+2)
        .attr("transform", "rotate(0)")
        .attr("width", 2)
        .attr("height", 15)
        .style("fill", COLOR_ORIGIN);

    brake_focus.append("rect")
        .attr("class", "background")
        .attr("x", 70)
        .attr("y", brake_focus_rect_y+30)
        .attr("transform", "rotate(0)")
        .attr("width", 105)
        .attr("height", 20)
        .style("fill", "grey");

    brake_focus.append("rect")
        .attr("class", "value-ref")
        .attr("x", 70)
        .attr("y", brake_focus_rect_y+30+2)
        .attr("transform", "rotate(0)")
        .attr("width", 2)
        .attr("height", 15)
        .style("fill", COLOR_REF);

    brake_focus.append("text")
        .attr("x", text_x_pos)
        .attr("y", 105)
        .style("font-size", font_size)
        .text("BRK");
    brake_focus.append("text").attr("class", "brake_value")
        .attr("x", text_x_pos).attr("y", 125)
        .style("font-size", font_size)
        .style("fill", "WhiteSmoke")
        .text("0.00");

    // ******** Gas ******** //
    var gas_focus = sub_svg.append("g")
        .attr("id", "gas_focus1")
        // .attr("transform", "translate(0, 250)");

    var gas_focus_rect_y = brake_focus_rect_y + 70;
    gas_focus.append("rect")
        .attr("class", "background")
        .attr("x", 70)
        .attr("y", gas_focus_rect_y)
        .attr("transform", "rotate(0)")
        .attr("width", 105)
        .attr("height", 20)
        .style("fill", "grey");

    gas_focus.append("rect")
        .attr("class", "value")
        .attr("x", 70)
        .attr("y", gas_focus_rect_y+2)
        .attr("transform", "rotate(0)")
        .attr("width", 1)
        .attr("height", 15)
        .style("fill", COLOR_ORIGIN);

    gas_focus.append("rect")
        .attr("class", "background")
        .attr("x", 70)
        .attr("y", gas_focus_rect_y+30)
        .attr("transform", "rotate(0)")
        .attr("width", 105)
        .attr("height", 20)
        .style("fill", "grey");

    gas_focus.append("rect")
        .attr("class", "value-ref")
        .attr("x", 70)
        .attr("y", gas_focus_rect_y+30+2)
        .attr("transform", "rotate(0)")
        .attr("width", 1)
        .attr("height", 15)
        .style("fill", COLOR_REF);

    gas_focus.append("text")
        .attr("x", text_x_pos)
        .attr("y", 175)
        .style("font-size", font_size)
        .text("ACC");
    gas_focus.append("text").attr("class", "gas_value")
        .attr("x", text_x_pos).attr("y", 195)
        .style("font-size", "20px")
        .style("fill", "WhiteSmoke")
        .text("0.00");


    // ******** Gear ******** //
    var gear_focus = sub_svg.append("g")
        .attr("id", "gear_focus1")
        // .attr("transform", "translate(360, 0)");

    var gear_focus_y = 240;

    gear_focus.append("text")
        .attr("class", "value")
        .attr("x", 100)
        .attr("y", gear_focus_y)
        .style("font-size", font_size)
        .style("fill", COLOR_ORIGIN)
        .text("");

    gear_focus.append("text")
        .attr("class", "value-ref")
        .attr("x", 130)
        .attr("y", gear_focus_y)
        .style("font-size", font_size)
        .style("fill", COLOR_REF)
        .text("");

    gear_focus.append("text")
        .attr("x", text_x_pos)
        .attr("y", gear_focus_y)
        .style("font-size", font_size)
        .text("GEAR");


    // ******** RPM ******** //
    var rpm_focus = sub_svg.append("g")
        .attr("id", "rpm_focus1")
    // .attr("transform", "translate(360, 0)");
    var rpm_focus_y = gear_focus_y + 32;

    rpm_focus.append("text")
        .attr("class", "value")
        .attr("x", 70)
        .attr("y", rpm_focus_y)
        .style("font-size", font_size)
        .style("fill", COLOR_ORIGIN)
        .text("");

    rpm_focus.append("text")
        .attr("class", "value-ref")
        .attr("x", 140)
        .attr("y", rpm_focus_y)
        .style("font-size", font_size)
        .style("fill", COLOR_REF)
        .text("");

    rpm_focus.append("text")
        .attr("x", text_x_pos)
        .attr("y", rpm_focus_y)
        .style("font-size", font_size)
        .text("RPM");


    // ******** RPM ******** //
    var speed_focus = sub_svg.append("g")
        .attr("id", "speed_focus1")

    var speed_focus_y = gear_focus_y + 32*2;

    speed_focus.append("text")
        .attr("class", "value")
        .attr("x", 70)
        .attr("y", speed_focus_y)
        .style("font-size", font_size)
        .style("fill", COLOR_ORIGIN)
        .text("");

    speed_focus.append("text")
        .attr("class", "value-ref")
        .attr("x", 140)
        .attr("y", speed_focus_y)
        .style("font-size", font_size)
        .style("fill", COLOR_REF)
        .text("");

    speed_focus.append("text")
        .attr("x", text_x_pos)
        .attr("y", speed_focus_y)
        .style("font-size", font_size)
        .text("SPEED");

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

    // control xAxis value
    focuses.select("text.chart_tooltip-x_value")
        .text(function(d){ return +d.values[index].x.toFixed(3); });
    focuses.select("text.chart_tooltip-x_value")
        .attr("x", function(d){ return x(d.values[index].x)-50; })
        .attr("dy", d3.mouse(this)[1]+10);


    var plot_focuses = d3.select("#canvas").selectAll("svg")
        .selectAll("text.plot_info_focus");
    plot_focuses.text(function (d){ return +d.values[index].feature_val.toFixed(3); });



    // ********** reference lap focus **************
    var ref_index = 0;
    var ref_focuses = d3.select("#canvas").selectAll("svg")
        .selectAll(".focus-ref");
    ref_focuses.style("display", null);

    ref_focuses.selectAll(".chart_tooltip-ref").attr("transform", function(d){
        if(d.ref_values !== undefined){
            ref_index = bisect(d.ref_values, x_value, 0, d.ref_values.length -1);
            var ty = y.get(this);
            return "translate(" + x(d.ref_values[ref_index].x) + "," + ty(d.ref_values[ref_index].feature_val) + ")";
        }else{
            return;
        }
    });

    ref_focuses.selectAll("text.chart_tooltip-ref")
        .text( function (d) {
            if(d.ref_values !== undefined) return +d.ref_values[ref_index].feature_val.toFixed(3);
            else return;
        });
    var ref_plot_focuses = d3.select("#canvas").selectAll("svg")
        .selectAll("text.plot_info_focus-ref");
    ref_plot_focuses.text(function (d){
        if(d.ref_values !== undefined) return +d.ref_values[ref_index].feature_val.toFixed(3);
        else return;
    });


    // ****************** moving Track *********************** //
    var track_focus = d3.select("#track_focus1");
    track_focus.attr("transform", "translate(" + track_x(merged_track_data.origin[index].long) + "," + track_y(merged_track_data.origin[index].lat) + ")");

    var ref_track_focus = d3.select("#track_focus1-ref");
    ref_track_focus .attr("transform", "translate(" + track_x(merged_track_data.ref[ref_index].long) + "," + track_y(merged_track_data.ref[ref_index].lat) + ")");

    // ****************** handle Steering, Brake, Gas, Gear, RPM ****************//
    // rotate by steering value
    var steer_focus = d3.select("#steer_focus1");
    steer_focus.select("image.steer")
        .attr("transform", "scale(0.5), translate(150, 50), rotate(" + steer_data[index] + ", 40, 40)")
    steer_focus.select("image.steer-ref")
        .attr("transform", "scale(0.5), translate(250, 50), rotate(" + ref_steer_data[ref_index] + ", 40, 40)")

    var steer_diff = Math.abs(steer_data[index]) - Math.abs(ref_steer_data[ref_index]);
    steer_focus.select("text.steer_value")
        .text(function(){
            if(steer_diff >= 0) return "+"+steer_diff.toFixed(2);
            else return steer_diff.toFixed(2);
        })
        .style("fill", "WhiteSmoke");


    var brake_focus = d3.select("#brake_focus1");
    brake_focus.select("rect.value")
        .attr("width", 1+ brake_data[index]);
    brake_focus.select("rect.value-ref")
        .attr("width", 1+ ref_brake_data[ref_index]);

    var brake_diff = brake_data[index] - ref_brake_data[ref_index];
    brake_focus.select("text.brake_value")
        .text(function(){
            if(brake_diff >= 0) return "+"+brake_diff.toFixed(2);
            else return brake_diff.toFixed(2);
        })
        .style("fill", "WhiteSmoke");

    var gas_focus = d3.select("#gas_focus1");
    gas_focus.select("rect.value")
        .attr("width", 1+gas_data[index]);
    gas_focus.select("rect.value-ref")
        .attr("width", 1+ref_gas_data[ref_index]);

    var gas_diff = gas_data[index] - ref_gas_data[ref_index];
    gas_focus.select("text.gas_value")
        .text(function(){
            if(gas_diff >= 0) return "+"+gas_diff.toFixed(2);
            else return gas_diff.toFixed(2);
        })
        .style("fill", "WhiteSmoke");

        // .style("fill", function() {
        //     if(gas_diff > 0) return COLOR_POSITIVE;
        //     else return COLOR_NEGATIVE;
        // });


    var gear_focus = d3.select("#gear_focus1");
    gear_focus.select("text.value")
        .text(gear_data[index])
    gear_focus.select("text.value-ref")
        .text(ref_gear_data[ref_index]);

    var rpm_focus = d3.select("#rpm_focus1");
    rpm_focus.select("text.value")
        .text(Math.round(rpm_data[index]))
    rpm_focus.select("text.value-ref")
        .text(Math.round(ref_rpm_data[ref_index]));

    var speed_focus = d3.select("#speed_focus1");
    speed_focus.select("text.value")
        .text(speed_data[index].toFixed(1));
    speed_focus.select("text.value-ref")
        .text(ref_speed_data[ref_index].toFixed(1));


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
    var flag_only_data_in_A = target_data.ref_values === undefined;

    console.log("Whether this feature only exists in A session: " + flag_only_data_in_A);

    ///////////////// update Chart /////////////////// => d3.document 참고해서 수정할것..
    console.log(target_data);

    svg = d3.select("#canvas").selectAll("svg").data(selected_features).enter()
        .append("div").classed("svg-container.line-chart", true) // container class to make it responsive
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet") // responsive SVG needs these 2 attributes and no width and height attr
        .attr("viewBox","0 0 " + (width+margin.left+margin.right+margin_for_plot_info)
            + " " + (height+margin.bottom+margin.top))
        .classed("svg-content-responsive", true) // class to make it responsive
        .append("g")
        .attr("id", function (d) {
            return d.id.split(" ")[0];
            // return d.id.replace(/\s/g, ''); // regular expression, remove space for setting id
        })
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .each(function (d) {
            var origin_y0, ref_y0, union_y0, ty;

            if(!flag_only_data_in_A){
                origin_y0 = d3.extent(d.values, function(c) { return +c.feature_val;});
                ref_y0 = d3.extent(d.ref_values, function(c) { return +c.feature_val;});

                union_y0 = d3.extent(_.union(origin_y0, ref_y0));
                ty = y.set(this, d3.scaleLinear()
                    .range([height, 0]))
                // local feature에 대한 y range setting
                    .domain(union_y0);
            }else{
                origin_y0 = d3.extent(d.values, function(c) { return +c.feature_val;});
                ty = y.set(this, d3.scaleLinear()
                    .range([height, 0]))
                // local feature에 대한 y range setting
                    .domain(origin_y0);
            }

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
        .attr("height", height);

    // assign clipPath to each line area.

    // ************* draw each path line (ref Lap 먼저, 다음 origin Lap) *********************//
    if(!flag_only_data_in_A){
        svg.append("path")
            .attr("class", "line ref")
            .attr("d", function(d) { return line.get(this)(d.ref_values); })
            .attr("clip-path", function (d) {
                return "url(#clip_" + d.id.split(" ")[0] + ")";
            });
    }


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
        .attr("x", additional_margin+width + margin_for_plot_info*0.1 +20)
        .style("fill", COLOR_ORIGIN)
        .style("font-size", "15px")
        .text("origin");

    // svg.append("image")
    //     .attr("class", "plot_info_focus_max_arrow")
    //     .attr("height", 20).attr("width", 20)
    //     .attr("xlink:href", "./img/arrow_origin.png")
    //     .attr("transform", "translate(" + (width+additional_margin) + ", " + (height*.225) + ")")

    svg.append("text")
        .attr("class", "plot_info_focus_max glyphicon")
        .attr("y", height*0.1 + 25)
        .attr("x", additional_margin+width + margin_for_plot_info*0.1 )
        .style("fill", COLOR_ORIGIN)
        .style("font-size", "12px")
        .text("max");
    // .text(function(d){ return d.origin_max.toFixed(3); });

    // svg.append("image")
    //     .attr("class", "plot_info_focus_min_arrow")
    //     .attr("height", 20).attr("width", 20)
    //     .attr("xlink:href", "./img/arrow_origin(rev).png")
    //     .attr("transform", "translate(" + (width+additional_margin) + ", " + (height*.6) + ")")

    svg.append("text")
        .attr("class", "plot_info_focus_min glyphicon")
        .attr("y", height*0.1 + 50  )
        .attr("x", additional_margin+width + margin_for_plot_info*0.1 )
        .style("fill", COLOR_ORIGIN)
        .style("font-size", "12px")
        .text("min");
    // .text(function(d){ return d.origin_min.toFixed(3); });

    svg.append("text")
        .attr("class", "plot_info_focus-ref")
        .attr("y", height*0.1)
        .attr("x", additional_margin+width + margin_for_plot_info*0.5 +20)
        .style("fill", COLOR_REF)
        .style("font-size", "15px")
        .text("ref");

    svg.append("text")
        .attr("class", "plot_info_focus_max-ref glyphicon")
        .attr("y", height*0.1 + 25)
        .attr("x", additional_margin+width + margin_for_plot_info*0.5)
        .style("fill", COLOR_REF)
        .style("font-size", "12px")
        .text("max");

    // svg.append("image")
    //     .attr("class", "plot_info_focus_max_arrow")
    //     .attr("height", 20).attr("width", 20)
    //     .attr("xlink:href", "./img/arrow_ref.png")
    //     .attr("transform", "translate(" + (width+additional_margin+margin_for_plot_info*.4) + ", " + (height*.225) + ")")

    svg.append("text")
        .attr("class", "plot_info_focus_min-ref glyphicon")
        .attr("y", height*0.1 + 50)
        .attr("x", additional_margin+width + margin_for_plot_info*0.5)
        .style("fill", COLOR_REF)
        .style("font-size", "12px")
        .text("min");

    // svg.append("image")
    //     .attr("class", "plot_info_focus_max_arrow")
    //     .attr("height", 20).attr("width", 20)
    //     .attr("xlink:href", "./img/arrow_ref(rev).png")
    //     .attr("transform", "translate(" + (width+additional_margin+margin_for_plot_info*.4) + ", " + (height*.6) + ")")

    // ************** x axis, y axis 생성 ************************ //
    var union_y0;

    if(flag_only_data_in_A === 0) {
        var origin_y0 = d3.extent(target_data.values, function(c) { return +c.feature_val;});
        var ref_y0 = d3.extent(target_data.ref_values, function(c) { return +c.feature_val;});
        union_y0 = d3.extent(_.union(origin_y0, ref_y0));
    }else{
        union_y0 = d3.extent(target_data.values, function(c) { return +c.feature_val;});
    }

    var y_range = d3.scaleLinear()
        .range([height, 0])
        .domain(union_y0);

    svg.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y_range).ticks(3));

    // *** x axis **** //
    svg.append("g")
        .call(xAxis)
        .attr("id", "x-axis")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + 0 + "," + height + ")");

    // ***  chart title ***
    svg.append("text").attr("class", "chart_label")
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
        .style("fill", COLOR_ORIGIN)
        .text("nothing");

    // append x line.
    focus.append("line")
        .attr("class", "tooltip_line")
        .style("stroke", "#fff")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.9)
        .attr("y1", -height)
        .attr("y2", height);

    // append x-value tooltip.
    focus.append("text")
        .attr("class", "chart_tooltip-x_value")
        .attr("x", -50)
        .attr("dy", ".30em")
        .style("fill", "WhiteSmoke")
        .text("");

    // ******** reference tooltip ********** //
    if(!flag_only_data_in_A) {
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
            .style("fill", COLOR_REF)
            .text("nothing");
    }



    // focus line을 마지막 line x-axis에 맞추기.
    var foc_lines = document.getElementsByClassName("tooltip_line");
    for (var i =0; i<foc_lines.length-1; i++) {
        foc_lines[i].setAttribute("y2", height);
    }
    foc_lines[foc_lines.length - 1].setAttribute("y2", 0);


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


function removeChart(id, index) {

    var target_id = "g#" + id.split(" ")[0];
    
    // svg 제거 (g+id)의 parent => SVG
    d3.select(target_id)
        .select(function() { return this.parentNode.parentNode; })
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

    }
}

function clearAllSVG_for_xAxis_switch() {

    d3.selectAll("path.animation_path").remove(); // animation path remove
    d3.select("#zoom_canvas").select("svg").remove();
    d3.select("#canvas").selectAll("svg").remove();
    d3.select("#canvas").selectAll("div").remove();
    d3.select("#track_canvas").selectAll("svg").remove();
    d3.select("#track_canvas").selectAll("div").remove();
    d3.select("#track_nav_canvas").selectAll("svg").remove();
    d3.select("#track_nav_canvas").selectAll("div").remove();
    d3.select("#sub_canvas").selectAll("svg").remove();
    d3.select("#sub_canvas").selectAll("div").remove();

    // remove section split buttons & info
    //var temp_node = document.getElementById("split-table-header");
    //while (temp_node.firstChild) temp_node.removeChild(temp_node.firstChild);
    var temp_node = document.getElementById("split-table-contents");
    while (temp_node.firstChild) temp_node.removeChild(temp_node.firstChild);
    //temp_node = document.getElementById("split-table-contents-ref");
    //while (temp_node.firstChild) temp_node.removeChild(temp_node.firstChild);

    // data clean
    animation_range = [];
    animation_index = 0;
    ref_animation_range = [];
    ref_animation_index = 0;
    steer_data = [], brake_data = [], gas_data = [], gear_data = [];
    track_data = [];
    all_features= [], selected_features = [], animation_track_data = [], animation_time_delta=[];

    init(vis_type);
}

function clearAllSVG() {

    console.log("CLEAR ALL SVG & DATA");

    d3.selectAll("path.animation_path").remove(); // animation path remove
    d3.select("#zoom_canvas").select("svg").remove();
    d3.select("#canvas").selectAll("svg").remove();
    d3.select("#canvas").selectAll("div").remove();
    d3.select("#track_canvas").selectAll("path").remove();
    d3.select("#track_canvas").selectAll("svg").remove();
    d3.select("#track_canvas").selectAll("div").remove();
    d3.select("#track_nav_canvas").selectAll("svg").remove();
    d3.select("#track_nav_canvas").selectAll("div").remove();
    d3.select("#sub_canvas").selectAll("svg").remove();
    d3.select("#sub_canvas").selectAll("div").remove();

    // remove section split buttons & info
    var temp_node = document.getElementById("split-table-contents");
    while (temp_node.firstChild) temp_node.removeChild(temp_node.firstChild);

    // data clean
    animation_range = [];
    animation_index = 0;
    ref_animation_range = [];
    ref_animation_index = 0;
    steer_data = [], brake_data = [], gas_data = [], gear_data = [];
    track_data = [], ref_track_data = [], inline_track = [], outline_track = [];
    all_features= [], selected_features = [], animation_track_data = [], animation_time_delta=[];
    merged_track_data = {};
}

// working..
function transform_track_byTrackType(){
    console.log("trackType setting");
    if(TRACK_TYPE.includes("INJE"))
        return;
        // return "translate(" + track_width/2 + ", " + track_height/4 + ") rotate(90)";
    else
        return;
}

// working..
function transform_nav_track_byTrackType(){
    if(TRACK_TYPE.includes("INJE"))
        // return;
        // return "translate(" + nav_track_width/2 + ", " + nav_track_height/4 + ") rotate(90)";
        return "translate(" + nav_track_width/4 + ", " + nav_track_height/4 + ")";
    else
        return "translate(" + nav_track_width/4 + ", " + nav_track_height/4 + ")";
}

