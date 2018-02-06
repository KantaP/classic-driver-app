import { toPromise } from 'rxjs/operator/toPromise';
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
import { Component, NgZone, Inject, ElementRef } from '@angular/core'
import { NavController, Events, ModalController, NavParams, LoadingController } from 'ionic-angular'
import { ViewJobService } from './viewjob.service'
import { GlobalProvider } from '../../../../providers/global/global';
import { Util } from '../../../util/util';
import * as moment from 'moment'
import { TrackingService } from '../../../util/tracking.service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
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
  isFirst?: boolean
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

  loading: boolean = true
  signedin_vehicle_name: string
  isVehicleSignedIn: boolean = false
  job_status: string = '0'
  job: any
  journey: Array<journeyItem>
  journeyOther: Array<journeyItem>
  noResult: boolean = false
  alreadyAccept: boolean
  callback: any
  showAllJob: boolean
  map: any
  routeForModal: Array<routeItem>
  onSiteDetail: onSiteItem
  journeySelect: journeyItem
  alreadyEnList: Array<any>
  arrowIcons: Array<toggleIcon>
  startJourney: Array<any>
  popUpTitle: string;
  popUpMessage: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private _ngZone: NgZone,
    private modalCtrl: ModalController,
    private events: Events,
    private viewJobService: ViewJobService,
    private loadingCtrl: LoadingController,
    private modal: ModalProvider,
    private request: RequestProvider,
    private dataStore: DataStorage,
    private global: GlobalProvider,
    private tracking: TrackingService,
    private alertCtrl: AlertController
  ) {
    this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')

    this.events.subscribe('isVehicleSignIn', (isSignedIn) => {
      this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')
      this.isVehicleSignedIn = isSignedIn
    })

    if (Global.getGlobal('vehicle_signin_insert_id') > 0) {
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

    this.popUpMessage = ""
    this.popUpTitle = ""

    this.dataStore.clearLogDB('alreadyEnList_' + this.job.quote_id)
    Global.setGlobal('quote_id', this.job.quote_id)

    var mobileSettings = Global.getGlobal('mobile_settings')
    var appSetting = mobileSettings.filter((item) => item.key == 'app_setting_show_only_allocated')
    this.showAllJob = (appSetting.length > 0)
      ? appSetting[0].value
      : 0


  }



  ionViewDidLoad() {
    var loader = this.loadingCtrl.create({
      content: ''
    })
    loader.present()
    var todos = []
    todos.push(this.getJob(this.job.quote_id))

    if (this.showAllJob) {
      todos.push(this.getOtherJob(this.job.quote_id))
    }
    Promise.all(todos)
      .then(() => {
        loader.dismiss()
        this.loading = false
      })
      .catch(() => {
        loader.dismiss()
        this.loading = false
      })
  }

  closeModal(modalName: string) {
    this.modal.close(modalName)
  }

  toggleShowJourney(journeyIndex) {
    if (this.arrowIcons[journeyIndex].show) this.arrowIcons[journeyIndex].icon = 'ios-arrow-back'
    else this.arrowIcons[journeyIndex].icon = 'ios-arrow-down'
    this.arrowIcons[journeyIndex].show = !this.arrowIcons[journeyIndex].show
  }

  reOrderAvailableMovement() {
    this.alreadyEnList = this.alreadyEnList.map((item) => {
      return {
        movement_order: item.movement_order,
        status: false
      }
    })
    this.dataStore.getLogData('alreadyEnList_' + this.job.quote_id)
      .subscribe((data) => {
        var enListFromDB = data.rows
        if (enListFromDB.length == 0) this.alreadyEnList[0].status = true
        else {
          var next_movement_order = enListFromDB.item(0)
          this.alreadyEnList.forEach((item) => {
            if (item.movement_order == next_movement_order) {
              item.status = true
            }
          })
        }
        var nextMovementData = undefined
        this.journey.map((item) => {
          var nextMovement = item.movement.filter((item2) => item2.movement_order == next_movement_order)
          if (nextMovement.length > 0) {
            nextMovementData = nextMovement[0]
          }
        }
        )
        Global.setGlobal('next_movement', nextMovementData)
        // console.log(nextMovementData)
        // alert('next collection:' + nextMovementData.collection_address)
        // alert('next destination:' + nextMovementData.destination_address)
      })
  }

  ionViewWillLeave() {
    // this.callback(false)
  }

  closeViewRoute() {
    this.routeForModal = []
    this.modal.close('route-item')
  }

  openViewRoute(movement: any, journeyIndex: number, movementindex: number) {
    // if(movement.progress == 10 || movement.progress == 8) return false
    var filterMovement = this.alreadyEnList.filter((item) => item.movement_order == movement.movement_order)
    console.log(filterMovement)
    if (!filterMovement[0].status) return false
    this.routeForModal = []
    this.journeySelect = this.journey[journeyIndex]
    if (movementindex == (this.journey[journeyIndex].movement.length - 1)) {
      this.routeForModal = this.routeForModal.concat([{ col_latlng: movement.des_latlng }])
      this.onSiteDetail = {
        next_place: "",
        movement: movement,
        isLast: true,
        isFirst: false
      }
    } else if (movementindex == 0) {
      this.routeForModal = this.routeForModal.concat([{ col_latlng: movement.col_latlng }])
      this.onSiteDetail = {
        next_place: movement.destination_address,
        movement: movement,
        isLast: false,
        isFirst: true
      }
    }
    else {
      this.routeForModal = this.routeForModal.concat([{ col_latlng: movement.col_latlng }])
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
    this.navCtrl.push(ViewRoutePage, {
      journey: this.journeySelect
    })
  }

  openNavigation() {
    this.modal.close('route-item')
    this.navCtrl.push(ViewNavigationPage, {
      routeDetil: this.onSiteDetail
    })
  }

  /**
  * openSignOutDialog
  */
  public openSignOutDialog() {
    let modal = this.modalCtrl.create(SignOutVehicle, '', { enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper' })
    modal.present()
  }

  startJob(journeyIndex) {
    if (journeyIndex > 0 && this.startJourney[journeyIndex - 1].progress != 2) {
      alert('Cannot skip journey')
      return false;
    }
    var loader = this.loadingCtrl.create({
      content: '',
      duration: 10000
    })
    loader.present()
    this.request.startJourney(journeyIndex + 1, this.job.quote_id)
    .toPromise()
    .then((data) => {
        loader.dismiss()
        this.startJourney[journeyIndex].progress = 1
        Global.setGlobal('next_movement', this.journey[journeyIndex].movement[0])
        Global.setGlobal('journey_id', this.journey[journeyIndex].movement[0].j_id)
        this.setCurrentPoint()
      })
      .catch((error)=>{
        console.log('start journey error', error)
        loader.dismiss()
        this.request.saveRequestToStore({
          title: 'startjourney_' + journeyIndex + 1 + '_' + this.job.quote_id,
          url: Util.getSystemURL() + '/api/ecmdriver/jobs/startJourney',
          type:'POST',
          params: {
            j_order: journeyIndex + 1,
            quote_id: this.job.quote_id
          }
        })
        this.startJourney[journeyIndex].progress = 1
        Global.setGlobal('next_movement', this.journey[journeyIndex].movement[0])
        Global.setGlobal('journey_id', this.journey[journeyIndex].movement[0].j_id)
        this.setCurrentPoint()
      })
  }

  endJourney(journeyIndex) {
    var loader = this.loadingCtrl.create({
      content: '',
      duration: 10000
    })
    loader.present()
    this.request.endJourney(journeyIndex + 1, this.job.quote_id)
      .subscribe((data) => {
        loader.dismiss()
        this.startJourney[journeyIndex].progress = 2
        this.setCurrentPoint()
      })
  }

  getJob(quote_id) {
    return new Promise(async (resolve, reject) => {
      var jobCache = await this.dataStore.getLogDataPromise('job_' + quote_id + '_cache')
      var journeyProgressCache = await this.dataStore.getLogDataPromise('journey_progress_' + quote_id + '_cache')
      if ((jobCache != null && typeof jobCache == 'object') &&
        (journeyProgressCache != null && typeof jobCache == 'object')
      ) {
        this.journey = jobCache
        this.startJourney = journeyProgressCache
        if (this.journey.length > 0 && this.startJourney.length > 0) this.initJourney()
      }
      resolve()
    })
  }
  // getJob(quote_id){
  //     return new Promise(async (resolve ,reject)=>{
  //       try {
  //         var jobResult = await this.viewJobService.requestJobs(quote_id).toPromise()
  //         if(jobResult.code == 2){
  //           this.journey = jobResult.result
  //           this.dataStore.addLogData('job_'+quote_id+'_cache', jobResult.result)
  //           try {
  //             var progressResult =  await this.request.getJourneyProgress(this.job.quote_id).toPromise()
  //             this.dataStore.addLogData('journey_progress_'+quote_id+'_cache', progressResult.results)
  //             this.startJourney = progressResult.results
  //           }catch(err) {
  //             this.dataStore.addLogData('journey_progress_'+quote_id+'_cache', [])
  //             this.startJourney = []
  //           }
  //           if(this.journey.length > 0 && this.startJourney.length > 0) this.initJourney()
  //         }else{
  //             this.noResult = true
  //             this.dataStore.addLogData('job_'+quote_id+'_cache', [])
  //         }
  //         resolve()
  //       }catch(err) {
  //         var jobCache = await this.dataStore.getLogDataPromise('job_'+quote_id+'_cache')
  //         var journeyProgressCache = await this.dataStore.getLogDataPromise('journey_progress_'+quote_id+'_cache')
  //         if((jobCache != null && typeof jobCache == 'object' ) &&
  //             (journeyProgressCache != null && typeof jobCache == 'object')
  //           ) {
  //           this.journey = jobCache
  //           this.startJourney = journeyProgressCache
  //           if(this.journey.length > 0 && this.startJourney.length > 0) this.initJourney()
  //         }
  //         reject(new Error('Network has problem'))
  //       }
  //     })
  // }

  initJourney() {
    this.journey.map((item, index) => {
      this.arrowIcons.push({ icon: 'ios-arrow-back', show: false })
      item.movement.map((item2, index2) => {
        if (!item2.driver_confirm) this.alreadyAccept = false
      })
      const [last] = [...item.movement].reverse()
      var newLast = Object.assign({}, last)
      item.movement.push(newLast)
      item.movement[item.movement.length - 1].movement_order += 99
    })
    this.setCurrentPoint()
  }

  setCurrentPoint() {
    if (this.journey.length == 0) return false
    var alreadySet = false
    this.alreadyEnList = []
    var shouldNextIndex = 0
    for (let i = 0; i < this.journey.length; i++) {
      var already = this.journey[i].movement.map((item2, index3) => {

        var currentMovement = this.journey[i].movement[index3]
        var prevMovement = null
        if ((index3 - 1) < 0 && i > 0) {
          const [last] = [...this.journey[i - 1].movement].reverse()
          prevMovement = last
        } else {
          prevMovement = this.journey[i].movement[index3 - 1]
        }
        // console.log('index3', currentMovement)
        // console.log('index' , prevMovement)
        return {
          movement_order: item2.movement_order,
          status: (index3 == 0 && (currentMovement.progress == 6 || currentMovement.progress == 9) && i == 0 && this.startJourney[i].progress > 0)
            ? true
            : (index3 == 0 && currentMovement.progress == 6 && i > 0 && (prevMovement.progress == 8 || prevMovement.progress == 10) && this.startJourney[i].progress > 0)
              ? true
              : (index3 > 0
                && (
                  (
                    (prevMovement.progress == 8 || prevMovement.progress == 10)
                    && (currentMovement.progress == 6 || currentMovement.progress == 9)
                    && this.startJourney[i].progress > 0
                  )
                  ||
                  (
                    (prevMovement.progress == 8 && (currentMovement.movement_order - 99) > 0 && this.startJourney[i].progress > 0)
                  )
                )
              )
                ? true
                : false
        }
      })
      this.alreadyEnList = this.alreadyEnList.concat(already)
    }
    // console.log(this.alreadyEnList)
    var nextMovementData = undefined
    for (let index = 0; index < this.journey.length; index++) {
      shouldNextIndex = (this.alreadyEnList.filter((item3) => item3.status).length > 0)
        ? this.alreadyEnList.filter((item3) => item3.status)[0].movement_order
        : -1
      var nextMovement = this.journey[index].movement.filter((item2) => item2.movement_order == shouldNextIndex)
      if (nextMovement.length > 0) {
        nextMovementData = nextMovement[0]
        Global.setGlobal('journey_id', nextMovementData.j_id)
      }
    }
    // console.log('set next order:' , nextMovementData)

    Global.setGlobal('next_movement', nextMovementData)
    this.dataStore.addLogData('alreadyEnList_' + this.job.quote_id, shouldNextIndex)
    // console.log(this.alreadyEnList)
  }

  getOtherJob(quote_id: number) {
    return new Promise(async (resolve, reject) => {
      var otherJobCache = await this.dataStore.getLogDataPromise('other_' + quote_id + '_cache')
      if (otherJobCache != null) {
        this.journeyOther = otherJobCache
        this.journeyOther.map((item, index) => {
          const [last] = [...item.movement].reverse()
          item.movement.push(last)
        })
      } else {
        this.journeyOther = []
      }
    })
  }

  // getOtherJob(quote_id:number) {
  //   return new Promise(async (resolve, reject)=>{
  //     try {
  //       var otherJobs = await this.viewJobService.requestOtherJob(quote_id).toPromise()
  //       if(otherJobs.code == 2){
  //           this.journeyOther = otherJobs.result
  //           this.dataStore.addLogData('other_'+quote_id+'_cache', otherJobs.result)
  //           this.journeyOther.map((item,index)=>{
  //             const [last] = [...item.movement].reverse()
  //             item.movement.push(last)
  //           })
  //       }else{
  //         this.journeyOther = []
  //         this.dataStore.addLogData('other_'+quote_id+'_cache', [])
  //       }
  //       resolve()
  //     }catch(err) {
  //       var otherJobCache = await this.dataStore.getLogDataPromise('other_'+quote_id+'_cache')
  //       if(otherJobCache != null) {
  //         this.journeyOther = otherJobCache
  //         this.journeyOther.map((item,index)=>{
  //           const [last] = [...item.movement].reverse()
  //           item.movement.push(last)
  //         })
  //       }else{
  //         this.journeyOther = []
  //       }
  //       reject(new Error('Network has problem'))
  //     }
  //   })
  // }

  showNote(title: string, message: string) {
    if(message != '') {
      this.popUpTitle = title
      this.popUpMessage = message
      console.log(this.popUpTitle, this.popUpMessage)
      this.modal.open('popup-item')
    }
  }

  async acceptJob() {
    var loader = this.loadingCtrl.create({
      content: '',
      duration: 10000
    })
    loader.present()

    try {
      var position = await this.tracking.getCurrentPosition()
      var save = await this.request.saveDriverActionWhole({
        quote_id: this.job.quote_id,
        action: '6',
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        date_time: moment().format('YYYY-MM-DD HH:mm'),
        type: 'M'
      }).toPromise()
      console.log('save driver accept ', save)
    } catch (err) {
      console.log('save request to store until internet back')
      this.request.saveRequestToStore({
        title: 'driver_action_accept_' + this.navParams.get('quote_id'),
        url: Util.getSystemURL() + '/api/ecmdriver/mobileSettings/driveractionwhole',
        type: 'POST',
        params: {
          quote_id: this.job.quote_id,
          action: '6',
          lat: null,
          lng: null,
          date_time: moment().format('YYYY-MM-DD HH:mm'),
          type: 'M'
        }
      })
    }
    try {
      var acceptResult = await this.viewJobService.acceptJob(Global.getGlobal("driver_id"), this.job.quote_id).toPromise()
      var countPass = acceptResult.results.acceptJob.filter((item) => item).length
      var countMovementAssigned = 0
      this.journey.map((item) => {
        countMovementAssigned += (item.movement.length - 1)
      })
      if (countPass == countMovementAssigned) {
        for (let journeyItem of this.journey) {
          for (let mItem of journeyItem.movement) {
            console.log('movementItem', mItem)
            mItem.progress = 6
            mItem.driver_confirm = moment().format('YYYY-MM-DD HH:mm')
          }
        }

        let journeyCache = JSON.parse(JSON.stringify(this.journey))
        for (let i = 0; i < journeyCache.length; i++) {
          journeyCache[i].movement.pop()
        }
        this.alreadyAccept = true
        this.dataStore.addLogData('job_' + this.job.quote_id + '_cache', journeyCache)
      }
      loader.dismiss()
    } catch (err) {
      console.log('save request to store until internet back')
      // save request to store until internet back
      this.request.saveRequestToStore({
        title: 'accept_job_' + this.job.quote_id,
        url: Util.getSystemURL() + '/api/ecmdriver/jobs/driverAccept',
        type: 'POST',
        params: { driver_id: Global.getGlobal("driver_id"), quote_id: this.job.quote_id }
      })
      for (let journeyItem of this.journey) {
        for (let mItem of journeyItem.movement) {
          mItem.progress = 6
          mItem.driver_confirm = moment().format('YYYY-MM-DD HH:mm')
        }
      }
      //pop last movment before save
      let journeyCache = JSON.parse(JSON.stringify(this.journey))
      for (let i = 0; i < journeyCache.length; i++) {
        journeyCache[i].movement.pop()
      }
      this.alreadyAccept = true
      this.dataStore.addLogData('job_' + this.job.quote_id + '_cache', journeyCache)
      loader.dismiss()
    }
  }


  async openPassenger(movement: any, is_last: boolean, is_first: boolean) {
    this.modal.close('route-item')

    if (movement.progress != 10 && this.alreadyAccept) {
      var alertItem = this.alertCtrl.create({
        title: this.global.translate('On site'),
        message: this.global.translate('Are you sure?'),
        buttons: [
          {
            text: this.global.translate('Cancel'),
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: this.global.translate('Ok'),
            handler: async (data) => {
              var loader = this.loadingCtrl.create({
                content: '',
                duration: 10000
              })
              loader.present()
              try {
                var position = await this.tracking.getCurrentPosition()
                var save = await this.request.saveDriverAction({
                  movement_id: movement.movement_id,
                  action: '9',
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  date_time: moment().format('YYYY-MM-DD HH:mm'),
                  type: 'M',
                  quote_id: this.job.quote_id
                }).toPromise()
                console.log('save driver onsite ', save)
              } catch (err) {
                console.log('save request to store until internet back')
                this.request.saveRequestToStore({
                  title: 'driver_action_onsite_' + movement.movement_id,
                  url: Util.getSystemURL() + '/api/ecmdriver/mobileSettings/driveraction',
                  type: 'POST',
                  params: {
                    movement_id: movement.movement_id,
                    action: '9',
                    lat: null,
                    lng: null,
                    date_time: moment().format('YYYY-MM-DD HH:mm'),
                    type: 'M',
                    quote_id: this.job.quote_id
                  }
                })
              }

              if (!is_last) {
                try {
                  var updateResult = await this.request.updateToOnsite(movement.movement_order, this.job.quote_id).toPromise()
                  movement.progress = 9
                  Global.setGlobal('next_movement', movement)
                  this.navCtrl.push(PassengerListPage, {
                    movement_id: movement.movement_id,
                    movement_order: movement.movement_order,
                    progress: movement.progress,
                    j_id: movement.j_id,
                    quote_id: this.job.quote_id,
                    current_place: (is_last) ? movement.destination_address : movement.collection_address,
                    is_first: is_first,
                    is_last: is_last,
                    callback: this.callbackClosedPassenger.bind(this)
                  })
                  loader.dismiss()
                } catch (err) {
                  console.log('save request to store until internet back')
                  this.request.saveRequestToStore({
                    title: 'update_movement_to_onsite_' + movement.movement_id,
                    url: Util.getSystemURL() + '/api/ecmdriver/jobs/alreadyOnsite',
                    type: 'POST',
                    params: {
                      movement_order: movement.movement_order,
                      quote_id: this.job.quote_id
                    }
                  })
                  movement.progress = 9
                  Global.setGlobal('next_movement', movement)
                  this.navCtrl.push(PassengerListPage, {
                    movement_id: movement.movement_id,
                    movement_order: movement.movement_order,
                    progress: movement.progress,
                    j_id: movement.j_id,
                    quote_id: this.job.quote_id,
                    current_place: (is_last) ? movement.destination_address : movement.collection_address,
                    is_first: is_first,
                    is_last: is_last,
                    callback: this.callbackClosedPassenger.bind(this)
                  })
                  loader.dismiss()
                }
              } else {
                Global.setGlobal('next_movement', movement)
                this.navCtrl.push(PassengerListPage, {
                  movement_id: movement.movement_id,
                  movement_order: movement.movement_order,
                  progress: movement.progress,
                  j_id: movement.j_id,
                  quote_id: this.job.quote_id,
                  current_place: (is_last) ? movement.destination_address : movement.collection_address,
                  is_first: is_first,
                  is_last: is_last,
                  callback: this.callbackClosedPassenger.bind(this)
                })
                loader.dismiss()
              }
            }
          }
        ]
      })
      alertItem.present()
      //save action log

    }
  }

  callbackClosedPassenger(_params) {

    return new Promise((resolve, reject) => {
      this.journey.forEach((item) => {
        item.movement.forEach((item2, index2) => {
          if (item2.movement_order == _params.movement_order) {
            item2.progress = 8
            // Global.setGlobal('journey_id', 0)
            Global.setGlobal('movement_id', 0)
            if ((index2 + 1) > (item.movement.length - 1)) {
              this.dataStore.addLogData('alreadyEnList_' + _params.quote_id, _params.movement_order + 1)
                .then(() => {
                  this.reOrderAvailableMovement()
                  resolve();
                })
            } else {
              this.dataStore.addLogData('alreadyEnList_' + _params.quote_id, item.movement[index2 + 1].movement_order)
                .then(() => {
                  this.reOrderAvailableMovement()
                  resolve();
                })
            }
          }
        })
      })
      // console.log(this.journey)

    });
  }

  isCurrentPoint(movement_order) {
    if (this.alreadyEnList.length == 0) return false
    else {
      var filterMovement = this.alreadyEnList.filter((item) => item.movement_order == movement_order)
      return filterMovement[0].status
    }
    // return this.alreadyEnList[movementIndex].status
  }

  getCurrentPoint() {
    if (this.alreadyEnList.length == 0) return 0
    else {
      var filterMovement = this.alreadyEnList.filter((item) => item.status)
      return (filterMovement.length > 0) ? filterMovement[0].movement_order : 0
    }
  }

  showEndButtonofJourney(journeyIndex) {
    if (this.alreadyEnList.length > 0 && this.journey.length > 0) {
      var { movement } = this.journey[journeyIndex]
      var filterMovement = this.alreadyEnList.filter((item) => item.status)
      if (filterMovement.length > 0) {
        if (movement.filter((item) => item.movement_order == (filterMovement[0].movement_order - 99)).length > 0) return true
        else return false
      } else return false
    } else {
      return false
    }
  }

  async rejectJob() {
    var loader = this.loadingCtrl.create({
      content: '',
      duration: 10000
    })
    loader.present()
    try {
      var rejectResult = await this.request.rejectJob(Global.getGlobal("driver_id"), this.job.quote_id).toPromise()
      loader.dismiss()
      this.callback(true)
      this.navCtrl.pop()
    } catch (err) {
      this.request.saveRequestToStore({
        title: 'driver_reject_' + Global.getGlobal("driver_id") + '_job_' + this.job.quote_id,
        url: Util.getSystemURL() + '/api/ecmdriver/jobs/reject',
        type: 'POST',
        params: {
          driver_id: Global.getGlobal("driver_id"),
          quote_id: this.job.quote_id
        }
      })
      loader.dismiss()
      this.callback(true)
      this.navCtrl.pop()
    }
  }

  async endroute(journeyIndex) {
    var { movement } = this.journey[journeyIndex]
    var filterMovement = this.alreadyEnList.filter((item) => item.status)
    var endMovement = movement.filter((item) => item.movement_order == (filterMovement[0].movement_order - 99))
    var loader = this.loadingCtrl.create({
      content: '',
      duration: 10000
    })
    loader.present()
    try {
      var position = await this.tracking.getCurrentPosition()
      var save = await this.request.saveDriverAction({
        movement_id: endMovement[0].movement_id,
        action: '10',
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        date_time: moment().format('YYYY-MM-DD HH:mm'),
        type: 'M',
        quote_id: this.job.quote_id
      }).toPromise()
      console.log('save driver end ', save)
    } catch (err) {
      console.log('save request to store until internet back')
      this.request.saveRequestToStore({
        title: 'driver_action_onroute_' + endMovement[0].movement_id,
        url: Util.getSystemURL() + '/api/ecmdriver/mobileSettings/driveraction',
        type: 'POST',
        params: {
          movement_id: endMovement[0].movement_id,
          action: '10',
          lat: null,
          lng: null,
          date_time: moment().format('YYYY-MM-DD HH:mm'),
          type: 'M',
          quote_id: this.job.quote_id
        }
      })
    }
    try {
      var endResult = await this.request.updateToEndRoute(endMovement[0].movement_order, this.job.quote_id, endMovement[0].movement_id).toPromise()
    } catch (err) {
      this.request.saveRequestToStore({
        title: 'enrouote_' + endMovement[0].movement_id + '_' + Global.getGlobal('driver_id'),
        url: Util.getSystemURL() + '/api/ecmdriver/jobs/endroute',
        type: 'POST',
        params: {
          movement_order: endMovement[0].movement_order,
          quote_id: this.job.quote_id,
          movement_id: endMovement[0].movement_id
        }
      })
    }
    try {
      var endJourneyResult = await this.request.endJourney(journeyIndex + 1, this.job.quote_id).toPromise()
      this.startJourney[journeyIndex].progress = 2
      this.dataStore.addLogData('alreadyEnList_' + this.job.quote_id, endMovement[0].movement_order + 1)
        .then(() => {
          this.setCurrentPoint()
        })
      Global.setGlobal('journey_id', endMovement[0].j_id)
      Global.setGlobal('movement_id', 0)
    } catch (err) {
      this.request.saveRequestToStore({
        title: 'enJourney_' + journeyIndex + 1 + '_' + this.job.quote_id,
        url: Util.getSystemURL() + '/api/ecmdriver/jobs/endJourney',
        type: 'POST',
        params: {
          j_order: journeyIndex + 1,
          quote_id: this.job.quote_id,
        }
      })
      this.startJourney[journeyIndex].progress = 2
      this.dataStore.addLogData('alreadyEnList_' + this.job.quote_id, endMovement[0].movement_order + 1)
        .then(() => {
          this.setCurrentPoint()
        })
      Global.setGlobal('journey_id', endMovement[0].j_id)
      Global.setGlobal('movement_id', 0)
    }
    loader.dismiss()
  }
}
