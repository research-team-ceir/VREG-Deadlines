// #region SETUP

// function to center items on the svg
function center(selection, y) {
    var width = selection.node().getBBox().width;
    var x = selection.node().getBBox().x;
    selection.attr("transform", "translate(" + ((666-width)/2 - x) + "," + y + ")");
};

// html setup
d3.select("body")
    .append("div")
    .attr("id", "vreg-deadlines")
        .style("display", "grid")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("max-width", "666px")
        .style("margin-left", "auto")
        .style("margin-right", "auto")
        .style("font-family", "'Source Serif 4', sans-serif");

d3.select("#vreg-deadlines")
    .append("h3")
        .text("Availability of Advance Voter Registration and Same-Day Registration, 2026 General Election")
        .style("text-align", "center")
        .style("font-size", "24px");

var svg = d3.select("#vreg-deadlines")
    .append("svg")
    .attr("width", "100%")
    .attr("viewBox", "0 0 666 850");

// #region TOOLTIP SETUP

var tooltip = d3.select("#vreg-deadlines")
    .append("div")
    .attr("id", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("background-color", "#ffffff")
        .style("font-color", "black")
        .style("box-shadow", "3px 3px 5px rgba(0, 0, 0, 0.3)")
        .style("display", "flex")
        .style("flex-direction", "column");

var tooltipContent = tooltip.append("div")
    .attr("id", "tooltip-content")
        .style("padding", "0px 20px 0px 20px");

var tooltipState = tooltipContent.append("p")
    .style("text-align", "center")
    .style("font-weight", "bold")

var tooltipText = tooltipContent.append("p")

// #endregion

// #region LEGEND
var legendContainer = svg.append("g")
    .attr("id", "legend-container");

var legend = legendContainer.append("g")
    .attr("id", "legend");

var advBtn = legend
    .append("circle")
        .attr("cx", 20)
        .attr("cy", 20)
        .attr("r", 8)
        .attr("fill", "#d29d15")
        .on("mouseover", function(e, d) {
            d3.select(this)
                .style("cursor", "pointer")
        });

legend
    .append("text")
        .text("Advance Voter Registration")
        .attr("x", 35)
        .attr("y", 25);

var sdrBtn = legend
    .append("circle")
        .attr("cx", 275)
        .attr("cy", 20)
        .attr("r", 8)
        .attr("fill", "#345188")
        .on("mouseover", function(e, d) {
            d3.select(this)
                .style("cursor", "pointer")
        });

legend
    .append("text")
        .text("Same-Day Registration")
        .attr("x", 290)
        .attr("y", 25);

legend.call(center, 0);

var overlapLegend = legendContainer.append("g")
    .attr("id", "overlap-legend")

overlapLegend
    .append("circle")
        .attr("cx", 20)
        .attr("cy", 45)
        .attr("r", 8)
        .attr("fill", "#3b9171");

overlapLegend
    .append("text")
        .text("Overlap")
        .attr("x", 35)
        .attr("y", 50);

overlapLegend.call(center, 0);

// source
legendContainer
    .append("text")
    .text("Source: CEIR, \"2026 Voter Registration Deadlines\"")
    .attr("x", 25)
    .attr("y", 850-20)
    .style("font-size", "11px")
    .style("color", "#555555");

// logo
legendContainer.append("svg:image")
    .attr("xlink:href", "images/CEIR_Logo_Vertical_OneColor_LightBlue.png")
    .attr("x", 666-50)
    .attr("y", 10)
    .attr("width", 50)
    .attr("height", 50);

// #endregion

var graph = svg.append("g")
    .attr("id", "graph")

Promise.all([
    d3.dsv("|", "data/VREG_deadlines.csv")
]).then(function([deadlines]) {

    var abb = deadlines.map(function(d) {
        return d.Abb;
    });

    // #region AXIS

    // left axis
    var stateScale = d3.scalePoint()
        .domain(abb)
        .range([0, 700]);

    var axisLeft = d3.axisLeft(stateScale)
        .tickSizeInner(0)
        .tickSizeOuter(0);
    
    var stateAxis = graph.append("g")
        .attr("id", "state-axis")
        .call(axisLeft);

    stateAxis
        .append("path")
        .attr("d", "M0.5,0.5V719")
        .attr("stroke", "currentColor");

    stateAxis.selectAll("path")
        .attr("transform", "translate(-1.3, -8)");

    // bottom axis
    var dateScale = d3.scaleTime()
        .domain([new Date(2026, 8, 17), new Date(2026, 10, 3)])
        .range([0, 550]);

    var axisBottom = d3.axisBottom(dateScale)
        .tickSizeOuter(0)
        .tickFormat(d3.timeFormat('%b %e'))
        .tickValues([new Date(2026, 8, 22), new Date(2026, 8, 29), new Date(2026, 9, 6),
            new Date(2026, 9, 13), new Date(2026, 9, 20), new Date(2026, 9, 27), new Date(2026, 10, 3)
        ]);

    var dateAxis = graph.append("g")
        .attr("id", "date-axis");

    dateAxis.call(axisBottom)
        .attr("transform", "translate(0, 710)");

    d3.select("#state-axis")
        .selectAll("text")
        .attr("font-size", "13px")
        .attr("class", function(d) {
            return d3.select(this).text()
        })

    d3.select("#date-axis")
        .selectAll("text")
        .attr("font-size", "16px");
        
    var parseDate = d3.timeParse("%m/%d/%Y");

    d3.selectAll("text").style("font-family", "'Source Serif 4', sans-serif");
    
    // #endregion

    // #region DATA
    
    // SDR data
    var sdrData = deadlines.filter(function (d) {
        return d.SDR_start != 'NA';
    });

    var advData = deadlines.filter(function (d) {
        return d.last_day_one != 'NA';
    });

    var overlapData = deadlines.filter(function (d) {
        return d.SDR_start != 'NA' &  d.last_day_one != 'NA' & (parseDate(d.last_day_one) > parseDate(d.SDR_start)) ;
    });

    var dayData = deadlines.filter(function (d) {
        return d.SDR_start == d.last_day_one;
    });

    // #endregion


    var main = graph.append("g")

    // #region LINES & POINTS

    var sdrLines = main.append("g")
        .attr("id", "sdr-lines")
        .selectAll("rect")
        .data(sdrData)
        .enter()
            .append("rect")
            .attr("class", d => d.Abb)
            .classed("sdr", true)
            .attr("height", 4)
            .attr("width", d => dateScale(parseDate(d.SDR_end)) - dateScale(parseDate(d.SDR_start)))
            .attr("x", d => dateScale(parseDate(d.SDR_start)))
            .attr("y", d => stateScale(d.Abb) - 2) // subtract half of rect height to center
            .attr("fill", "#345188");

    var advLines = main.append("g")
        .attr("id", "adv-lines")
        .selectAll("rect")
        .data(advData)
        .enter()
            .append("rect")
            .attr("class", d => d.Abb)
            .classed("adv", "true")
            .attr("height", 4)
            .attr("width", d => dateScale(parseDate(d.last_day_one)) - dateScale(parseDate("9/17/2026")))
            .attr("x", d => dateScale(parseDate("9/17/2026")))
            .attr("y", d => stateScale(d.Abb) - 2) // subtract half of rect height to center
            .attr("fill", "#ffe4a4");


    var overlapLines = main.append("g")
        .attr("id", "overlap-lines")
        .selectAll("rect")
        .data(deadlines.filter(d => d.last_day_one != "NA" & d.SDR_end != "NA" & d.SDR_start != "NA"))
        .enter()
            .append("rect")
            .attr("class", d => d.Abb)
            .classed("overlap", "true")
            .attr("height", 4)
            .attr("width", function(d) {
                if (d.last_day_one < d.SDR_end) {
                    return dateScale(parseDate(d.last_day_one)) - dateScale(parseDate(d.SDR_start))
                } else {
                    return dateScale(parseDate(d.SDR_end)) - dateScale(parseDate(d.SDR_start))
                }
            })
            .attr("x", d => dateScale(parseDate(d.SDR_start)))
            .attr("y", d => stateScale(d.Abb) - 2) // subtract half of rect height to center
            .attr("fill", "#3b9171");

    var sdrStart = main.append("g")
        .attr("id", "sdr-start")
        .selectAll("circle")
        .data(sdrData.filter(d => d.SDR_start != d.SDR_end))
        .enter()
            .append("circle")
            .attr("class", d => d.Abb)
            .classed("sdr", true)
            .classed("sdr-start", true)
            .attr("r", 5)
            .attr("cx", d => dateScale(parseDate(d.SDR_start)))
            .attr("cy", d => stateScale(d.Abb))
            .attr("fill", "#345188");

    var sdrEnd = main.append("g")
        .attr("id", "sdr-end")
        .selectAll("circle")
        .data(sdrData.filter(d => d.SDR_start != d.SDR_end))
        .enter()
            .append("circle")
            .attr("class", d => d.Abb)
            .classed("sdr", true)
            .classed("sdr-end", true)
            .attr("r", 5)
            .attr("cx", d => dateScale(parseDate(d.SDR_end)))
            .attr("cy", d => stateScale(d.Abb))
            .attr("fill", "#345188");

    var sdrDay = main.append("g")
        .attr("id", "sdr-day")
        .selectAll("circle")
        .data(sdrData.filter(d => d.SDR_start == d.SDR_end | d.EDR == "Yes"))
        .enter()
            .append("circle")
            .attr("class", d => d.Abb)
            .classed("sdr", true)
            .classed("sdr-day", true)
            .attr("r", 5)
            .attr("cx", function(d) {
                if (d.EDR == "Yes") {
                    return dateScale(parseDate("11/3/2026"))
                } else {
                    return dateScale(parseDate(d.SDR_end))
                }
            })
            .attr("cy", d => stateScale(d.Abb))
            .attr("fill", "#345188");

    var advDay = main.append("g")
        .attr("id", "adv-day")
        .selectAll("circle")
        .data(advData)
        .enter()
            .append("circle")
            .attr("class", d => d.Abb)
            .classed("adv", true)
            .classed("adv-day", true)
            .attr("r", 5)
            .attr("cx", d => dateScale(parseDate(d.last_day_one)))
            .attr("cy", d => stateScale(d.Abb))
            .attr("fill", "#d29d15");

    var overlapDay = main.append("g")
        .attr("id", "overlap-day")
        .selectAll("circle")
        .data(dayData)
        .enter()
            .append("circle")
            .attr("class", d => d.Abb)
            .classed("overlap", true)
            .classed("overlap-day", true)
            .attr("r", 5)
            .attr("cx", d => dateScale(parseDate(d.last_day_one)))
            .attr("cy", d => stateScale(d.Abb))
            .attr("fill", "#3b9171");

    // #endregion

    // #region TOOLTIP

    var showTooltip = function(e, d) {
        tooltipState.html(d.State)

        if (d3.select(this).classed("sdr-start")) {
            tooltipText.html("SDR start: " + d.SDR_start);
        } else if (d3.select(this).classed("sdr-end")) {
            tooltipText.html("SDR end: " + d.SDR_end);
        } else if (d3.select(this).classed("sdr-day")) {
            tooltipText.html("SDR end: " + d.SDR_end);
        } else if (d3.select(this).classed("adv-day")) {
            tooltipText.html("Last advance day: " + d.last_day_one);
        } else if (d3.select(this).classed("overlap-day")) {
            tooltipText.html("Advance + SDR: " + d.last_day_one);
        };
        
        var tooltipHeight = tooltip.node().getBoundingClientRect().height;
        var tooltipWidth = tooltip.node().getBoundingClientRect().width;
        
        if (e.pageX + tooltipWidth > window.innerWidth - 10) {
            tooltip
                .style("left", (e.pageX - tooltipWidth - 10) + "px")
                .style("top", (e.pageY - tooltipHeight - 10) + "px")
                .style("opacity", 1);
        } else {
            tooltip
                .style("left", (e.pageX + 10) + "px")
                .style("top", (e.pageY - tooltipHeight - 10) + "px")
                .style("opacity", 1);
        };
    };

    var hideTooltip = function(e, d) {
        tooltip.transition()
            .duration(100)
            .style("opacity", 0);
    };

    sdrStart
        .on("mouseover", showTooltip)
        .on("mousemove", showTooltip)
        .on("mouseout", hideTooltip);

    sdrEnd
        .on("mouseover", showTooltip)
        .on("mousemove", showTooltip)
        .on("mouseout", hideTooltip);

    sdrDay
        .on("mouseover", showTooltip)
        .on("mousemove", showTooltip)
        .on("mouseout", hideTooltip);

    advDay
        .on("mouseover", showTooltip)
        .on("mousemove", showTooltip)
        .on("mouseout", hideTooltip);

    overlapDay
        .on("mouseover", showTooltip)
        .on("mousemove", showTooltip)
        .on("mouseout", hideTooltip);

    
    var sdrSelected = true;
    var advSelected = true;

    // #endregion

    // #region TOGGLE
    var toggleSDR = function() {
        if (!advSelected) {
            return;
        };

        if (sdrSelected == false) {
            d3.selectAll(".sdr")
                .transition()
                .duration(500)
                .style("opacity", 1);
                
            d3.selectAll(".overlap")
                .transition()
                .duration(500)
                .style("opacity", 1);

            d3.select(this)
                .transition()
                .duration(500)
                .style("opacity", 1);

            sdrEnd
                .style("pointer-events", "auto")

            sdrStart
                .style("pointer-events", "auto")

            overlapDay
                .style("pointer-events", "auto")

            sdrSelected = true;
        } else {
            d3.selectAll(".sdr")
                .transition()
                .duration(500)
                .style("opacity", 0);
                
            d3.selectAll(".overlap")
                .transition()
                .duration(500)
                .style("opacity", 0);

            d3.select(this)
                .transition()
                .duration(500)
                .style("opacity", 0.5);

            sdrStart
                .style("pointer-events", "none")

            sdrEnd
                .style("pointer-events", "none")

            overlapDay
                .style("pointer-events", "none")

            sdrSelected = false;
        };
    };

    var toggleADV = function() {
        if (!sdrSelected) {
            return;
        };

        if (advSelected == false) {
            d3.selectAll(".adv")
                .transition()
                .duration(500)
                .style("opacity", 1);
                
            d3.selectAll(".overlap")
                .transition()
                .duration(500)
                .style("opacity", 1);

            d3.select(this)
                .transition()
                .duration(500)
                .style("opacity", 1);

            advDay
                .style("pointer-events", "auto")

            overlapDay
                .style("pointer-events", "auto")

            advSelected = true;
        } else {
            d3.selectAll(".adv")
                .transition()
                .duration(500)
                .style("opacity", 0);
                
            d3.selectAll(".overlap")
                .transition()
                .duration(500)
                .style("opacity", 0);

            d3.select(this)
                .transition()
                .duration(500)
                .style("opacity", 0.5);

            advDay
                .style("pointer-events", "none")

            overlapDay
                .style("pointer-events", "none")

            advSelected = false;
        }
    };

    sdrBtn.on("click", toggleSDR);

    advBtn.on("click", toggleADV)

    // #endregion

    d3.select("#graph").call(center, 70);
});