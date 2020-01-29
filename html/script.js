
// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

let svgs = {}


let conf =  [{
              type: "regular",
              color: "steelblue"
            },{
              type: "_50",
              color: "#e41a1c"
            },{
              type: "_200",
              color: "#4daf4a"
            },
          ]


  $(document).ready(function(){
    $.ajax({
        url:"http://localhost:4000/api/plotdata",
        type:"GET",
        success:function(result){
          console.log(result);

          for (symbol of Object.keys(result["MA_50_200"])){

            let newDiv = document.createElement("div");
            newDiv.setAttribute("id", "plot_" + symbol);
            let plotTitle = document.createTextNode(symbol)
            newDiv.appendChild(plotTitle)
            document.body.appendChild(newDiv)

            svgs[symbol] = d3.select("#plot_"+ symbol)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

            ymin = 99999
            ymax = 0

            for (_c of conf){
              if (d3.min(result["MA_50_200"][symbol][_c.type], function(d){return d.value}) < ymin) {
                ymin = d3.min(result["MA_50_200"][symbol][_c.type], function(d){return d.value})
              }

              if (d3.max(result["MA_50_200"][symbol][_c.type], function(d) { return +d.value; }) > ymax) {
                ymax = d3.max(result["MA_50_200"][symbol][_c.type], function(d) { return +d.value; })
              }
            }


            for (c of conf){
              data = result["MA_50_200"][symbol][c.type]

              if (c.type == "regular") {
                // Add X axis --> it is a date format
                var x = d3.scaleTime()
                .domain(d3.extent(data, function(d) { return d3.timeParse("%Y-%m-%d")(d.date); }))
                .range([ 0, width ]);
                svgs[symbol].append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

                // Add Y axis
                var y = d3.scaleLinear()
                .domain([ymin, ymax])
                .range([ height, 0 ]);
                svgs[symbol].append("g")
                .call(d3.axisLeft(y));
              }

              // Add the line
              svgs[symbol].append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", c.color)
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                  .x(function(d) { return x(d3.timeParse("%Y-%m-%d")(d.date)) })
                  .y(function(d) { return y(d.value) })
                  )
            }
          }


        },
        error:function(e){console.log(e);}
    })
  })


// d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",
//
//   // When reading the csv, I must format variables:
//   function(d){
//     return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
//   },
//
//   // Now I can use this dataset:
//   function(data) {
//
//     // Add X axis --> it is a date format
//     var x = d3.scaleTime()
//       .domain(d3.extent(data, function(d) { return d.date; }))
//       .range([ 0, width ]);
//     svg.append("g")
//       .attr("transform", "translate(0," + height + ")")
//       .call(d3.axisBottom(x));
//
//     // Add Y axis
//     var y = d3.scaleLinear()
//       .domain([0, d3.max(data, function(d) { return +d.value; })])
//       .range([ height, 0 ]);
//     svg.append("g")
//       .call(d3.axisLeft(y));
//
//     // Add the line
//     svg.append("path")
//       .datum(data)
//       .attr("fill", "none")
//       .attr("stroke", "steelblue")
//       .attr("stroke-width", 1.5)
//       .attr("d", d3.line()
//         .x(function(d) { return x(d.date) })
//         .y(function(d) { return y(d.value) })
//         )
//
// })
