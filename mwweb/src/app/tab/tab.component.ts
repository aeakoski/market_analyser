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
  margin: any = {top: 10, right: 30, bottom: 30, left: 60}
  width: any = 460 - this.margin.left - this.margin.right
  height: any = 400 - this.margin.top - this.margin.bottom;
  title: string;
  stockGroupsKeys: any;
  stockGroups: any;
  svgs: any = {};

  constructor(private depotService: DepotService) {
    this.stockGroupsKeys = Object.keys(depotService.getActiveStrategy())
  }

  getTitle(){ return this.title }

  ngOnInit() {
    this.depotService.subject.subscribe((data) => {
      console.log("getNewData")
      this.stockGroups = this.depotService.getActiveStrategy()
      this.stockGroupsKeys = Object.keys(this.depotService.getActiveStrategy())
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
    console.log("CreateChart")
    this.stockGroups = this.depotService.getActiveStrategy()
    //let result = this.depotService.getActiveStrategy()
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

   //let element = this.chartContainer.nativeElement;
   if(this.svgs[symbol] == undefined){
     let newDiv = document.createElement("div");
     newDiv.setAttribute("id", "plot_" + symbol);
     let plotTitle = document.createTextNode(symbol)
     newDiv.appendChild(plotTitle)
     document.getElementById("plotArea").appendChild(newDiv)
     //this.width = element.offsetWidth - this.margin.left - this.margin.right;
     //this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
     this.svgs[symbol] = d3.select("#plot_" + symbol)//element)
     .append('svg')
     .attr('width', this.width + this.margin.left + this.margin.right)//element.offsetWidth)
     .attr('height', this.height + this.margin.top + this.margin.bottom)//element.offsetHeight)
     .append("g")
     .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
   }



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

   for (let c of conf){
     // let data = this.stockGroups[symbol][c.type]
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
    console.log("updateChart")

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

    let ymin = 99999
    let ymax = 0

    for (let symbol of this.stockGroupsKeys){

      for (let _c of conf){
        if (this.mini(this.stockGroups[symbol][_c.type], function(d){return d.value}) < ymin) {
          ymin = this.mini(this.stockGroups[symbol][_c.type], function(d){return d.value})//d3.min(result[symbol][_c.type], function(d){return d.value})
        }

        if (this.maxi(this.stockGroups[symbol][_c.type], function(d) { return +d.value; }) > ymax) {
          ymax = this.maxi(this.stockGroups[symbol][_c.type], function(d) { return +d.value; })//d3.max(result[symbol][_c.type], function(d) { return +d.value; })
        }
      }

      let svg = d3.select("#plot_" + symbol).transition();
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
