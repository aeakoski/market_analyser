import { Component } from '@angular/core';
import { TabbarComponent } from './tabbar/tabbar.component';
import { DepotService } from "./depot.service"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent{
  title: string;
  constructor(private depotService: DepotService) {
    this.title = 'mwweb';
  }

}
