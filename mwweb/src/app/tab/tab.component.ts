import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';

import { DepotService } from "../depot.service"
import * as d3 from 'd3';

const LINE_SETINGS =  [{
    type: "regular",
    color: "steelblue"
  },{
    type: "_50",
    color: "#4daf4a"
  },{
    type: "_200",
    color: "#e41a1c"
  },
  ]


@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.sass']
})
export class TabComponent implements OnInit {
  @ViewChild('chart', {static: false}) private chartContainer: ElementRef;
  margin: any = {top: 0, right: 0, bottom: 30, left: 45}
  width: any = 250 - this.margin.left - this.margin.right
  height: any = 200 - this.margin.top - this.margin.bottom;
  title: string;
  stockGroupsKeys: any;
  stockGroups: any;
  svgs: any = {};

  constructor(private depotService: DepotService) {}

  getTitle(){ return this.title }

  ngOnInit() {
    this.stockGroups = this.depotService.getActiveStrategy()["stocks"]
    if(this.stockGroups == -1){
      console.error("Something went wrong with seting the active strategy")
      return
    }
    this.stockGroupsKeys = Object.keys(this.stockGroups)

    this.createChartCanvasesIn("stockArea", this.stockGroupsKeys)
    for(let symbol of this.stockGroupsKeys){
      this.initStockLine(symbol)
    }
    this.createChartCanvasesIn("valueArea", ["totalValue"])
    this.initValueLine()

    this.depotService.newDayData.subscribe((data) => {
      this.updateChartData()
      this.updateValueLine()
    })

    this.depotService.newStrategyChoice.subscribe((strategy) => {
      this.updateChartData()
      this.updateValueLine()
    })
  }

  mini(arr, val){
    let m = 9999999
    for(let i of arr){
      if (parseFloat(val(i)) < m){
        m = parseFloat(val(i))
      }
    }
    return m
  }
  maxi(arr, val){
    let m = 0
    for(let i of arr){
      if (parseFloat(val(i)) > m){
        m = parseFloat(val(i))
      }
    }
    return m
  }

