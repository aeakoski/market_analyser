import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DepotService {
  activeStrategy: string;
  strategies_object: any; //
  status: boolean; // Do we have data or not
  newDayData : Subject<any> = new Subject<any>();
  newStrategyChoice : Subject<any> = new Subject<any>();


  constructor(private http: HttpClient) {
    this.status = false;
    this._getStrategies()
    .subscribe({
      next: result => {
        this.strategies_object = result;
        console.log(result);
        this.status = true;
      },
      error: err => console.error(err),
      complete: () => console.log('Observer got a complete notification'),
    });
  }

  // Get strategies from server
  _getStrategies(){ return this.http.get("http://localhost:4000/api/plotdata") }
  // Get Strategies names
  getStrategiesNames() { return Object.keys(this.strategies_object) }
  getDataDownloadStatus(){ return this.status }
  setActiveStrategyName(s){
    console.log("New strategy set: " + s)
    this.activeStrategy = s
    this.newStrategyChoice.next(s)
  }
  getActiveStrategyName(){
    return this.activeStrategy
  }
  getActiveStrategy(){
    if(this.activeStrategy == undefined){
      return ""
    }
    return this.strategies_object[this.activeStrategy]
  }

  callForNewDay(){
    this.http.get("http://localhost:4001/newday")
    .subscribe({
      next: res => {
        if(Object.keys(res).length == 1){
          console.log("Weekend")
          return
        }
        this._getStrategies().subscribe({
          next: result => {
            this.strategies_object = result;
            this.status = true;
            this.newDayData.next(this.strategies_object);

          },
          error: err => console.error(err),
          complete: () => console.log('Observer got a complete notification'),
        });
      },
      error: err => console.error(err),
      complete: () => console.log('Observer got a complete notification'),
    });
  }

}
