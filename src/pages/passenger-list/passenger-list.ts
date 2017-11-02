import { ModalProvider } from './../../providers/modal/modal';
import { Global } from './../util/global';
import { Util } from './../util/util';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Component, HostListener, Inject, ElementRef } from '@angular/core';
import { NavController, NavParams, normalizeURL, LoadingController } from 'ionic-angular';
/**
 * Generated class for the PassengerListPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

interface Passenger {
  passenger_id?: number;
  first_name?: string;
  surname?: string;
  status?: number;
  force_login?: number;
  photo?: string;
  RFID?: string;
  pickup?: number
  point_id?: number
  fromOtherRoute?: boolean
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
  private viewinstructors: boolean
  private viewForceLogin: boolean
  private colorViewForceLogin: string
  private startRead: boolean
  private rfValue: string
  private elements: any
  private timerSearch: any
  private routeString: string
  private callback: any
  private failedItem: FailedItem
  constructor(public navCtrl: NavController, public navParams: NavParams, private http: Http,
    private modal: ModalProvider, private loading: LoadingController ,@Inject(ElementRef) elementRef: ElementRef) {
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
  }

  //for read rfid
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    var rfReadEle:HTMLElement = this.elements.nativeElement.querySelector('#rfRead')
    rfReadEle.focus()
    clearTimeout(this.timer)
    this.startRead = true
    if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
      this.rfValue += event.key
    } else if (event.keyCode == 13) {
      this.searchInput = ""
      this.timer = setTimeout(() => {
        var loader = this.loading.create({
          content: 'Scanning...'
        })
        loader.present()
        var passenger = this.passengerStore.filter((item) => item.RFID == this.rfValue)
        this.rfValue = ""
        var new_status = 0
        this.closeModal()
        if (passenger.length > 0) {
          if (((passenger[0].status == 0 || passenger[0].status == -1) && passenger[0].pickup == 1) || (passenger[0].status == 0 && passenger[0].pickup == 0)) new_status = 1
          this.openModal(passenger[0])
          if (new_status > 0) {
            this.updatePassengerStatus(passenger[0].passenger_id, new_status, passenger[0].point_id , 0, passenger[0].pickup , this.navParams.get('movement_id'))
              .map((body) => body.json())
              .subscribe((data) => {
                loader.dismiss()
                if (data.status) {
                  passenger[0].status = new_status
                  this.passengerStore = this.passengerStore.map((item) => {
                    if (item.passenger_id == passenger[0].passenger_id) {
                      item.status = new_status
                    }
                    return item
                  })
                  this.calculateTodo()
                }
              })
          } else {
            // just show not update
            loader.dismiss()
          }
        } else {
          // not found passenger with RFID scan
          loader.dismiss()
        }
        this.startRead = false
        clearTimeout(this.timer)
      }, 1000)
    }
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad PassengerListPage');
    this.getPassengerInRoute()
    .subscribe((data) => {
      data = data.map((item) => {
        if (item.photo == "") item.photo = normalizeURL("assets/img/nouser.png")
        item.fromOtherRoute = false
        return item
      })
      this.passengers = data
      this.passengerStore = data
      this.calculateTodo()
    })
    this.routeString = this.navParams.get('collection_address') + ' >>> ' + this.navParams.get('destination_address')
  }

  getAllPassengerInJob() {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(Util.getSystemURL() + '/api/ecmdriver/passengers/allPassengerInJob/' + this.navParams.get('quote_id'), options)
      .map((body) => body.json())
  }

  getPassengerInRoute() {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(Util.getSystemURL() + '/api/ecmdriver/passengers/passengersInRoute/' + this.navParams.get('movement_id'), options)
      .map((body) => body.json())

  }

  calculateTodo() {
    this.listTodo.waitBus = this.passengerStore.filter((passenger) => passenger.status == 0 && passenger.pickup == 1).length
    this.listTodo.waitAlign = this.passengerStore.filter((passenger) => passenger.status == 0 && passenger.pickup == 0).length
    this.listTodo.availableOnBus = this.passengerStore.filter((passenger) => passenger.status == 1 && passenger.pickup == 1).length
    this.listTodo.aligned = this.passengerStore.filter((passenger) => passenger.status == 1 && passenger.pickup == 0).length
  }

  searchPassengers(e:Event) {
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
        if(this.passengers.length == 0) {
          this.searchFromApi(this.searchInput)
          .subscribe(
            (res)=>{
              loader.dismiss()
              res.results = res.results.map((item) => {
                if (item.photo == "") item.photo = normalizeURL("assets/img/nouser.png")
                item.fromOtherRoute = true
                return item
              })
              this.passengers = res.results
              this.passengers = this.passengers.filter((item)=>{
                // find duplicate
                var duplicate = this.passengers.filter((item2)=>item2.passenger_id == item.passenger_id)
                if(duplicate.length > 1) {
                  // check if has failboard return else return waitalign
                  var failBoard = duplicate.filter((item3)=>item3.pickup == 1 && item3.status == -1)
                  if(failBoard.length > 0) return (item.pickup == 1 && item.status == -1)
                  else return (item.pickup == 0 && item.status == 0)
                }else{
                  return item
                }
              })
            },
            (err)=>{
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

  searchFromApi(query: string) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    var quote_id = this.navParams.get('quote_id')
    return this.http.get(
      Util.getSystemURL() + '/api/ecmdriver/passengers/searchPassenger/' + quote_id + '/' + query,options)
      .map((body)=>body.json())
  }

  updatePassengerStatus(passenger_id: number, status_new: number, movement_id: number, force_login: number, pickup: number, action_point_id: number) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    let body = { passenger_id, status_new, movement_id, force_login, pickup , action_point_id}
    return this.http.post(Util.getSystemURL() + '/api/ecmdriver/passengers/passengerUpdateStatus', body, options)
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

  openModal(passenger: any, allow_force_login: boolean = true, allow_view_instructors: boolean = true) {
    this.passengerItem = passenger
    this.viewForceLogin = allow_force_login
    this.viewinstructors = allow_view_instructors
    if (!allow_force_login) this.colorViewForceLogin = "primary"
    else this.colorViewForceLogin = "disable"
    if (!allow_view_instructors) this.colorViewInstructors = "primary"
    else this.colorViewInstructors = "disable"

    if ((passenger.status == 1 && passenger.pickup == 1) || (passenger.pickup == 0)) {
      this.viewForceLogin = true
      this.colorViewForceLogin = "disable"
    }
    this.modal.open('passenger-item')
  }

  closeModal() {
    this.modal.close('passenger-item')
  }

  forceLogin(passenger: any) {
    var loader = this.loading.create({
      content: 'Force login...'
    })
    this.updatePassengerStatus(passenger.passenger_id, 1, passenger.point_id, 1, passenger.pickup , this.navParams.get('movement_id'))
      .map((body) => body.json())
      .subscribe((data) => {
        loader.dismiss()
        if (data.status) {
          this.passengers = this.passengers.map((item) => {
            if (item.passenger_id == passenger.passenger_id && item.pickup == 1) {
              item.status = 1
            }
            return item
          })
          this.passengerStore = this.passengerStore.map((item) => {
            if (item.passenger_id == passenger.passenger_id && item.pickup == 1) {
              item.status = 1
            }
            return item
          })
          this.calculateTodo()
        }
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
    this.http.post(Util.getSystemURL() + '/api/ecmdriver/jobs/enroute',{movement_id: this.navParams.get('movement_id')} ,options)
    .map((body) => body.json())
    .subscribe(
      (res)=>{
        loader.dismiss()
        this.callback({movement_id: this.navParams.get('movement_id')})
        .then(()=>{
          this.navCtrl.pop()
        })
      },
      (err)=>{
        alert('Cannot end this route')
      }
    )
  }

  openFailedModal(content: string, failedType: string, shouldBeAddress?: string) {
    this.failedItem.title = content
    if(failedType == 'ALEADY_BOARD') {
      this.failedItem.icon = 'assets/img/icon-failed-board-2.png'
      this.failedItem.shouldBeAddress = ''
    }else if(failedType == 'WRONG_ADDRESS'){
      this.failedItem.icon = 'assets/img/icon-failed-board-1.png'
      this.failedItem.shouldBeAddress = shouldBeAddress
    }else if(failedType == 'NOT_HAVE_PASSENGER') {
      this.failedItem.icon = 'assets/img/icon-failed-board-1.png'
      this.failedItem.shouldBeAddress = ''
    }
    this.modal.open('warning-popup')
  }
}
