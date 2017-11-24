import { DataStorage } from './../../../util/storage';
import { RequestProvider } from './../../../../providers/request/request';
import { ViewNavigationPage } from './../../../view-navigation/view-navigation';
import { ViewRoutePage } from './../../../view-route/view-route';
import { ModalProvider } from './../../../../providers/modal/modal';
import { LoginService } from './../../../login/login.service';
import { PassengerListPage } from './../../../passenger-list/passenger-list';
import { SignOutVehicle } from './../../../signoutvehicle/signoutvehicle'
import { Global } from './../../../util/global'
import { Component, NgZone , Inject , ElementRef } from '@angular/core'
import { NavController, Events, ModalController, NavParams, LoadingController } from 'ionic-angular'
import { ViewJobService } from './viewjob.service'
interface journeyItem {
  journeygroup?: number
  movement?: Array<any>
}

interface routeItem {
  col_latlng?: string;
  des_latlng?: string;
}

interface onSiteItem {
  next_place?: string
  movement?: any
  isLast?: boolean
  isFirst?:boolean
}


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
    journey:Array<journeyItem>
    journeyOther: Array<journeyItem>
    noResult:boolean = false
    alreadyAccept: boolean
    callback:any
    showAllJob: boolean
    map: any
    routeForModal: Array<routeItem>
    onSiteDetail: onSiteItem
    journeySelect: journeyItem
    alreadyEnList: Array<any>
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private _ngZone: NgZone,
        private modalCtrl: ModalController,
        private events: Events,
        private viewJobService: ViewJobService,
        private loadingCtrl: LoadingController,
        private modal: ModalProvider,
        private request:RequestProvider,
        private dataStore: DataStorage
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
        var mobileSettings = Global.getGlobal('mobile_settings')
        var appSetting = mobileSettings.filter((item)=>item.key=='app_setting_show_only_allocated')
        this.showAllJob = (appSetting.length > 0)
                          ? appSetting[0].value
                          : 0
        this.getJob(this.job.quote_id)
        if(this.showAllJob) {
          this.getOtherJob(this.job.quote_id)
        }

        this.routeForModal = []
        this.onSiteDetail = {}
        this.journeySelect = {}
        Global.setGlobal('quote_id',this.job.quote_id)
    }

    reOrderAvailableMovement() {
      this.alreadyEnList = this.alreadyEnList.map((item)=>{
        return {
          movement_order: item.movement_order,
          status: false
        }
      })
      this.dataStore.getLogData('alreadyEnList_'+this.job.quote_id)
      .subscribe((data)=>{
        var enListFromDB = data.rows
        console.log(enListFromDB)
        if(enListFromDB.length == 0) this.alreadyEnList[0].status = true
        else {
          var next_movement_order = enListFromDB.item(0)
          console.log(next_movement_order)
          this.alreadyEnList.forEach((item)=>{
            if(item.movement_order == next_movement_order) {
              item.status = true
            }
          })
        }
        // console.log(this.alreadyEnList)
      })
    }

    ionViewWillLeave(){
      // this.callback(false)
    }

    closeViewRoute() {
      this.routeForModal = []
      this.modal.close('route-item')
    }

    openViewRoute(movement:any,journeyIndex:number,movementindex:number) {
      console.log(movement)
      if(movement.progress == 10) return false
      // console.log(this.alreadyEnList)
      if(!this.alreadyEnList[movementindex].status) return false
      this.routeForModal = []
      this.journeySelect = this.journey[journeyIndex]
      if(movementindex == (this.journey[journeyIndex].movement.length - 1)) {
        this.routeForModal = this.routeForModal.concat([{col_latlng:movement.des_latlng}])
        this.onSiteDetail = {
          next_place: "",
          movement: movement,
          isLast: true,
          isFirst: false
        }
      }else if(movementindex == 0) {
        this.routeForModal = this.routeForModal.concat([{col_latlng:movement.col_latlng}])
        this.onSiteDetail = {
          next_place:movement.destination_address,
          movement: movement,
          isLast: false,
          isFirst: true
        }
      }
      else{
        this.routeForModal = this.routeForModal.concat([{col_latlng:movement.col_latlng}])
        this.onSiteDetail = {
          next_place: movement.destination_address,
          movement: movement,
          isLast: false,
          isFirst: false
        }
      }
      this.modal.open('route-item')
    }

    openWholeRoute() {
      this.modal.close('route-item')
      this.navCtrl.push(ViewRoutePage,{
        journey: this.journeySelect
      })
    }

    openNavigation() {
      this.modal.close('route-item')
      this.navCtrl.push(ViewNavigationPage,{
        routeDetil: this.onSiteDetail
      })
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
            // this._ngZone.run(()=>{
                this.loading = false
                if(res.code == 2){
                    this.journey = res.result
                    this.journey.forEach((item,index)=>{
                      item.movement.forEach((item2,index2)=>{
                        if(!item2.driver_confirm) this.alreadyAccept = false
                      })
                      const [last] = [...item.movement].reverse()
                      var newLast = Object.assign({},last)
                      item.movement.push(newLast)
                      item.movement[item.movement.length-1].movement_order += 99
                      this.alreadyEnList = item.movement.map((item)=>{
                        return {
                          movement_order: item.movement_order,
                          status: false
                        }
                      })
                      this.reOrderAvailableMovement()
                      // var movementEnded = item.movement.filter((item)=>item.progress == 10)
                      // var movementOnRoute = item.movement.filter((item)=>item.progress == 8)
                      // var movementOnSite = item.movement.filter((item)=>item.progress == 9)
                      // console.log(movementEnded.length,movementOnRoute.length,movementOnSite.length)

                    })
                }else{
                    this.noResult = true
                }
            // })

            console.log(this.journey)
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
          // this._ngZone.run(()=>{
            // this.loading = false
            if(res.code == 2){
                this.journeyOther = res.result
                this.journeyOther.forEach((item,index)=>{
                  const [last] = [...item.movement].reverse()
                  item.movement.push(last)
                })
            }
        // })
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
          var countPass = data.results.acceptJob.filter((item)=>item).length
          var countMovementAssigned = 0
          this.journey.forEach((item)=>{
            countMovementAssigned += (item.movement.length-1)
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

    openPassenger(movement: any, is_last: boolean, is_first:boolean) {
      this.modal.close('route-item')
      if(movement.progress != 10 && this.alreadyAccept) {
        if(!is_last) {
          this.request.updateToOnsite(movement.movement_order,this.job.quote_id)
                      .subscribe((data)=>{console.log(data)})
        }
        this.navCtrl.push(PassengerListPage, {
          movement_id:movement.movement_id,
          movement_order: movement.movement_order,
          progress: movement.progress,
          j_id: movement.j_id,
          quote_id:this.job.quote_id,
          current_place: (is_last) ? movement.destination_address : movement.collection_address,
          is_first: is_first,
          is_last: is_last,
          callback: this.callbackClosedPassenger.bind(this)
        })
      }
    }

    callbackClosedPassenger(_params) {
      console.log(_params)
      return new Promise((resolve, reject) => {
        this.journey.forEach((item)=>{
          item.movement.forEach((item2,index2)=>{

            if(item2.movement_order == _params.movement_order) {
              // item2.progress = 10
              if((index2+1)>(item.movement.length-1)) {
                this.dataStore.addLogData('alreadyEnList_'+_params.quote_id,_params.movement_order+1)
              }else{
                this.dataStore.addLogData('alreadyEnList_'+_params.quote_id,item.movement[index2+1].movement_order)
              }

              setTimeout(()=>this.reOrderAvailableMovement(),500)
            }
          })
        })
        // console.log(this.journey)
        resolve();
    });
    }
}