  initValueLine(){
    let values = this.depotService.getActiveStrategy()["values"]
    let ymin = 99999
    let ymax = 0
    if(values.length < 2){
      console.log("Not enough values to plot money")
      return
    }
    ymin = this.mini(Object.values(values), (x => x.totalValue))//d3.min(result[symbol][_c.type], function(d){return d.value})
    ymax = this.maxi(Object.values(values), (x => x.totalValue))//d3.max(result[symbol][_c.type], function(d) { return +d.value; })

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
    .domain(d3.extent(Object.values(values), function(d:any) { return d3.timeParse("%Y-%m-%d")(d.date); }))
    .range([ 0, this.width ]);
    this.svgs["totalValue"].append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + this.height + ")")
    .call(d3.axisBottom(x));
    // Add Y axis
    var y = d3.scaleLinear()
    .domain([ymin, ymax])
    .range([ this.height, 0 ]);
    this.svgs["totalValue"].append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y));

    // Add the line
    this.svgs["totalValue"].append("path")
       .datum(Object.values(values))
       .attr("fill", "none")
       .attr("class", "totalValue" + LINE_SETINGS[0].type)
       .attr("stroke", LINE_SETINGS[0].color)
       .attr("stroke-width", 1.5)
       .attr("d", d3.line()
         .x(function(d:any) { return x(d3.timeParse("%Y-%m-%d")(d.date)) })
         .y(function(d:any) { return y(d.totalValue) })
         )
  }

  initStockLine(symbol){
    let ymin = 99999
    let ymax = 0
    for (let _c of LINE_SETINGS){
       if(!(this.stockGroups[symbol][_c.type].length)){ return }
       if (this.mini(this.stockGroups[symbol][_c.type], function(d){return d.value}) < ymin) {
         ymin = this.mini(this.stockGroups[symbol][_c.type], function(d){return d.value})//d3.min(result[symbol][_c.type], function(d){return d.value})
       }
       if (this.maxi(this.stockGroups[symbol][_c.type], function(d) { return +d.value; }) > ymax) {
         ymax = this.maxi(this.stockGroups[symbol][_c.type], function(d) { return +d.value; })//d3.max(result[symbol][_c.type], function(d) { return +d.value; })
       }
     }

    for (let c of LINE_SETINGS){
      // let data = this.stockGroups[symbol][c.type]
      if(!(this.stockGroups[symbol][c.type].length)){ return }
      if (c.type == "regular") {
        // Add X axis --> it is a date format
        var x = d3.scaleTime()
        .domain(d3.extent(this.stockGroups[symbol][c.type], function(d:any) { return d3.timeParse("%Y-%m-%d")(d.date); }))
        .range([ 0, this.width ]);
        this.svgs[symbol].append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(x));
        // Add Y axis
        var y = d3.scaleLinear()
        .domain([ymin, ymax])
        .range([ this.height, 0 ]);
        this.svgs[symbol].append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));
      }
      // Add the line
      this.svgs[symbol].append("path")
         .datum(this.stockGroups[symbol][c.type])
         .attr("fill", "none")
         .attr("class", symbol + c.type)
         .attr("stroke", c.color)
         .attr("stroke-width", 1.5)
         .attr("d", d3.line()
           .x(function(d:any) { return x(d3.timeParse("%Y-%m-%d")(d.date)) })
           .y(function(d:any) { return y(d.value) })
           )
     }
  }

  createChartCanvasesIn(divID, symbols) {
    for(let symbol of symbols){
      if(this.svgs[symbol] == undefined){
        let newDiv = document.createElement("div");
        newDiv.setAttribute("id", "plot_" + symbol.replace(".","-"));
        newDiv.setAttribute("class", "plot");
        let newP = document.createElement("p")
        newP.setAttribute("style", "text-align: center;")
        let plotTitle = document.createTextNode(symbol)
        newP.appendChild(plotTitle)
        newDiv.appendChild(newP)
        document.getElementById(divID).appendChild(newDiv)
        //this.width = element.offsetWidth - this.margin.left - this.margin.right;
        //this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
        this.svgs[symbol] = d3.select("#plot_" + symbol.replace(".","-"))//element)
        .append('svg')
        .attr('width', this.width + this.margin.left + this.margin.right)//element.offsetWidth)
        .attr('height', this.height + this.margin.top + this.margin.bottom)//element.offsetHeight)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
      }
    }
  }

  updateValueLine(){
    let values = this.depotService.getActiveStrategy()["values"]
    let ymin = 99999
    let ymax = 0
    if(values.length < 2){
      console.log("Not enough values to plot money")
      return
    }
    ymin = this.mini(Object.values(values), (x => x.totalValue))//d3.min(result[symbol][_c.type], function(d){return d.value})
    ymax = this.maxi(Object.values(values), (x => x.totalValue))//d3.max(result[symbol][_c.type], function(d) { return +d.value; })

    let svg = d3.select("#plot_totalValue".replace(".","-")).transition();
    // Add X axis
    var x = d3.scaleTime()
    .domain(d3.extent(Object.values(values), function(d:any) { return d3.timeParse("%Y-%m-%d")(d.date); }))
    .range([ 0, this.width ]);
    this.svgs["totalValue"].select(".x.axis")
    .call(d3.axisBottom(x));
    // Add Y axis
    var y = d3.scaleLinear()
    .domain([ymin, ymax])
    .range([ this.height, 0 ]);
    this.svgs["totalValue"].select(".y.axis")
    .call(d3.axisLeft(y));
    // Add the line
    this.svgs["totalValue"].select("." + "totalValue" + "regular")
    .datum(Object.values(values))
    .attr("d", d3.line()
    .x(function(d:any) { return x(d3.timeParse("%Y-%m-%d")(d.date)) })
    .y(function(d:any) { return y(d.totalValue) })
    )
  }

  updateChartData(){
    this.stockGroups = this.depotService.getActiveStrategy()["stocks"]
    this.stockGroupsKeys = Object.keys(this.stockGroups)

    console.log("updateChart")
    console.log("---------------------------------------------")

    for (let symbol of this.stockGroupsKeys){
      let ymin = 99999
      let ymax = 0
      for (let _c of LINE_SETINGS){
        if (this.mini(this.stockGroups[symbol][_c.type], function(d){return d.value}) < ymin) {
          ymin = this.mini(this.stockGroups[symbol][_c.type], function(d){return d.value})//d3.min(result[symbol][_c.type], function(d){return d.value})
        }
        if (this.maxi(this.stockGroups[symbol][_c.type], function(d) { return +d.value; }) > ymax) {
          ymax = this.maxi(this.stockGroups[symbol][_c.type], function(d) { return +d.value; })//d3.max(result[symbol][_c.type], function(d) { return +d.value; })
        }
      }

      console.log(symbol + ": " + ymin + "->" + ymax )

      let svg = d3.select("#plot_" + symbol.replace(".","-")).transition();
      for (let c of LINE_SETINGS){
        // let data = this.stockGroups[symbol][c.type]
        if (c.type == "regular") {
          // Add X axis --> it is a date format
          var x = d3.scaleTime()
          .domain(d3.extent(this.stockGroups[symbol][c.type], function(d:any) { return d3.timeParse("%Y-%m-%d")(d.date); }))
          .range([ 0, this.width ]);
          this.svgs[symbol].select(".x.axis")
          .call(d3.axisBottom(x));

          // Add Y axis
          var y = d3.scaleLinear()
          .domain([ymin, ymax])
          .range([ this.height, 0 ]);

          this.svgs[symbol].select(".y.axis")
          .call(d3.axisLeft(y));
        }
        // Add the line
        this.svgs[symbol].select("." + symbol + c.type)
        .datum(this.stockGroups[symbol][c.type])
        .attr("d", d3.line()
        .x(function(d:any) { return x(d3.timeParse("%Y-%m-%d")(d.date)) })
        .y(function(d:any) { return y(d.value) })
        )
      }
    }
  }
}
