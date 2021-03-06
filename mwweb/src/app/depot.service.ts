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
  restrictions : Subject<any> = new Subject<any>();


  constructor(private http: HttpClient) {
    this.status = false;
    this._getStrategies()
    .subscribe({
      next: result => {
        console.log(result)
        this.strategies_object = result;
        this.status = true;
      },
      error: err => console.error(err),
      complete: () => {},
    });
  }

  getLatestDate(){
    return Object.keys(this.getActiveStrategy()["values"]).sort().reverse()[0]

  }
  // Get strategies from server
  _getStrategies(){ return this.http.get("http://localhost:4000/api/plotdata") }
  // Get Strategies names
  getStrategiesNames() { return Object.keys(this.strategies_object) }
  getDataDownloadStatus(){ return this.status }
  setActiveStrategyName(s){
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

  sendUpdatedRestrictions(newRestrictions){
    this.http.post("http://localhost:4000/api/restrictions", newRestrictions)
      .subscribe({
        next: result => {},
        error: err => console.error(err),
        complete: () => {},
      });
  }
  getRestrictions(){
    this.http.get("http://localhost:4000/api/restrictions")
      .subscribe({
        next: (result) => {
          console.log("getRestrictions()")
          console.log(result)
          this.restrictions.next(result["restrictions"])
        },
        error: err => console.error(err),
        complete: () => {},
      });
  }

  callForNewDay(){
    // Call handler newday to trigger a new day
    // Afterwards call for new data to plot
    this.http.get("http://localhost:4000/api/newday")
    .subscribe({
      next: res => {},
      error: err => console.error(err),
      complete: () => {
        this._getStrategies().subscribe({
          next: result => {
            console.log(result)
            this.strategies_object = result;
            this.status = true;
            this.newDayData.next(this.strategies_object);
          },
          error: err => console.error(err),
          complete: () => {},
        });
      }
    });
  }

}
