import { PassengerListPage } from './../../../passenger-list/passenger-list';
import { SignOutVehicle } from './../../../signoutvehicle/signoutvehicle'
import { Global } from './../../../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController, NavParams, LoadingController } from 'ionic-angular'
import { ViewJobService } from './viewjob.service'


@Component({
    selector: 'page-viewjob',
    templateUrl: 'viewjob.html',
    providers: [ViewJobService]
})

export class ViewJobPage {

    loading:boolean = true
    signedin_vehicle_name: string
    isVehicleSignedIn:boolean = false
    job_status:string = '0'
    job:any
    journey:any
    journeyOther: any
    noResult:boolean = false
    alreadyAccept: boolean
    callback:any
    showAllJob: boolean
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private _ngZone: NgZone,
        private modalCtrl: ModalController,
        private events: Events,
        private viewJobService: ViewJobService,
        private loadingCtrl: LoadingController
    ) {

        this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')

        this.events.subscribe('isVehicleSignIn', (isSignedIn)=>{
            this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')
            this.isVehicleSignedIn = isSignedIn
        })

        if(Global.getGlobal('vehicle_signin_insert_id') > 0){
            this.isVehicleSignedIn = true
        }

        this.job = this.navParams.get("data")
        this.callback = this.navParams.get("callback")
        this.alreadyAccept = true
        this.journeyOther = []
        console.log(this.job)
        var mobileSettings = Global.getGlobal('mobile_settings')
        this.showAllJob = mobileSettings.filter((item)=>item.key=='app_setting_show_only_allocated')[0].value
        this.getJob(this.job.quote_id)
        if(this.showAllJob) {
          this.getOtherJob(this.job.quote_id)
        }


    }

    ionViewWillLeave(){
      this.callback(false)
    }

    /**
    * openSignOutDialog
    */
    public openSignOutDialog() {
        let modal = this.modalCtrl.create(SignOutVehicle, '', {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper'})
        modal.present()
    }

    public getJob(quote_id){
        this.viewJobService.requestJobs(quote_id)
        .subscribe((res)=>{
            console.log('getJob res:', res)
            this._ngZone.run(()=>{
                this.loading = false
                if(res.code == 2){
                    this.journey = res.result
                    this.journey.forEach((item,index)=>{
                      item.movement.forEach((item2,index2)=>{
                        if(!item2.driver_confirm) this.alreadyAccept = false
                      })
                    })
                }else{
                    this.noResult = true
                }
            })
        },
        (err)=>{
            console.log('getJob err:', err)
            this._ngZone.run(()=>{
                this.loading = false
                this.noResult = true
            })
        })
    }

    getOtherJob(quote_id:number) {
      this.viewJobService.requestOtherJob(quote_id)
      .subscribe(
        (res)=>{
          console.log('get other driver job res:', res)
          this._ngZone.run(()=>{
            // this.loading = false
            if(res.code == 2){
                this.journeyOther = res.result
            }
        })
        }
      )
    }

    acceptJob() {
      var loader = this.loadingCtrl.create({
        content: ''
      })
      loader.present()
      this.viewJobService.acceptJob(Global.getGlobal("driver_id"),this.job.quote_id)
      .subscribe(
        (data)=>{
          loader.dismiss()
          console.log(data)
          var countPass = data.results.acceptJob.filter((item)=>item).length
          var countMovementAssigned = 0
          this.journey.forEach((item)=>{
            countMovementAssigned += item.movement.length
          })
          if(countPass == countMovementAssigned) {
            this.alreadyAccept = true
          }
        },
        (err)=>{
          loader.dismiss()
          console.log(err)
        }
      )
    }

    openPassenger(movement_id: number,collection_address: string,destination_address:string,progress:number) {
      if(progress != 10 && this.alreadyAccept) {
        this.navCtrl.push(PassengerListPage, {
          movement_id,
          quote_id:this.job.quote_id,
          collection_address,
          destination_address,
          callback: this.callbackClosedPassenger.bind(this)
        })
      }
    }

    callbackClosedPassenger(_params) {
      return new Promise((resolve, reject) => {
        this.journey = this.journey.map((item)=>{
          item.movement = item.movement.map((item2)=>{
            if(item2.movement_id == _params.movement_id) item2.progress = 10
            return item2
          })
          return item
        })
        // console.log(this.journey)
        resolve();
    });
    }
}
