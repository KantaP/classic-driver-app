import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/interval'
import 'rxjs/add/operator/timeInterval'
import { TrackingService } from './../util/tracking.service'
import { Component, NgZone, OnDestroy } from '@angular/core'
import { NavController, NavParams, MenuController, Events } from 'ionic-angular'
import { HomeService } from './home.service'
import { Global } from '../util/global'
import { SignInVehiclePage } from '../signinvehiclelist/signinvehiclepage'
import { VehicleCheckPage } from '../vehiclecheck/vehiclecheck'
import moment from 'moment'
import { JobsViewPage } from "../job/job"
import { Subscription } from "rxjs/Subscription"

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers:[HomeService, TrackingService]
})
export class HomePage implements OnDestroy {
  hs:HomeService
  isStartWork:boolean = false
  lastLoginDate:any = '--'
  lastLoginTime:any = '--:--'
  jobsAmount:number = 0
  logo:string = ''
  isCheckNTrack: boolean = false

  timer:Subscription = null

  constructor(
    public homeService: HomeService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public menuCtrl: MenuController,
    public events: Events,
    public _ngZone: NgZone,
    public trackingService: TrackingService) {  
    
    let dt = this.navParams.get('datetime')

    if(dt != void(0) && dt != ''){
      this.lastLoginDate = moment(dt).format('DD MMM YYYY')
      this.lastLoginTime = moment(dt).format('hh:mmA')
    }

    console.log("last login ", dt, this.lastLoginDate, this.lastLoginTime)

    this.menuCtrl.enable(true)
    this.hs = homeService

    this.events.subscribe('isStartWork',(isStart)=>{
      console.log("event isStartWork" ,isStart)
      this.isStartWork = isStart
    })

    this.getJobAmount()

    this.getCheckNTrack()
    
    this.timer = this.startTracking()
  }

  private startTracking(){
    return Observable
    .interval(1000*60 /* ms */)
    .timeInterval()
    .subscribe(
      (x)=>{
          console.log('Next: ' + x)
          this.trackingService.sendTracking()
      },
      (err)=>{
          console.log('Error: ' + err)
      },
      ()=>{
          console.log('Completed')
      })
  }

  public unSubscribe(source:Subscription){
    if(source != null){
      source.unsubscribe()
    }
  }

  ngOnDestroy() {
    console.log('Home ngOnDestroy')
    this.unSubscribe(this.timer)
    
  }

  private getJobAmount(){
    this.homeService.requestJobsAmount()
    .subscribe((res)=>{
      console.log('requestJobsAmount succ:', res)
      this._ngZone.run(()=>{
        this.jobsAmount = res.result.length
        this.logo = Global.getGlobal('company_logo')
      })

    },(err)=>{
      console.log('requestJobsAmount err:', err)
    })
  }

  private getCheckNTrack(){
    this.homeService.requestCheckNTrack()
    .subscribe((res)=>{
      console.log('getCheckNTrack succ:', res)
      this._ngZone.run(()=>{
        if(res.result == 1){
          this.isCheckNTrack = true
        }else{
          this.isCheckNTrack = false
        }
        this.events.publish('isCheckNTrack', this.isCheckNTrack)
      })

    },(err)=>{
      console.log('getCheckNTrack err:', err)
      this.events.publish('isCheckNTrack', this.isCheckNTrack)
    })
  }

  private openPage( p ){
    if(p == 'sign_in_vehicle'){
      this.navCtrl.push(SignInVehiclePage)
    }else if (p == 'vehicle_check') {
      this.navCtrl.push(VehicleCheckPage)
    }
    else if (p == 'view_jobs') {

      if(this.isCheckNTrack){ return }
      
      this.navCtrl.push(JobsViewPage)
    }
  }
}
