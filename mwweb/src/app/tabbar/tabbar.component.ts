import { Component, OnInit } from '@angular/core';
import { DepotService } from "../depot.service"

@Component({
  selector: 'app-tabbar',
  templateUrl: './tabbar.component.html',
  styleUrls: ['./tabbar.component.sass']
})
export class TabbarComponent implements OnInit {

  constructor(private depotService: DepotService) { }

  ngOnInit() {
  }

}
