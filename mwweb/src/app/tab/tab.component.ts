import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';

import { DepotService } from "../depot.service"
import * as d3 from 'd3';


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

  constructor(private depotService: DepotService) {
    this.stockGroupsKeys = Object.keys(depotService.getActiveStrategy())
  }

  getTitle(){ return this.title }

  ngOnInit() {
    this.depotService.newDayData.subscribe((data) => {
      this.updateLines()
    })

    this.depotService.newStrategyChoice.subscribe((strategy) => {
      this.updateLines()
    })

    for( let s of this.stockGroupsKeys ){
      this.createChart(s)
    }
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

  createChart(symbol) {
    this.stockGroups = this.depotService.getActiveStrategy()
    if(this.stockGroups == -1){
      console.error("Something went wrong with seting the active strategy")
      return
    }
    //let result = this.depotService.getActiveStrategy()
    let conf =  [{
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

   //let element = this.chartContainer.nativeElement;
   if(this.svgs[symbol] == undefined){
     let newDiv = document.createElement("div");
     newDiv.setAttribute("id", "plot_" + symbol.replace(".","-"));
     newDiv.setAttribute("class", "plot");
     let newP = document.createElement("p")
     newP.setAttribute("style", "text-align: center;")
     let plotTitle = document.createTextNode(symbol)
     newP.appendChild(plotTitle)
     newDiv.appendChild(newP)
     document.getElementById("plotArea").appendChild(newDiv)
     //this.width = element.offsetWidth - this.margin.left - this.margin.right;
     //this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
     this.svgs[symbol] = d3.select("#plot_" + symbol.replace(".","-"))//element)
     .append('svg')
     .attr('width', this.width + this.margin.left + this.margin.right)//element.offsetWidth)
     .attr('height', this.height + this.margin.top + this.margin.bottom)//element.offsetHeight)
     .append("g")
     .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
   }


   let ymin = 99999
   let ymax = 0
    for (let _c of conf){
      // console.log(this.stockGroups[symbol][_c.type])
      if(!(this.stockGroups[symbol][_c.type].length)){ return }
      if (this.mini(this.stockGroups[symbol][_c.type], function(d){return d.value}) < ymin) {
        ymin = this.mini(this.stockGroups[symbol][_c.type], function(d){return d.value})//d3.min(result[symbol][_c.type], function(d){return d.value})
      }

      if (this.maxi(this.stockGroups[symbol][_c.type], function(d) { return +d.value; }) > ymax) {
        ymax = this.maxi(this.stockGroups[symbol][_c.type], function(d) { return +d.value; })//d3.max(result[symbol][_c.type], function(d) { return +d.value; })
      }
    }

    console.log(symbol + ": " + ymin + "->" + ymax )

   for (let c of conf){
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
  updateLines(){
    this.stockGroups = this.depotService.getActiveStrategy()
    this.stockGroupsKeys = Object.keys(this.depotService.getActiveStrategy())

    console.log("updateChart")
    console.log("---------------------------------------------")

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


    for (let symbol of this.stockGroupsKeys){
      let ymin = 99999
      let ymax = 0
      for (let _c of conf){
        if (this.mini(this.stockGroups[symbol][_c.type], function(d){return d.value}) < ymin) {
          ymin = this.mini(this.stockGroups[symbol][_c.type], function(d){return d.value})//d3.min(result[symbol][_c.type], function(d){return d.value})
        }

        if (this.maxi(this.stockGroups[symbol][_c.type], function(d) { return +d.value; }) > ymax) {
          ymax = this.maxi(this.stockGroups[symbol][_c.type], function(d) { return +d.value; })//d3.max(result[symbol][_c.type], function(d) { return +d.value; })
        }
      }

      console.log(symbol + ": " + ymin + "->" + ymax )

      let svg = d3.select("#plot_" + symbol.replace(".","-")).transition();
      for (let c of conf){
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
