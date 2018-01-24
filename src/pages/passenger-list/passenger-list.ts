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
  private tracking: TrackingService;
  private readerProvider: string;
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
    private nfc: NFC
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
    this.readerProvider = "nfc"
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
                  (showPassenger[0].pickup == 1 && this.navParams.get('is_last')) ? false : true
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
      // console.log(passenger)
      if (passenger[0].status == 1 && passenger[0].pickup == 1) {
        passenger = this.allPassenger.filter((item) => {
          return (item.status == 0 && item.pickup == 0 && item.passenger_id == passenger[0].passenger_id)
        })
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
      var loader = this.loading.create({
        content: ''
      })
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
          timescan: moment().format('YYYY-MM-DD HH:mm:ss')
        })
          .map((body) => body.json())
          .toPromise()
          .then((data) => {
            // loader.dismiss()
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
              // if(this.wrong_point == '1') {

              // }
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
                  dataPayload.wrong_point = this.wrong_point
                  dataPayload.status = this.status_text
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
                  dataPayload.wrong_point = this.wrong_point
                  dataPayload.status = this.status_text
                  this.sendNotification(parent.email, dataPayload)
                }
              }

              // this.passengers = this.passengerStore
              resolve()
            }
          })
          .catch((err) => {
            loader.dismiss()
            this.dataStorage.saveTodoAgain('updatePassengerStatus', {
              passenger_id: passenger[0].passenger_id,
              status_new: new_status,
              force_login: 0,
              pickup: passenger[0].pickup,
              action_point_id: action,
              timescan: moment().format('YYYY-MM-DD HH:mm:ss')
            })
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
    alert('checking... nfc')
    this.nfc.enabled()
      .then(() => {
        alert('nfc available')
        this.addListenNFC();
      })
      .catch(err => {
        let alert = this.alertCtrl.create({
          subTitle: 'NFC_DISABLED_ON_NFC',
          buttons: [{ text: 'OK' }, {
            text: 'GO_SETTING',
            handler: () => {
              this.nfc.showSettings();
            }
          }]
        });
        alert.present();
      });
  }

  addListenNFC() {
    this.nfc.addTagDiscoveredListener(nfcEvent => this.sesReadNFC(nfcEvent.tag)).subscribe(data => {
      console.log('read',data)
      if (data && data.tag && data.tag.id) {
        let tagId = this.nfc.bytesToHexString(data.tag.id.reverse());
        if (tagId) {
          console.log('received ndef message. the tag contains: ', tagId);
        } else {
          console.log('NFC_NOT_DETECTED')
        }
      }
    });
  }

  sesReadNFC(data): void {
    alert('NFC_WORKING')
  }

  failNFC(err) {
    alert('NFC Failed :' + JSON.stringify(err))
  }

  initReader() {
    this.dataStorage.getLogData('reader')
      .subscribe((data) => {
        console.log('test_reader', data.rows)
      })
  }

  loadAllPassengers() {
    this.request.getAllPassengerInJob(this.navParams.get('quote_id'))
      .subscribe((data) => {
        data.results = data.results.map((item) => {
          if (item.photo == "") item.photo = normalizeURL("assets/img/nouser.png")
          item.fromOtherRoute = true
          return item
        })
        this.allPassenger = data.results
        this.initPassengers()
      })
  }

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
      this.passengerStore = this.allPassenger.filter((item) => (item.pickup == 1 && item.point_id == movement_id) || (item.pickup == 0 && item.status == 1 && item.action_point_id == -1))
      this.passengerStore = this.passengerStore.filter((item) => {
        var duplicate = this.passengerStore.filter((item2) => item.passenger_id == item2.passenger_id && item2.pickup == 0 && item2.status == 1 && item2.action_point_id == -1)
        if (duplicate.length > 0) {
          return item.pickup == 0 && item.status == 1 && item.action_point_id == -1
        } else {
          return item
        }
      })
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
      this.passengerStore = this.allPassenger.filter((item) => item.pickup == 1 && item.point_id == movement_id)
      passengerWaitAlign = this.allPassenger
        .filter((item) => item.movement_order == (movement_order - 1) && item.pickup == 0)
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
        content: ''
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
    if (status == 0 && pickup == 1) return 'txt_center passenger-list-primary'
    else if (status == 1 && pickup == 1) return 'txt_center passenger-list-third'
    else if (status == 0 && pickup == 0) return 'txt_center passenger-list-secondary'
    else if (status == 1 && pickup == 0) return 'txt_center passenger-list-fourth'
    else return 'txt_center passenger-list-error'
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

  forceLogin(passenger: any) {
    console.log(passenger)
    var action = this.navParams.get('movement_id')
    var movement_order = this.navParams.get('movement_order')
    var isLast = this.navParams.get('is_last')
    if (isLast) return false
    var options: any = {}
    var pickUpUpdate = 0
    var newStatus = 0
    if (passenger.pickup != 1 && passenger.movement_order != movement_order) {
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
    } else if (passenger.pickup != 1 && passenger.movement_order == movement_order) {
      this.processForceLogin(passenger, action, pickUpUpdate, newStatus)
    } else if (passenger.pickup == 1 && passenger.point_id != action) {
      // wrong pickup
      // passenger from search
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
    }
    else {
      pickUpUpdate = 1
      newStatus = 1
      this.processForceLogin(passenger, action, pickUpUpdate, newStatus)
    }
    this.modal.close('passenger-item')
  }

  processForceLogin(passenger: any, action: number, pickUp: number, status: number) {
    var loader = this.loading.create({
      content: 'Force login...'
    })
    this.request.updatePassengerStatus({
      passenger_id: passenger.passenger_id,
      status_new: status,
      force_login: 1,
      pickup: pickUp,
      action_point_id: action,
      timescan: moment().format('YYYY-MM-DD HH:mm:ss')
    })
      .map((body) => body.json())
      .subscribe((data) => {
        loader.dismiss()
        if (data.status) {
          var movement_id = this.navParams.get('movement_id')
          this.allPassenger = this.allPassenger.map((item) => {
            if (item.passenger_id == passenger.passenger_id && item.job_passengers_id == passenger.job_passengers_id && item.pickup == pickUp) {
              item.status = status
              item.action_point_id = action
            }
            return item
          })
          var swapPassenger = this.allPassenger.filter((item) => item.pickup == 1 && item.passenger_id == passenger.passenger_id)[0]
          this.modal.close('warning-popup')
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
          timescan: moment().format('YYYY-MM-DD HH:mm:ss')
        }).subscribe(() => {
          console.log(err)
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
    // console.log(passenger.movement_order , this.navParams.get('movement_order'))
    if (passenger.pickup == 0 && passenger.movement_order != movement_order) {
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
      action = passenger.point_id
      this.processForceLogout(passenger, action, pickUpUpdate, newStatus)
    }
    this.modal.close('passenger-item')
  }

  processForceLogout(passenger: any, action: number, pickUp: number, status: number) {
    var loader = this.loading.create({
      content: 'Force logout...'
    })
    this.request.updatePassengerStatus({
      passenger_id: passenger.passenger_id,
      status_new: 1,
      force_login: 1,
      pickup: 0,
      action_point_id: action,
      timescan: moment().format('YYYY-MM-DD HH:mm:ss')
    })
      .map((body) => body.json())
      .subscribe((data) => {
        loader.dismiss()
        if (data.status) {
          var movement_id = action
          this.allPassenger = this.allPassenger.map((item) => {
            if (item.passenger_id == passenger.passenger_id && item.pickup == 0) {
              item.status = 1
              item.action_point_id = action
            }
            return item
          })
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
          timescan: moment().format('YYYY-MM-DD HH:mm:ss')
        }).subscribe(() => {
          console.log(err)
        })
      })
  }

  enroute() {
    var loader = this.loading.create({
      content: ''
    })
    loader.present()
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    this.http.post(Util.getSystemURL() + '/api/ecmdriver/jobs/enroute',
      { movement_id: this.navParams.get('movement_id'), movement_order: this.navParams.get('movement_order'), quote_id: this.navParams.get('quote_id') }
      , options)
      .map((body) => body.json())
      .subscribe(
      (res) => {
        loader.dismiss()
        if (res.results.update) {
          if (res.results['force_passenger_fail_to_board'] > 0) {
            this.allPassenger = this.allPassenger.map((item) => {
              if (res.results['failedBoardPassenger'].findIndex((item2) => item2.job_passengers_id == item.job_passengers_id) > -1) {
                item.status = -1
              }
              return item
            })
            var dataPayload: NotiPayload = {}
            var failedBoardPassenger = this.allPassenger.filter((item) => item.pickup == 1 && item.movement_order == this.navParams.get('movement_order') && item.status == -1)
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
            var failedAlignPassenger = this.allPassenger
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
          alert('Cannot en-route. please try again')
        }

      },
      (err) => {
        alert('Cannot enter this route')
      }
      )
  }

  endroute() {
    var alertItem = this.alertCtrl.create({
      title: 'End Job',
      message: 'Are you sure you want to End job?',
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ok',
          handler: data => {
            var boardPassenger = this.allPassenger.filter((item2) => item2.pickup == 1 && item2.status == 1)
            var notAlignPassenger = this.allPassenger.filter((item3) => {
              return boardPassenger.findIndex((item4) => item4.passenger_id == item3.passenger_id) >= 0 && item3.pickup == 0 && item3.status == 0
            })
            console.log('count passenger not align:' + notAlignPassenger.length)
            if (notAlignPassenger.length > 0) {
              var alertItem2 = this.alertCtrl.create({
                title: 'End Job',
                message: notAlignPassenger.length + ' passenger(s) not alighted. Please check your vehicle and press confirm to force log off remaining passengers and end job',
                buttons: [
                  {
                    text: 'Cancel',
                    handler: data => {
                      console.log('Cancel clicked');
                    }
                  },
                  {
                    text: 'Ok',
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

  processEndRoute() {
    var loader = this.loading.create({
      content: ''
    })
    loader.present()
    this.request.updateToEndRoute(this.navParams.get('movement_order') - 99, this.navParams.get('quote_id'), this.navParams.get('movement_id'))
      .subscribe(
      (res) => {
        loader.dismiss()
        this.callback({
          movement_id: this.navParams.get('movement_id'),
          movement_order: this.navParams.get('movement_order'),
          quote_id: this.navParams.get('quote_id')
        })
          .then(() => {
            this.navCtrl.pop()
          })
      },
      (err) => {
        alert('Cannot end this route')
      }
      )
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

  sendNotification(parent_email: string, data: object) {
    this.request.sendNotificationToParent(parent_email, data)
      .subscribe((res) => {
        console.log(res)
      })
  }
}
