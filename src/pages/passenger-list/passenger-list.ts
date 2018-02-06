import { TrackingService } from './../util/tracking.service';
import { GlobalProvider } from './../../providers/global/global';
import { Passenger } from './../util/model/passenger';
import { RequestProvider } from './../../providers/request/request';
import { DataStorage } from './../util/storage';
import { ModalProvider } from './../../providers/modal/modal';
import { Global } from './../util/global';
import { Util } from './../util/util';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Component, HostListener, Inject, ElementRef } from '@angular/core';
import { NavController, NavParams, normalizeURL, LoadingController } from 'ionic-angular';
import * as moment from 'moment'
import { PassengerAddNotePage } from '../passenger-add-note/passenger-add-note';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Button } from 'ionic-angular/components/button/button';
import { NFC } from '@ionic-native/nfc';


/**
 * Generated class for the PassengerListPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
interface NotiPayload {
  title?: string
  message?: string
  sentfrom?: string;
  wrong_point?: string;
  time?: string,
  name?: string,
  route?: string,
  place?: string,
  status?: string,
  note?: string
}

interface ListTodo {
  waitBus?: number;
  waitAlign?: number;
  aligned?: number;
  availableOnBus?: number;
}

interface FailedItem {
  title?: string;
  shouldBeAddress?: string;
  icon?: string;
  callback?: Function;
  notAllow?: boolean
}

@Component({
  selector: 'page-passenger-list',
  templateUrl: 'passenger-list.html',
})
export class PassengerListPage {

  private passengers: Array<Passenger>
  private searchInput: string
  private passengerStore: Array<Passenger>
  private timer: any
  private listTodo: ListTodo
  private passengerItem: Passenger
  private colorViewInstructors: string
  private colorViewForceLogin: string
  private viewinstructors: boolean
  private viewForceLogin: boolean
  private viewForceLogOut: boolean
  private colorViewForceLogout: string
  private startRead: boolean
  private rfValue: string
  private elements: any
  private timerSearch: any
  private routeString: string
  private callback: any
  private failedItem: FailedItem
  private allPassenger: Array<Passenger>
  private allPassengerSystem: Array<Passenger>
  private wrong_point: string;
  private status_text: string;
  private lastPoint: boolean;
  private connection: string;
  popUpTitle: string;
  popUpMessage: string;

  // private readerProvider: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private http: Http,
    private modal: ModalProvider,
    private loading: LoadingController,
    @Inject(ElementRef) elementRef: ElementRef,
    private dataStorage: DataStorage,
    private request: RequestProvider,
    private alertCtrl: AlertController,
    private global: GlobalProvider,
    private nfc: NFC,
    private tracking: TrackingService
  ) {
    this.passengers = []
    this.passengerStore = []
    this.passengerItem = {}
    this.searchInput = ""
    this.timer = null
    this.timerSearch = null
    this.listTodo = {
      waitAlign: 0,
      waitBus: 0,
      aligned: 0,
      availableOnBus: 0
    }
    this.colorViewInstructors = "disable"
    this.colorViewForceLogin = "disable"
    this.colorViewForceLogout = "primary"
    this.viewForceLogOut = false
    this.viewForceLogin = true
    this.viewinstructors = true
    this.startRead = false
    this.rfValue = ""
    this.elements = elementRef
    this.routeString = ""
    this.callback = this.navParams.get('callback')
    this.failedItem = {
      icon: '',
      title: '',
      shouldBeAddress: ''
    }
    this.wrong_point = '0'
    this.status_text = ''
    this.lastPoint = false
    this.popUpTitle = ""
    this.popUpMessage = ""
    // this.readerProvider = "nfc"
    this.connection = Global.getGlobal('connection')
    Global.setGlobal('journey_id', this.navParams.get('j_id'))
    Global.setGlobal('movement_id', this.navParams.get('movement_id'))
    Global.setGlobal('job_status', this.navParams.get('progress'))
  }



  //for read rfid
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    // if (this.readerProvider == 'rfid') {
      var rfReadEle: HTMLElement = this.elements.nativeElement.querySelector('#rfRead')
      rfReadEle.focus()
      clearTimeout(this.timer)
      this.startRead = true
      if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
        this.rfValue += event.key
      } else if (event.keyCode == 13) {
        this.searchInput = ""
        this.timer = setTimeout(() => {
          // console.log('scanning', this.passengerStore)
          var passenger = this.passengerStore.filter((item) => item.RFID == this.rfValue)
          this.closeModal('passenger-item')
          this.closeModal('warning-popup')
          if (passenger.length > 0) {
            var loader = this.loading.create({
              content: 'Scanning...'
            })
            loader.present()
            this.scanUpdate(passenger)
              .then(() => {
                loader.dismiss()
                this.rfValue = ""
                this.initPassengers()
                var showPassenger = this.passengerStore.filter((item) => item.passenger_id == passenger[0].passenger_id)
                this.openModal(
                  showPassenger[0],
                  false
                )
              })
              .catch((err) => {
                console.log(err)
                loader.dismiss()
                this.rfValue = ""
                this.initPassengers()
              })
          } else {
            // not found passenger with RFID scan
            // swap find in allPassenger
            passenger = this.allPassenger.filter((item) => item.RFID == this.rfValue)
            // it should found more than 1 row
            // then check if already board or not
            var options: FailedItem = {}
            if (passenger.length > 1) {
              // found in other route
              passenger = passenger.filter((item) => {
                var failBoard = passenger.filter((item3) => item3.pickup == 1 && item3.status == -1)
                var waitBoard = passenger.filter((item3) => item3.pickup == 1 && item3.status == 0)
                if (failBoard.length > 0) return (item.pickup == 1 && item.status == -1)
                else if (waitBoard.length > 0) return (item.pickup == 1 && item.status == 0)
                else return (item.pickup == 0 && item.status == 0)
              })
              if (passenger[0].pickup == 1 && passenger[0].status == 0) {
                options.title = `Incorrect Pickup Point`
                options.icon = 'WRONG_ADDRESS'
                options.shouldBeAddress = passenger[0].correctPickUp
              } else if (passenger[0].pickup == 0 && passenger[0].status == 0) {
                options.title = `Incorrect Drop Off Point`
                options.icon = 'WRONG_ADDRESS'
                options.shouldBeAddress = passenger[0].correctDestination
              }
              this.openFailedModal(options.title, options.icon, options.shouldBeAddress, this.allowOtherScan.bind(this, passenger))
              this.rfValue = ""
              this.wrong_point = '1'
            } else {
              // find this RFID with all passenger in system
              options.title = "passenger not found"
              options.icon = 'PASSENGER_NOT_FOUND'
              this.openFailedModal(options.title, options.icon, options.shouldBeAddress, this.allowOtherScan.bind(this, passenger))
              this.rfValue = ""
            }
          }
          this.startRead = false
          clearTimeout(this.timer)
        }, 1000)
      }
    // }

  }

  showNote(title: string, message: string) {
    if(message != '') {
      this.popUpTitle = title
      this.popUpMessage = message
      console.log(this.popUpTitle, this.popUpMessage)
      this.closeModal('passenger-item')
      this.modal.open('popup-item')
    }
  }

  allowOtherScan(passenger: Array<Passenger>) {
    this.closeModal('warning-popup')
    // this.openModal(passenger[0])
    var params = new Array()
    params = params.concat(passenger)
    this.scanUpdate(params)
  }

  scanUpdate(passenger: Array<Passenger>) {
    return new Promise((resolve, reject) => {
      var new_status = 0
      var notSwap = false
      var swapPassenger = []
      console.log('start scan' , passenger)
      if (passenger[0].status == 1 && passenger[0].pickup == 1) {
        passenger = this.allPassenger.filter((item) => {
          return (item.status == 0 && item.pickup == 0 && item.passenger_id == passenger[0].passenger_id)
        })
        console.log('will aligned')
        // this.passengerStore = this.passengerStore.map((item) => {
        //   if (item.passenger_id == passenger[0].passenger_id) item = passenger[0]
        //   return item
        // })
        new_status = 1
      } else if (passenger[0].status == 1 && passenger[0].pickup == 0) {
        console.log('will board again')
        swapPassenger = this.allPassenger.filter((item) => {
          return (item.status == 1 && item.pickup == 1 && item.passenger_id == passenger[0].passenger_id)
        })
        // this.passengerStore = this.passengerStore.map((item) => {
        //   if (item.passenger_id == passenger[0].passenger_id) item = swapPassenger[0]
        //   return item
        // })
        // this.allPassenger = this.allPassenger.map((item)=>{
        //   if(item.status == 1 && item.pickup == 0 && item.passenger_id == passenger[0].passenger_id) {
        //     item.status = 0
        //   }
        //   return item
        // })
        new_status = 0
        notSwap = true
      }

      if (((passenger[0].status == 0 || passenger[0].status == -1) && passenger[0].pickup == 1)) {
        console.log('set status true')
        new_status = 1
        this.status_text = 'Boarded'
      }
      // console.log(passenger[0].status, passenger[0].pickup)
      else if (passenger[0].status == 0 && passenger[0].pickup == 0) {
        console.log('set status true 2')
        new_status = 1
        this.status_text = 'Alighted'
      }


      console.log(swapPassenger)
      if (swapPassenger.length > 0) {
        // this.openModal(swapPassenger[0])
        this.status_text = 'Boarded'
      } else {
        // this.openModal(passenger[0])
      }

      // if (new_status > 0) {
      var action = 0
      if (this.status_text == 'Alighted') {
        var isFirst = this.navParams.get('is_first')
        action = (isFirst) ? -1 : this.navParams.get('movement_id')
      } else {
        if (this.navParams.get('is_last')) {
          resolve()
        }
        action = this.navParams.get('movement_id')
      }
      // var loader = this.loading.create({
      //   content: ''
      // })
      // loader.present()
      if (this.navParams.get('is_last') && passenger[0].pickup == 1) {
        resolve()
      } else {
        this.request.updatePassengerStatus({
          passenger_id: passenger[0].passenger_id,
          status_new: new_status,
          force_login: 0,
          pickup: passenger[0].pickup,
          action_point_id: action,
          timescan: moment().format('YYYY-MM-DD HH:mm:ss'),
          quote_id: this.navParams.get('quote_id')
        })
          .map((body) => body.json())
          .toPromise()
          .then((data) => {

            if (data.status) {
              var movement_id = action
              this.allPassenger = this.allPassenger.map((item) => {
                if (item.passenger_id == passenger[0].passenger_id && item.pickup == passenger[0].pickup) {
                  item.status = new_status
                  item.action_point_id = action
                }
                return item
              })


              // check where is the right place

              var dataPayload: NotiPayload = {}
              if (swapPassenger.length > 0) {
                for (let parent of swapPassenger[0].parents) {
                  dataPayload.message = "Passenger update"
                  dataPayload.title = "Passenger Update"
                  dataPayload.route = swapPassenger[0].jobPattern[0].job_name || ""
                  dataPayload.place = (swapPassenger[0].pickup) ? this.navParams.get('current_place') : this.navParams.get('current_place')
                  dataPayload.sentfrom = ""
                  dataPayload.name = swapPassenger[0].first_name + ' ' + swapPassenger[0].surname
                  dataPayload.time = moment().format('HH:mm')
                  dataPayload.status = this.status_text
                  if (!this.navParams.get('current_place').includes(swapPassenger[0].correctPickUp)) {
                    this.wrong_point = '1'
                    dataPayload.note = 'This is not passengers registered stop'
                  } else {
                    this.wrong_point = '0'
                    dataPayload.note = ''
                  }
                  dataPayload.wrong_point = this.wrong_point
                  this.sendNotification(parent.email, dataPayload)
                }
              } else {
                for (let parent of passenger[0].parents) {
                  dataPayload.message = "Passenger update"
                  dataPayload.title = "Passenger Update"
                  dataPayload.route = passenger[0].jobPattern[0].job_name || ""
                  dataPayload.place = (passenger[0].pickup == 1) ? this.navParams.get('current_place') : this.navParams.get('current_place')
                  dataPayload.sentfrom = ""
                  dataPayload.name = passenger[0].first_name + ' ' + passenger[0].surname
                  dataPayload.time = moment().format('HH:mm')

                  dataPayload.status = this.status_text
                  if (!this.navParams.get('current_place').includes(swapPassenger[0].correctPickUp)) {
                    this.wrong_point = '1'
                    dataPayload.note = 'This is not passengers registered stop'
                  } else {
                    this.wrong_point = '0'
                    dataPayload.note = ''
                  }
                  dataPayload.wrong_point = this.wrong_point
                  this.sendNotification(parent.email, dataPayload)
                }
                // loader.dismiss()
              }

              // this.passengers = this.passengerStore

            }
            resolve()
          })
          .catch((err) => {
            this.dataStorage.saveTodoAgain('updatePassengerStatus', {
              passenger_id: passenger[0].passenger_id,
              status_new: new_status,
              force_login: 0,
              pickup: passenger[0].pickup,
              action_point_id: action,
              timescan: moment().format('YYYY-MM-DD HH:mm:ss'),
              quote_id: this.navParams.get('quote_id')
            })
            var movement_id = action
            this.allPassenger = this.allPassenger.map((item) => {
              if (item.passenger_id == passenger[0].passenger_id && item.pickup == passenger[0].pickup) {
                item.status = new_status
                item.action_point_id = action
              }
              return item
            })
            var dataPayload: NotiPayload = {}
            if (swapPassenger.length > 0) {
              for (let parent of swapPassenger[0].parents) {
                dataPayload.message = "Passenger update"
                dataPayload.title = "Passenger Update"
                dataPayload.route = swapPassenger[0].jobPattern[0].job_name || ""
                dataPayload.place = (swapPassenger[0].pickup) ? this.navParams.get('current_place') : this.navParams.get('current_place')
                dataPayload.sentfrom = ""
                dataPayload.name = swapPassenger[0].first_name + ' ' + swapPassenger[0].surname
                dataPayload.time = moment().format('HH:mm')
                dataPayload.status = this.status_text
                if (!this.navParams.get('current_place').includes(swapPassenger[0].correctPickUp)) {
                  this.wrong_point = '1'
                  dataPayload.note = 'This is not passengers registered stop'
                } else {
                  this.wrong_point = '0'
                  dataPayload.note = ''
                }
                dataPayload.wrong_point = this.wrong_point
                this.request.saveRequestToStore({
                  title: 'notification_'+ this.navParams.get('movement_id') + '_' + Global.getGlobal('driver_id') + '_' + parent.email,
                  url: Util.getNotificationUrl(),
                  type: 'POST',
                  params: dataPayload
                })
              }
            } else {
              for (let parent of passenger[0].parents) {
                dataPayload.message = "Passenger update"
                dataPayload.title = "Passenger Update"
                dataPayload.route = passenger[0].jobPattern[0].job_name || ""
                dataPayload.place = (passenger[0].pickup == 1) ? this.navParams.get('current_place') : this.navParams.get('current_place')
                dataPayload.sentfrom = ""
                dataPayload.name = passenger[0].first_name + ' ' + passenger[0].surname
                dataPayload.time = moment().format('HH:mm')

                dataPayload.status = this.status_text
                if (!this.navParams.get('current_place').includes(swapPassenger[0].correctPickUp)) {
                  this.wrong_point = '1'
                  dataPayload.note = 'This is not passengers registered stop'
                } else {
                  this.wrong_point = '0'
                  dataPayload.note = ''
                }
                dataPayload.wrong_point = this.wrong_point
                this.request.saveRequestToStore({
                  title: 'notification_'+ this.navParams.get('movement_id') + '_' + Global.getGlobal('driver_id') + '_' + parent.email,
                  url: Util.getNotificationUrl(),
                  type: 'POST',
                  params: dataPayload
                })
              }
            }
            resolve()
          })
      }

      // }else{
      // resolve()
      // }
    })

  }

  ionViewDidLoad() {
    // this.initReader()
    this.cekNFC()
    this.loadAllPassengers()
    this.tracking.forceTracking()
  }

  cekNFC() {
    // alert('checking... nfc')
    this.nfc.enabled()
      .then(() => {
        // alert('nfc available')
        this.addListenNFC();
      })
      .catch(err => {
        // let alert = this.alertCtrl.create({
        //   subTitle: 'NFC_DISABLED_ON_NFC',
        //   buttons: [{ text: 'OK' }, {
        //     text: 'GO_SETTING',
        //     handler: () => {
        //       this.nfc.showSettings();
        //     }
        //   }]
        // });
        // alert.present();
        console.log('Your device not support NFC')
      });
  }

  addListenNFC() {
    this.nfc.addTagDiscoveredListener(nfcEvent => this.sesReadNFC(nfcEvent.tag)).subscribe(data => {
      console.log('read',data)
      this.startRead = true
      if (data && data.tag && data.tag.id) {
        let tagId = this.nfc.bytesToHexString(data.tag.id.reverse());
        if (tagId) {
          this.rfValue = parseInt(tagId,16).toString()
          var passenger = this.passengerStore.filter((item) => item.RFID == this.rfValue)
          // console.log('passenger nfc' , passenger)
          // console.log('nfc read' , this.rfValue)
          this.closeModal('passenger-item')
          this.closeModal('warning-popup')
          if (passenger.length > 0) {
            var loader = this.loading.create({
              content: 'Scanning...'
            })
            loader.present()
            this.scanUpdate(passenger)
              .then(() => {
                loader.dismiss()
                this.rfValue = ""
                this.initPassengers()
                var showPassenger = this.passengerStore.filter((item) => item.passenger_id == passenger[0].passenger_id)
                this.openModal(
                  showPassenger[0],
                  false
                )
              })
              .catch((err) => {
                console.log(err)
                loader.dismiss()
                this.rfValue = ""
                this.initPassengers()
              })
          } else {
            // not found passenger with RFID scan
            // swap find in allPassenger
            passenger = this.allPassenger.filter((item) => item.RFID == this.rfValue)
            // it should found more than 1 row
            // then check if already board or not
            var options: FailedItem = {}
            if (passenger.length > 0) {
              // found in other route
              passenger = passenger.filter((item) => {
                var failBoard = passenger.filter((item3) => item3.pickup == 1 && item3.status == -1)
                var waitBoard = passenger.filter((item3) => item3.pickup == 1 && item3.status == 0)
                if (failBoard.length > 0) return (item.pickup == 1 && item.status == -1)
                else if (waitBoard.length > 0) return (item.pickup == 1 && item.status == 0)
                else return (item.pickup == 0 && item.status == 0)
              })
              if (passenger[0].pickup == 1 && passenger[0].status == 0) {
                options.title = `Incorrect Pickup Point`
                options.icon = 'WRONG_ADDRESS'
                options.shouldBeAddress = passenger[0].correctPickUp
              } else if (passenger[0].pickup == 0 && passenger[0].status == 0) {
                options.title = `Incorrect Drop Off Point`
                options.icon = 'WRONG_ADDRESS'
                options.shouldBeAddress = passenger[0].correctDestination
              }
              this.openFailedModal(options.title, options.icon, options.shouldBeAddress, this.allowOtherScan.bind(this, passenger))
              this.rfValue = ""
              this.wrong_point = '1'
            } else {
              // find this RFID with all passenger in system
              options.title = "passenger not found"
              options.icon = 'PASSENGER_NOT_FOUND'
              this.openFailedModal(options.title, options.icon, options.shouldBeAddress, this.allowOtherScan.bind(this, passenger))
              this.rfValue = ""
            }
          }
        } else {
          console.log('NFC_NOT_DETECTED')
        }
      }
    });
  }

  sesReadNFC(data): void {
    // alert('NFC_WORKING')
    console.log('NFC_WORKING')
  }

  failNFC(err) {
    // alert('NFC Failed :' + JSON.stringify(err))
    console.log('NFC Failed :' + JSON.stringify(err))
  }

  initReader() {
    this.dataStorage.getLogData('reader')
      .subscribe((data) => {
        console.log('test_reader', data.rows)
      })
  }

  loadAllPassengers() {
    var loader = this.loading.create({
      content: '',
      duration: 10000
    })
    this.dataStorage.getLogDataPromise('passengers_'+this.navParams.get('quote_id')+'_'+Global.getGlobal('driver_id'))
    .then((data)=>{
      console.log('passenger data' , data)
      if(data != null) {
        this.allPassenger = data
      }else {
        this.allPassenger = []
      }
      loader.dismiss()
      this.initPassengers()
    })
    .catch((err)=>{
      console.log(err)
      loader.dismiss()
    })
  }

  // loadAllPassengers() {
  //   var loader = this.loading.create({
  //     content: '',
  //     duration: 10000
  //   })
  //   loader.present()
  //   this.request.getAllPassengerInJob(this.navParams.get('quote_id'))
  //   .toPromise()
  //   .then((data)=>{
  //     if(data.results.length > 0) {
  //       data.results = data.results.map((item) => {
  //         if (item.photo == "") item.photo = normalizeURL("assets/img/nouser.png")
  //         item.fromOtherRoute = true
  //         return item
  //       })
  //       this.dataStorage.addLogData('passengers_'+this.navParams.get('quote_id')+'_'+Global.getGlobal('driver_id'), data.results)
  //       this.allPassenger = data.results
  //     }else{
  //       this.dataStorage.addLogData('passengers_'+this.navParams.get('quote_id')+'_'+Global.getGlobal('driver_id'), [])
  //       this.allPassenger = []
  //     }

  //     loader.dismiss()
  //     this.initPassengers()
  //   })
  //   .catch((err)=>{
  //     this.dataStorage.getLogDataPromise('passengers_'+this.navParams.get('quote_id')+'_'+Global.getGlobal('driver_id'))
  //     .then((data)=>{
  //       if(data != null) {
  //         this.allPassenger = data
  //       }else {
  //         this.allPassenger = []
  //       }
  //     })
  //     loader.dismiss()
  //     this.initPassengers()
  //   })
  // }

  initPassengers() {
    var movement_id = this.navParams.get('movement_id')
    var quote_id = this.navParams.get('quote_id')
    var j_id = this.navParams.get('j_id')
    var isFirst = this.navParams.get('is_first')
    var isLast = this.navParams.get('is_last')
    this.lastPoint = isLast
    var movement_order = this.navParams.get('movement_order')
    var passengerWaitAlign, passengerFailed
    this.routeString = this.navParams.get('current_place')
    if (isFirst) {
      // this.passengerStore = this.allPassenger.filter((item) => (item.pickup == 1 && item.point_id == movement_id) || (item.pickup == 0 && item.status == 1 && item.action_point_id == -1))
      // this.passengerStore = this.passengerStore.filter((item) => {
      //   var duplicate = this.passengerStore.filter((item2) => item.passenger_id == item2.passenger_id && item2.pickup == 0 && item2.status == 1 && item2.action_point_id == -1)
      //   if (duplicate.length > 0) {
      //     return item.pickup == 0 && item.status == 1 && item.action_point_id == -1
      //   } else {
      //     return item
      //   }
      // })
      this.passengerStore = this.allPassenger.filter((item) => {
        var duplicate = this.allPassenger.filter((item2) => {
          return item.passenger_id == item2.passenger_id && item2.pickup == 0 && item2.status == 1
        })
        if(duplicate.length > 0) {
          return item.pickup == 0 &&
          item.status == 1 &&
          this.allPassenger.findIndex((item3)=>item.point_id == movement_id && item3.passenger_id == item.passenger_id) > -1
        }
        return item.pickup == 1 && item.point_id == movement_id
      })
      console.log('is_first_pass', this.passengerStore)
    } else if (isLast) {
      passengerWaitAlign = this.allPassenger.filter((item) => item.pickup == 0 && item.point_id == movement_id)
      passengerFailed = this.allPassenger
        .filter((item2) => item2.pickup == 1 && item2.status == -1)
      passengerWaitAlign = passengerWaitAlign.map((item) => {
        var index = passengerFailed.findIndex((item2) => item2.passenger_id == item.passenger_id)
        if (index > -1) {
          item = passengerFailed[index]
        }
        return item
      })
      this.passengerStore = passengerWaitAlign
    } else if (!isFirst && !isLast) {
      // need to find waitBoard waitAlign alreadyAlign
      this.passengerStore = this.allPassenger.filter((item) => {
        var duplicate = this.allPassenger.filter((item2) => {
          return item.passenger_id == item2.passenger_id && item2.pickup == 0 && item2.status == 1
        })
        if(duplicate.length > 0) {
          return item.pickup == 0 &&
          item.status == 1 &&
          this.allPassenger.findIndex((item3)=>item.point_id == movement_id && item3.passenger_id == item.passenger_id) > -1
        }
        return item.pickup == 1 && item.point_id == movement_id
      })
      passengerWaitAlign = this.allPassenger
        .filter((item) => item.movement_order == (movement_order - 1) && item.pickup == 0 && item.status == 0)
      passengerFailed = this.allPassenger
        .filter((item2) => item2.pickup == 1 && item2.status == -1)
      passengerWaitAlign = passengerWaitAlign.map((item) => {
        var index = passengerFailed.findIndex((item2) => item2.passenger_id == item.passenger_id)
        if (index > -1) {
          item = passengerFailed[index]
        }
        return item
      })
      this.passengerStore = this.passengerStore.concat(passengerWaitAlign)
    }
    this.passengers = this.passengerStore
    this.calculateTodo()
  }



  calculateTodo() {
    var movement_id = this.navParams.get('movement_id')
    this.listTodo.waitBus = this.passengerStore
      .filter((passenger) => passenger.status == 0 && passenger.pickup == 1)
      .length
    this.listTodo.waitAlign = this.passengerStore
      .filter((passenger) => passenger.status == 0 && passenger.pickup == 0)
      .length
    this.listTodo.availableOnBus = this.passengerStore
      .filter((passenger) => passenger.status == 1 && passenger.pickup == 1)
      .length
    this.listTodo.aligned = this.passengerStore
      .filter((passenger) => passenger.status == 1 && passenger.pickup == 0)
      .length
  }

  searchPassengers(e: Event) {
    clearTimeout(this.timerSearch)
    this.timerSearch = setTimeout(() => {
      var loader = this.loading.create({
        content: '',
        duration: 10000
      })
      loader.present()
      this.passengers = []
      // console.log(this.searchInput)
      if (this.searchInput != "") {
        var filterPassengers = this.passengerStore
          .filter((passenger) => (passenger.first_name.includes(this.searchInput) || passenger.first_name.includes(this.searchInput)))
        this.passengers = filterPassengers
        if (this.passengers.length == 0) {
          this.request.searchFromApi(this.searchInput, this.navParams.get('quote_id'))
            .subscribe(
            (res) => {
              loader.dismiss()
              res.results = res.results.map((item) => {
                if (item.photo == "") item.photo = normalizeURL("assets/img/nouser.png")
                item.fromOtherRoute = true
                return item
              })
              this.passengers = res.results
              this.passengers = this.passengers.filter((item) => {
                // find duplicate
                var duplicate = this.passengers.filter((item2) => item2.passenger_id == item.passenger_id)
                if (duplicate.length > 1) {
                  // check if has failboard return else return waitalign
                  var failBoard = duplicate.filter((item3) => item3.pickup == 1 && item3.status == -1)
                  var alreadyBoard = duplicate.filter((item3) => item3.pickup == 1 && item3.status == 1)

                  if (failBoard.length > 0) return (item.pickup == 1 && item.status == -1)
                  else if (alreadyBoard.length == 0 && failBoard.length == 0) return (item.pickup == 1 && item.status == 0)
                  else if (alreadyBoard.length > 0 && failBoard.length == 0) return (item.pickup == 0 && item.status == 0)

                } else {
                  return item
                }
              })
            },
            (err) => {
              loader.dismiss()
              // console.log(err)
            }
            )
        }
        else {
          loader.dismiss()
        }
      } else {
        this.passengers = this.passengerStore
        loader.dismiss()
      }
      clearTimeout(this.timerSearch)
    }, 1000)
  }





  generateStatusColor(status, pickup) {
    if (status == 0 && pickup == 1) return 'passenger-circle-status passenger-list-primary'
    else if (status == 1 && pickup == 1) return 'passenger-circle-status passenger-list-third'
    else if (status == 0 && pickup == 0) return 'passenger-circle-status passenger-list-secondary'
    else if (status == 1 && pickup == 0) return 'passenger-circle-status passenger-list-fourth'
    else return 'passenger-circle-status passenger-list-error'
  }

  generateCircleColor(status, pickup) {
    if (status == 0 && pickup == 1) return 'passenger-status-cirle passenger-box-primary'
    else if (status == 1 && pickup == 1) return 'passenger-status-cirle passenger-box-third'
    else if (status == 0 && pickup == 0) return 'passenger-status-cirle passenger-box-secondary'
    else if (status == 1 && pickup == 0) return 'passenger-status-cirle passenger-box-fourth'
    else return 'passenger-status-cirle passenger-box-error'
  }

  openModal(passenger: Passenger, allow_force_login: boolean = true, allow_view_instructors: boolean = true) {
    this.passengerItem = passenger
    if(this.passengerItem.pickup != 1) {
      // if passenger pickup == 0 it means this passenger ever to board but alight with some reason
      var findAlreadyPickup = this.allPassenger.filter((item)=>{
        return this.passengerItem.passenger_id == item.passenger_id && item.pickup == 1
      })
      if(findAlreadyPickup.length > 0 && this.navParams.get('is_last')) {
        // just update alighted data status to 0
        allow_force_login = true
      }
    }
    this.viewForceLogin = allow_force_login
    // this.viewinstructors = allow_view_instructors
    if (!allow_force_login) this.colorViewForceLogin = "primary"
    else this.colorViewForceLogin = "disable"
    // if (!allow_view_instructors) this.colorViewInstructors = "primary"
    // else this.colorViewInstructors = "disable"
    this.modal.open('passenger-item')
  }

  closeModal(modalName) {
    this.modal.close(modalName)
  }

  closeNote(modalName) {
    this.modal.close('popup-item')
    this.modal.open('passenger-item')
  }

  forceLogin(passenger: any) {

    var action = this.navParams.get('movement_id')
    var movement_order = this.navParams.get('movement_order')
    var isLast = this.navParams.get('is_last')
    if (isLast) return false
    var options: any = {}
    var pickUpUpdate = 0
    var newStatus = 0
    var findAlreadyPickup = null
    if(passenger.pickup != 1) {
      // if passenger pickup == 0 it means this passenger ever to board but alight with some reason
      findAlreadyPickup = this.allPassenger.filter((item)=>{
        return passenger.passenger_id == item.passenger_id && item.pickup == 1
      })
      if(findAlreadyPickup.length > 0) {
        // just update alighted data status to 0
        this.processForceLogin(passenger, action, 0, 0)
      }
    }else{
      if (passenger.pickup == 1 && passenger.point_id != action && passenger.movement_order != movement_order) {
        pickUpUpdate = 1
        newStatus = 1
        options.title = `Incorrect Pickup Point`
        options.icon = 'WRONG_ADDRESS'
        options.shouldBeAddress = passenger.correctPickUp
        this.modal.close('passenger-item')
        this.openFailedModal(
          options.title,
          options.icon,
          options.shouldBeAddress,
          this.processForceLogin.bind(this, passenger, action, pickUpUpdate, newStatus))
        // this.processForceLogin(passenger,action,pickUpUpdate,newStatus)
      } else if (passenger.movement_order == movement_order) {
        pickUpUpdate = 1
        newStatus = 1
        this.processForceLogin(passenger, action, pickUpUpdate, newStatus)
      }
    }

    this.modal.close('passenger-item')
  }

  processForceLogin(passenger: any, action: number, pickUp: number, status: number) {
    var loader = this.loading.create({
      content: 'Force login...',
      duration: 10000
    })
    this.request.updatePassengerStatus({
      passenger_id: passenger.passenger_id,
      status_new: status,
      force_login: 1,
      pickup: pickUp,
      action_point_id: action,
      timescan: moment().format('YYYY-MM-DD HH:mm:ss'),
      quote_id: this.navParams.get('quote_id')
    })
      .map((body) => body.json())
      .subscribe((data) => {
        loader.dismiss()
        this.modal.close('warning-popup')
        if (data.status) {
          var movement_id = this.navParams.get('movement_id')
          this.allPassenger = this.allPassenger.map((item) => {
            if (item.passenger_id == passenger.passenger_id && item.job_passengers_id == passenger.job_passengers_id && item.pickup == pickUp) {
              item.status = status
              item.action_point_id = action
            }
            return item
          })
          this.dataStorage.addLogData('passengers_'+this.navParams.get('quote_id')+'_'+Global.getGlobal('driver_id'), this.allPassenger)
          var swapPassenger = this.allPassenger.filter((item) => item.pickup == 1 && item.passenger_id == passenger.passenger_id)[0]
          for (let parent of swapPassenger.parents) {
            var dataPayload: NotiPayload = {}
            if (!this.navParams.get('current_place').includes(swapPassenger.correctPickUp)) {
              this.wrong_point = '1'
              dataPayload.note = 'This is not passengers registered stop'
            } else {
              this.wrong_point = '0'
              dataPayload.note = ''
            }
            dataPayload.message = "Passenger update"
            dataPayload.title = "Passenger Update"
            dataPayload.route = swapPassenger.jobPattern[0].job_name || ""
            dataPayload.place = this.navParams.get('current_place')
            dataPayload.sentfrom = ""
            dataPayload.name = swapPassenger.first_name + ' ' + swapPassenger.surname
            dataPayload.time = moment().format('HH:mm')
            dataPayload.wrong_point = this.wrong_point
            dataPayload.status = 'Boarded'
            this.sendNotification(parent.email, dataPayload)
          }
          this.initPassengers()
        }
      },
      (err) => {
        loader.dismiss()
        this.dataStorage.saveTodoAgain('updatePassengerStatus', {
          passenger_id: passenger[0].passenger_id,
          status_new: status,
          force_login: 1,
          pickup: pickUp,
          action_point_id: action,
          timescan: moment().format('YYYY-MM-DD HH:mm:ss'),
          quote_id: this.navParams.get('quote_id')
        }).subscribe(() => {
          console.log(err)
          this.modal.close('warning-popup')
          var movement_id = this.navParams.get('movement_id')
          this.allPassenger = this.allPassenger.map((item) => {
            if (item.passenger_id == passenger.passenger_id && item.job_passengers_id == passenger.job_passengers_id && item.pickup == pickUp) {
              item.status = status
              item.action_point_id = action
            }
            return item
          })
          this.dataStorage.addLogData('passengers_'+this.navParams.get('quote_id')+'_'+Global.getGlobal('driver_id'), this.allPassenger)
          var swapPassenger = this.allPassenger.filter((item) => item.pickup == 1 && item.passenger_id == passenger.passenger_id)[0]
          for (let parent of swapPassenger.parents) {
            var dataPayload: NotiPayload = {}
            if (!this.navParams.get('current_place').includes(swapPassenger.correctPickUp)) {
              this.wrong_point = '1'
              dataPayload.note = 'This is not passengers registered stop'
            } else {
              this.wrong_point = '0'
              dataPayload.note = ''
            }
            dataPayload.message = "Passenger update"
            dataPayload.title = "Passenger Update"
            dataPayload.route = swapPassenger.jobPattern[0].job_name || ""
            dataPayload.place = this.navParams.get('current_place')
            dataPayload.sentfrom = ""
            dataPayload.name = swapPassenger.first_name + ' ' + swapPassenger.surname
            dataPayload.time = moment().format('HH:mm')
            dataPayload.wrong_point = this.wrong_point
            dataPayload.status = 'Boarded'
            // this.sendNotification(parent.email, dataPayload)
            this.request.saveRequestToStore({
              title: 'notification_'+ this.navParams.get('movement_id') + '_' + Global.getGlobal('driver_id') + '_' + parent.email,
              url: Util.getNotificationUrl(),
              type: 'POST',
              params: dataPayload
            })
          }
          this.initPassengers()
        })
      })
  }

  forceLogout(passenger: any) {

    var action = this.navParams.get('movement_id')
    var options: any = {}
    var isLast = this.navParams.get('is_last')
    var movement_order = this.navParams.get('movement_order')
    var pickUpUpdate = 0
    var newStatus = 0
    if (isLast) movement_order = movement_order - 99

    if(passenger.pickup == 1 && passenger.status == 1) {
      // fucntion recieved data from pickup item
      var new_passenger = this.allPassenger.filter((item)=>{
        return item.passenger_id == passenger.passenger_id && item.pickup == 0
      })
      passenger = new_passenger[0]
    }
    console.log(passenger)
    console.log(passenger.movement_order , this.navParams.get('movement_order'))
    if ((passenger.pickup == 0) && passenger.movement_order != movement_order) {
      alert('wrong')
      // _passenger = this.allPassenger.filter((item)=>item.passenger_id == passenger.passenger_id && item.pickup == 0 && item.j_id == passenger.j_id)[0]
      // console.log(_passenger)
      var isFirst = this.navParams.get('is_first')
      action = (isFirst) ? -1 : this.navParams.get('movement_id')
      options.title = `Incorrect Drop Off Point`
      options.icon = 'WRONG_ADDRESS'
      options.shouldBeAddress = passenger.correctDestination
      this.modal.close('passenger-item')
      this.openFailedModal(options.title, options.icon, options.shouldBeAddress, this.processForceLogout.bind(this, passenger, action, pickUpUpdate, newStatus))
      // this.processForceLogout(passenger,action)
    } else {
      alert('correct')
      action = passenger.point_id
      this.processForceLogout(passenger, action, pickUpUpdate, newStatus)
    }
    this.modal.close('passenger-item')
  }

  processForceLogout(passenger: any, action: number, pickUp: number, status: number) {
    var loader = this.loading.create({
      content: 'Force logout...',
      duration: 10000
    })
    this.request.updatePassengerStatus({
      passenger_id: passenger.passenger_id,
      status_new: 1,
      force_login: 1,
      pickup: 0,
      action_point_id: action,
      timescan: moment().format('YYYY-MM-DD HH:mm:ss'),
      quote_id: this.navParams.get('quote_id')
    })
      .map((body) => body.json())
      .subscribe((data) => {
        loader.dismiss()
        this.modal.close('warning-popup')
        if (data.status) {
          var movement_id = action
          this.allPassenger = this.allPassenger.map((item) => {
            if (item.passenger_id == passenger.passenger_id && item.pickup == 0) {
              item.status = 1
              item.action_point_id = action
            }
            return item
          })
          this.dataStorage.addLogData('passengers_'+this.navParams.get('quote_id')+'_'+Global.getGlobal('driver_id'), this.allPassenger)
          // this.modal.close('warning-popup')
          for (let parent of passenger.parents) {
            var dataPayload: NotiPayload = {}
            var swapPassenger = this.allPassenger.filter((item) => item.pickup == 0 && item.passenger_id == passenger.passenger_id)[0]
            if (!this.navParams.get('current_place').includes(swapPassenger.correctDestination)) {
              this.wrong_point = '1'
              dataPayload.note = 'This is not passengers registered stop'
            } else {
              this.wrong_point = '0'
              dataPayload.note = ''
            }
            dataPayload.message = "Passenger update"
            dataPayload.title = "Passenger Update"
            dataPayload.route = passenger.jobPattern[0].job_name || ""
            dataPayload.place = this.navParams.get('current_place')
            dataPayload.sentfrom = ""
            dataPayload.name = passenger.first_name + ' ' + passenger.surname
            dataPayload.time = moment().format('HH:mm')
            dataPayload.wrong_point = this.wrong_point
            dataPayload.status = 'Alighted'
            this.sendNotification(parent.email, dataPayload)
          }
          this.initPassengers()
        }
      },
      (err) => {
        loader.dismiss()
        this.dataStorage.saveTodoAgain('updatePassengerStatus', {
          passenger_id: passenger.passenger_id,
          status_new: 1,
          force_login: 1,
          pickup: 0,
          action_point_id: action,
          timescan: moment().format('YYYY-MM-DD HH:mm:ss'),
          quote_id: this.navParams.get('quote_id')
        }).subscribe(() => {
          console.log(err)
          var movement_id = action
          this.allPassenger = this.allPassenger.map((item) => {
            if (item.passenger_id == passenger.passenger_id && item.pickup == 0) {
              item.status = 1
              item.action_point_id = action
            }
            return item
          })
          this.dataStorage.addLogData('passengers_'+this.navParams.get('quote_id')+'_'+Global.getGlobal('driver_id'), this.allPassenger)
          // this.modal.close('warning-popup')
          for (let parent of passenger.parents) {
            var dataPayload: NotiPayload = {}
            var swapPassenger = this.allPassenger.filter((item) => item.pickup == 0 && item.passenger_id == passenger.passenger_id)[0]
            if (!this.navParams.get('current_place').includes(swapPassenger.correctDestination)) {
              this.wrong_point = '1'
              dataPayload.note = 'This is not passengers registered stop'
            } else {
              this.wrong_point = '0'
              dataPayload.note = ''
            }
            dataPayload.message = "Passenger update"
            dataPayload.title = "Passenger Update"
            dataPayload.route = passenger.jobPattern[0].job_name || ""
            dataPayload.place = this.navParams.get('current_place')
            dataPayload.sentfrom = ""
            dataPayload.name = passenger.first_name + ' ' + passenger.surname
            dataPayload.time = moment().format('HH:mm')
            dataPayload.wrong_point = this.wrong_point
            dataPayload.status = 'Alighted'
            // this.sendNotification(parent.email, dataPayload)
            this.request.saveRequestToStore({
              title: 'notification_'+ this.navParams.get('movement_id') + '_' + Global.getGlobal('driver_id') + '_' + parent.email,
              url: Util.getNotificationUrl(),
              type: 'POST',
              params: dataPayload
            })
          }
          this.initPassengers()
        })
      })
  }

  enrouteDialog () {
    var notBoard = this.passengerStore.filter((item2) => item2.pickup == 1 && item2.status == 0)
    var notAlign = this.passengerStore.filter((item2) => item2.pickup == 0 && item2.status == 0)
    if (notBoard.length > 0 || notAlign.length > 0) {
      var alertItem2 = this.alertCtrl.create({
        title: this.global.translate('Warning'),
        message: `${this.navParams.get('current_place')} ${this.global.translate('still has some passengers to board/alight')} ${this.global.translate('Do you want to leave from this stop?')}` ,
        buttons: [
          {
            text: this.global.translate('Cancel'),
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: this.global.translate('Ok'),
            handler: data => {
              this.enroute()
            }
          }
        ]
      })
      alertItem2.present()
    } else {
      this.enroute()
    }
  }

  async enroute() {
    var loader = this.loading.create({
      content: '',
      duration: 10000
    })
    loader.present()

    try {
      var position = await this.tracking.getCurrentPosition()
      var save = await this.request.saveDriverAction({
        movement_id: this.navParams.get('movement_id'),
        action: '8',
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        date_time: moment().format('YYYY-MM-DD HH:mm'),
        type: 'M',
        quote_id: this.navParams.get('quote_id')
      }).toPromise()
      console.log('save driver onroute ', save)
    }catch (err) {
      loader.dismiss()
      console.log('save request to store until internet back')
      this.request.saveRequestToStore({
        title: 'driver_action_onroute_'+ this.navParams.get('movement_id'),
        url: Util.getSystemURL() + '/api/ecmdriver/mobileSettings/driveraction',
        type: 'POST',
        params: {
          movement_id: this.navParams.get('movement_id'),
          action: '8',
          lat: null,
          lng: null,
          date_time: moment().format('YYYY-MM-DD HH:mm'),
          type: 'M',
          quote_id: this.navParams.get('quote_id')
        }
      })
    }
    try{
      var enRouteResult = await this.request.enroute({
        movement_id: this.navParams.get('movement_id'),
        movement_order: this.navParams.get('movement_order'),
        quote_id: this.navParams.get('quote_id'),
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        date_time: moment().format('YYYY-MM-DD HH:mm')
      }).toPromise()
      if (enRouteResult.results.update) {
        if (enRouteResult.results['force_passenger_fail_to_board'] > 0) {
          this.allPassenger = this.allPassenger.map((item) => {
            if (enRouteResult.results['failedBoardPassenger'].findIndex((item2) => item2.job_passengers_id == item.job_passengers_id) > -1) {
              item.status = -1
            }
            return item
          })
          this.dataStorage.addLogData('passengers_'+this.navParams.get('quote_id')+'_'+Global.getGlobal('driver_id'), this.allPassenger)
          let dataPayload: NotiPayload = {}
          let failedBoardPassenger = this.allPassenger.filter((item) => item.pickup == 1 && item.movement_order == this.navParams.get('movement_order') && item.status == -1)
          for (let i = 0; i < failedBoardPassenger.length; i++) {
            this.wrong_point = '1'
            dataPayload.note = 'Did not board'
            dataPayload.message = "Passenger update"
            dataPayload.title = "Passenger Update"
            dataPayload.route = failedBoardPassenger[i].jobPattern[0].job_name || ""
            dataPayload.place = this.navParams.get('current_place')
            dataPayload.sentfrom = ""
            dataPayload.name = failedBoardPassenger[i].first_name + ' ' + failedBoardPassenger[i].surname
            dataPayload.time = moment().format('HH:mm')
            dataPayload.wrong_point = this.wrong_point
            dataPayload.status = 'Failed Board'
            for (let parent of failedBoardPassenger[i].parents) {
              this.sendNotification(parent.email, dataPayload)
            }
          }
          let failedAlignPassenger = this.allPassenger
            .filter((item) => {
              console.log('has failed board ? ', this.allPassenger.findIndex((item2) => item.passenger_id == item2.passenger_id && item2.pickup == 1 && item2.status == -1))
              return item.pickup == 0
                && item.status == 0
                && item.movement_order == (this.navParams.get('movement_order') - 1)
                && this.allPassenger.findIndex((item2) => item.passenger_id == item2.passenger_id && item2.pickup == 1 && item2.status == -1) < 0
            })
          for (let i = 0; i < failedAlignPassenger.length; i++) {
            this.wrong_point = '1'
            dataPayload.note = 'Did not alight'
            dataPayload.message = "Passenger update"
            dataPayload.title = "Passenger Update"
            dataPayload.route = failedAlignPassenger[i].jobPattern[0].job_name || ""
            dataPayload.place = this.navParams.get('current_place')
            dataPayload.sentfrom = ""
            dataPayload.name = failedAlignPassenger[i].first_name + ' ' + failedAlignPassenger[i].surname
            dataPayload.time = moment().format('HH:mm')
            dataPayload.wrong_point = this.wrong_point
            dataPayload.status = 'Failed alight'
            for (let parent of failedAlignPassenger[i].parents) {
              this.sendNotification(parent.email, dataPayload)
            }
          }
        }
        // for(let parent of passenger.parents){
        // }
        this.callback({
          movement_id: this.navParams.get('movement_id'),
          movement_order: this.navParams.get('movement_order'),
          quote_id: this.navParams.get('quote_id')
        })
          .then(() => {
            this.navCtrl.pop()
          })
      } else {
        // alert('Cannot en-route. please try again')
      }
      loader.dismiss()
    }catch(err) {
      console.log('save request to store until internet back')
      this.request.saveRequestToStore({
        title: 'enrouote_'+ this.navParams.get('movement_id') + '_' + Global.getGlobal('driver_id'),
        url: Util.getSystemURL() + '/api/ecmdriver/jobs/enroute',
        type: 'POST',
        params: {
          movement_id: this.navParams.get('movement_id'),
          movement_order: this.navParams.get('movement_order'),
          quote_id: this.navParams.get('quote_id'),
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          date_time: moment().format('YYYY-MM-DD HH:mm')
        }
      })
      this.allPassenger = this.allPassenger.map((item) => {
        if (enRouteResult.results['failedBoardPassenger'].findIndex((item2) => item2.job_passengers_id == item.job_passengers_id) > -1) {
          item.status = -1
        }
        return item
      })
      this.dataStorage.addLogData('passengers_'+this.navParams.get('quote_id')+'_'+Global.getGlobal('driver_id'), this.allPassenger)
      let dataPayload: NotiPayload = {}
      let failedBoardPassenger = this.allPassenger.filter((item) => item.pickup == 1 && item.movement_order == this.navParams.get('movement_order') && item.status == -1)
      for (let i = 0; i < failedBoardPassenger.length; i++) {
        this.wrong_point = '1'
        dataPayload.note = 'Did not board'
        dataPayload.message = "Passenger update"
        dataPayload.title = "Passenger Update"
        dataPayload.route = failedBoardPassenger[i].jobPattern[0].job_name || ""
        dataPayload.place = this.navParams.get('current_place')
        dataPayload.sentfrom = ""
        dataPayload.name = failedBoardPassenger[i].first_name + ' ' + failedBoardPassenger[i].surname
        dataPayload.time = moment().format('HH:mm')
        dataPayload.wrong_point = this.wrong_point
        dataPayload.status = 'Failed Board'
        for (let parent of failedBoardPassenger[i].parents) {
          // this.sendNotification(parent.email, dataPayload)
          this.request.saveRequestToStore({
            title: 'notification_'+ this.navParams.get('movement_id') + '_' + Global.getGlobal('driver_id') + '_' + parent.email,
            url: Util.getNotificationUrl(),
            type: 'POST',
            params: dataPayload
          })
        }
      }
      let failedAlignPassenger = this.allPassenger
        .filter((item) => {
          console.log('has failed board ? ', this.allPassenger.findIndex((item2) => item.passenger_id == item2.passenger_id && item2.pickup == 1 && item2.status == -1))
          return item.pickup == 0
            && item.status == 0
            && item.movement_order == (this.navParams.get('movement_order') - 1)
            && this.allPassenger.findIndex((item2) => item.passenger_id == item2.passenger_id && item2.pickup == 1 && item2.status == -1) < 0
        })
      for (let i = 0; i < failedAlignPassenger.length; i++) {
        this.wrong_point = '1'
        dataPayload.note = 'Did not alight'
        dataPayload.message = "Passenger update"
        dataPayload.title = "Passenger Update"
        dataPayload.route = failedAlignPassenger[i].jobPattern[0].job_name || ""
        dataPayload.place = this.navParams.get('current_place')
        dataPayload.sentfrom = ""
        dataPayload.name = failedAlignPassenger[i].first_name + ' ' + failedAlignPassenger[i].surname
        dataPayload.time = moment().format('HH:mm')
        dataPayload.wrong_point = this.wrong_point
        dataPayload.status = 'Failed alight'
        for (let parent of failedAlignPassenger[i].parents) {
          // this.sendNotification(parent.email, dataPayload)
          this.request.saveRequestToStore({
            title: 'notification_'+ this.navParams.get('movement_id') + '_' + Global.getGlobal('driver_id') + '_' + parent.email,
            url: Util.getNotificationUrl(),
            type: 'POST',
            params: dataPayload
          })
        }
      }
      loader.dismiss()
      this.callback({
        movement_id: this.navParams.get('movement_id'),
        movement_order: this.navParams.get('movement_order'),
        quote_id: this.navParams.get('quote_id')
      })
        .then(() => {
          this.navCtrl.pop()
        })
    }
  }

  endroute() {
    var alertItem = this.alertCtrl.create({
      title: this.global.translate('End Job ?'),
      message: this.global.translate('Are you sure you want to End job?'),
      buttons: [
        {
          text: this.global.translate('Cancel'),
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.global.translate('Ok'),
          handler: data => {
            var boardPassenger = this.allPassenger.filter((item2) => item2.pickup == 1 && item2.status == 1)
            var notAlignPassenger = this.allPassenger.filter((item3) => {
              return boardPassenger.findIndex((item4) => item4.passenger_id == item3.passenger_id) >= 0 && item3.pickup == 0 && item3.status == 0
            })
            console.log('count passenger not align:' + notAlignPassenger.length)
            if (notAlignPassenger.length > 0) {
              var alertItem2 = this.alertCtrl.create({
                title: 'End Job',
                message: notAlignPassenger.length + this.global.translate(' passenger(s) not alighted. Please check your vehicle and press confirm to force log off remaining passengers and end job'),
                buttons: [
                  {
                    text: this.global.translate('Cancel'),
                    handler: data => {
                      console.log('Cancel clicked');
                    }
                  },
                  {
                    text: this.global.translate('Ok'),
                    handler: data => {
                      this.processEndRoute()
                    }
                  }
                ]
              })
              alertItem2.present()
            } else {
              this.processEndRoute()
            }
          }
        }
      ]
    })
    alertItem.present()
  }

  async processEndRoute() {
    var loader = this.loading.create({
      content: '',
      duration: 10000
    })
    loader.present()

    try {
      var position = await this.tracking.getCurrentPosition()
      var save = await this.request.saveDriverAction({
        movement_id: this.navParams.get('movement_id'),
        action: '10',
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        date_time: moment().format('YYYY-MM-DD HH:mm'),
        type: 'M',
        quote_id: this.navParams.get('quote_id')
      }).toPromise()
      console.log('save driver end ', save)
    }catch (err) {
      console.log('save request to store until internet back')
      this.request.saveRequestToStore({
        title: 'driver_action_onroute_'+ this.navParams.get('movement_id'),
        url: Util.getSystemURL() + '/api/ecmdriver/mobileSettings/driveraction',
        type: 'POST',
        params: {
          movement_id: this.navParams.get('movement_id'),
          action: '10',
          lat: null,
          lng: null,
          date_time: moment().format('YYYY-MM-DD HH:mm'),
          type: 'M',
          quote_id: this.navParams.get('quote_id')
        }
      })
    }
    try{
      var endRouteResult = await this.request.updateToEndRoute(
        this.navParams.get('movement_order') - 99,
        this.navParams.get('quote_id'),
        this.navParams.get('movement_id'))
      .toPromise()
      loader.dismiss()
      this.callback({
        movement_id: this.navParams.get('movement_id'),
        movement_order: this.navParams.get('movement_order'),
        quote_id: this.navParams.get('quote_id')
      })
      .then(() => {
        this.navCtrl.pop()
      })
    }catch(err) {
      console.log('save request to store until internet back')
      this.request.saveRequestToStore({
        title: 'enrouote_'+ this.navParams.get('movement_id') + '_' + Global.getGlobal('driver_id'),
        url: Util.getSystemURL() + '/api/ecmdriver/jobs/endroute',
        type: 'POST',
        params: {
          movement_id: this.navParams.get('movement_id'),
          movement_order: this.navParams.get('movement_order') - 99,
          quote_id: this.navParams.get('quote_id')
        }
      })
      loader.dismiss()
      this.callback({
        movement_id: this.navParams.get('movement_id'),
        movement_order: this.navParams.get('movement_order'),
        quote_id: this.navParams.get('quote_id')
      })
      .then(() => {
        this.navCtrl.pop()
      })
    }
  }

  openFailedModal(content: string, failedType: string, shouldBeAddress?: string, callback?: Function) {
    this.failedItem.title = content
    this.failedItem.callback = callback
    if (failedType == 'ALREADY_BOARD') {
      this.failedItem.icon = 'assets/img/icon-failed-board-2.png'
      this.failedItem.shouldBeAddress = ''
      this.failedItem.notAllow = false
    } else if (failedType == 'WRONG_ADDRESS') {
      this.failedItem.icon = 'assets/img/icon-failed-board-1.png'
      this.failedItem.shouldBeAddress = shouldBeAddress
      this.failedItem.notAllow = false
    } else if (failedType == 'PASSENGER_NOT_FOUND') {
      this.failedItem.icon = 'assets/img/icon-failed-board-1.png'
      this.failedItem.shouldBeAddress = ''
      this.failedItem.notAllow = true
    }
    this.modal.open('warning-popup')
  }

  openAddNote(passenger: Passenger) {
    this.modal.close('passenger-item')
    this.navCtrl.push(PassengerAddNotePage, { passenger })
  }

  async sendNotification(parent_email: string, data: object) {
    try {
      var notiResult = await this.request.sendNotificationToParent(parent_email, data).toPromise()
      console.log('send notificaiton to ' + parent_email , notiResult)
    }catch (err) {
      console.log('save request to store until network back')
      this.request.saveRequestToStore({
        title: 'notification_'+ this.navParams.get('movement_id') + '_' + Global.getGlobal('driver_id') + '_' + parent_email,
        url: Util.getNotificationUrl(),
        type: 'POST',
        params: data
      })
    }
  }
}
