import { ModalDirective } from './../../../../directives/modal/modal';
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

interface toggleIcon {
  icon: string;
  show: boolean;
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
    arrowIcons: Array<toggleIcon>
    startJourney: Array<any>
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

        this.arrowIcons = []
        this.startJourney = []

        this.routeForModal = []
        this.onSiteDetail = {}
        this.journeySelect = {}
        this.alreadyEnList = []

        this.dataStore.clearLogDB('alreadyEnList_'+this.job.quote_id)
        Global.setGlobal('quote_id',this.job.quote_id)
        var mobileSettings = Global.getGlobal('mobile_settings')
        var appSetting = mobileSettings.filter((item)=>item.key=='app_setting_show_only_allocated')
        this.showAllJob = (appSetting.length > 0)
                          ? appSetting[0].value
                          : 0
        this.getJob(this.job.quote_id)
        if(this.showAllJob) {
          this.getOtherJob(this.job.quote_id)
        }

    }

    toggleShowJourney(journeyIndex) {
      if(this.arrowIcons[journeyIndex].show) this.arrowIcons[journeyIndex].icon = 'ios-arrow-back'
      else this.arrowIcons[journeyIndex].icon = 'ios-arrow-down'
      this.arrowIcons[journeyIndex].show = !this.arrowIcons[journeyIndex].show
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
        if(enListFromDB.length == 0) this.alreadyEnList[0].status = true
        else {
          var next_movement_order = enListFromDB.item(0)
          this.alreadyEnList.forEach((item)=>{
            if(item.movement_order == next_movement_order) {
              item.status = true
            }
          })
        }
        var nextMovementData = undefined
        this.journey.forEach((item)=>{
            var nextMovement = item.movement.filter((item2)=>item2.movement_order == next_movement_order)
            if(nextMovement.length > 0) {
              nextMovementData = nextMovement[0]
            }
          }
        )
        Global.setGlobal('next_movement',nextMovementData)
        // console.log(nextMovementData)
        // alert('next collection:' + nextMovementData.collection_address)
        // alert('next destination:' + nextMovementData.destination_address)
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
      // if(movement.progress == 10 || movement.progress == 8) return false
      var filterMovement = this.alreadyEnList.filter((item)=>item.movement_order == movement.movement_order)
      console.log(filterMovement)
      if(!filterMovement[0].status) return false
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

    startJob(journeyIndex) {
      if(journeyIndex > 0 && this.startJourney[journeyIndex-1].progress != 2) {
        alert('Cannot skip journey')
        return false;
      }
      var loader = this.loadingCtrl.create({
        content: ''
      })
      loader.present()
      this.request.startJourney(journeyIndex+1,this.job.quote_id)
      .subscribe((data)=>{
        loader.dismiss()
        this.startJourney[journeyIndex].progress = 1
        Global.setGlobal('next_movement',this.journey[journeyIndex].movement[0])
        Global.setGlobal('journey_id' , this.journey[journeyIndex].movement[0].j_id)
        this.setCurrentPoint()
      })
    }

    endJourney(journeyIndex) {
      var loader = this.loadingCtrl.create({
        content: ''
      })
      loader.present()
      this.request.endJourney(journeyIndex+1,this.job.quote_id)
      .subscribe((data)=>{
        loader.dismiss()
        this.startJourney[journeyIndex].progress = 2
        this.setCurrentPoint()
      })
    }

    getJob(quote_id){
        this.viewJobService.requestJobs(quote_id)
        .subscribe((res)=>{
            console.log('getJob res:', res)
            // this._ngZone.run(()=>{
                this.loading = false
                if(res.code == 2){
                  this.journey = res.result
                    this.request.getJourneyProgress(this.job.quote_id)
                    .subscribe((data)=>{
                      this.startJourney = data.results
                      this.journey.forEach((item,index)=>{
                        this.arrowIcons.push({icon:'ios-arrow-back',show:false})
                        item.movement.forEach((item2,index2)=>{
                          if(!item2.driver_confirm) this.alreadyAccept = false
                        })
                        const [last] = [...item.movement].reverse()
                        var newLast = Object.assign({},last)
                        item.movement.push(newLast)
                        item.movement[item.movement.length-1].movement_order += 99
                      })
                      this.setCurrentPoint()
                    })
                }else{
                    this.noResult = true
                }
            // })
        },
        (err)=>{
            console.log('getJob err:', err)
            this._ngZone.run(()=>{
                this.loading = false
                this.noResult = true
            })
        })
    }

    setCurrentPoint() {
      if(this.journey.length == 0) return false
      var alreadySet = false
      this.alreadyEnList = []
      var shouldNextIndex = 0
      for(let i = 0 ; i < this.journey.length ; i++){
        var already = this.journey[i].movement.map((item2,index3)=>{
          // console.log(index3 , this.journey[i].movement[index3].progress)
          return {
            movement_order: item2.movement_order,
            status: (index3 == 0 && this.journey[i].movement[index3].progress == 6)
                    ? true
                    : (index3 > 0 && (this.journey[i].movement[index3-1].progress == 8 || this.journey[i].movement[index3-1].progress == 10) && (this.journey[i].movement[index3].progress == 6 || this.journey[i].movement[index3].progress == 9))
                      ? true
                      : false
          }
        })
        this.alreadyEnList = this.alreadyEnList.concat(already)
      }
      // console.log(this.alreadyEnList)
      var nextMovementData = undefined
      for(let index = 0 ; index < this.journey.length; index++) {
        shouldNextIndex = this.alreadyEnList.filter((item3)=>item3.status)[0].movement_order
        var nextMovement = this.journey[index].movement.filter((item2)=>item2.movement_order == shouldNextIndex)
        if(nextMovement.length > 0) {
          nextMovementData = nextMovement[0]
          Global.setGlobal('journey_id', nextMovementData.j_id)
        }
      }
      console.log('set next order:' , nextMovementData)

      Global.setGlobal('next_movement',nextMovementData)
      this.dataStore.addLogData('alreadyEnList_'+this.job.quote_id, shouldNextIndex)
      // console.log(this.alreadyEnList)
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
            this.journey = this.journey.map((journeyItem)=>{
              journeyItem.movement.map((mItem)=>{
                mItem.progress = 6
              })
              return journeyItem
            })
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
                      .subscribe((data)=>{
                        movement.progress = 9
                        Global.setGlobal('next_movement',movement)
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
                      })
        }else{
          Global.setGlobal('next_movement',movement)
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
    }

    callbackClosedPassenger(_params) {

        return new Promise((resolve, reject) => {
          this.journey.forEach((item)=>{
            item.movement.forEach((item2,index2)=>{
              if(item2.movement_order == _params.movement_order) {
                item2.progress = 8
                // Global.setGlobal('journey_id', 0)
                Global.setGlobal('movement_id' , 0)
                if((index2+1)>(item.movement.length-1)) {
                  this.dataStore.addLogData('alreadyEnList_'+_params.quote_id,_params.movement_order+1)
                  .then(()=>{
                    this.reOrderAvailableMovement()
                  })
                }else{
                  this.dataStore.addLogData('alreadyEnList_'+_params.quote_id,item.movement[index2+1].movement_order)
                  .then(()=>{
                    this.reOrderAvailableMovement()
                  })
                }
              }
            })
          })
          // console.log(this.journey)
          resolve();
      });
    }

    isCurrentPoint(movement_order) {
      if(this.alreadyEnList.length == 0) return false
      else  {
        var filterMovement = this.alreadyEnList.filter((item)=>item.movement_order == movement_order)
        return filterMovement[0].status
      }
      // return this.alreadyEnList[movementIndex].status
    }

    getCurrentPoint(){
      if(this.alreadyEnList.length == 0) return 0
      else  {
        var filterMovement = this.alreadyEnList.filter((item)=>item.status)
        return (filterMovement.length > 0) ? filterMovement[0].movement_order : 0
      }
    }

    showEndButtonofJourney(journeyIndex) {
      if(this.alreadyEnList.length > 0 && this.journey.length > 0) {
        var { movement } = this.journey[journeyIndex]
        var filterMovement = this.alreadyEnList.filter((item)=>item.status)
        if(filterMovement.length > 0){
          if(movement.filter((item)=>item.movement_order == (filterMovement[0].movement_order-99)).length > 0) return true
          else return false
        }else return false
      }else{
        return false
      }
    }

    endroute(journeyIndex) {
          var { movement } = this.journey[journeyIndex]
          var filterMovement = this.alreadyEnList.filter((item)=>item.status)
          var endMovement = movement.filter((item)=>item.movement_order == (filterMovement[0].movement_order-99))
          var loader = this.loadingCtrl.create({
            content: ''
          })
          loader.present()
          this.request.updateToEndRoute(endMovement[0].movement_order,this.job.quote_id,endMovement[0].movement_id)
            .subscribe(
              (res) => {
                this.request.endJourney(journeyIndex+1,this.job.quote_id)
                .subscribe((data)=>{
                  loader.dismiss()
                  this.startJourney[journeyIndex].progress = 2
                  this.dataStore.addLogData('alreadyEnList_'+this.job.quote_id,endMovement[0].movement_order+1)
                  .then(()=>{
                    this.setCurrentPoint()
                  })
                })
                Global.setGlobal('journey_id', 0)
                Global.setGlobal('movement_id' , 0)
              },
              (err) => {
                alert('Cannot end this route')
              }
            )
        }
}
