import { ModalProvider } from './../../providers/modal/modal';
import { DataStorage } from './../util/storage';
import { GlobalProvider } from './../../providers/global/global';
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
import { RequestProvider } from '../../providers/request/request';
import { PushToTalkService } from '../../providers/pushToTalk/pushToTalk';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [HomeService, TrackingService]
})
export class HomePage implements OnDestroy {
  hs: HomeService
  isStartWork: boolean = false
  lastLoginDate: any = '--'
  lastLoginTime: any = '--:--'
  jobsAmount: number = 0
  logo: string = ''
  isCheckNTrack: boolean = false

  timer: Subscription = null
  lang: string
  langSelected: string
  langList: Array<string>
  langSubscription: Subscription
  constructor(
    public homeService: HomeService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public menuCtrl: MenuController,
    public events: Events,
    public _ngZone: NgZone,
    public trackingService: TrackingService,
    private global: GlobalProvider,
    private dataStore: DataStorage,
    private modal: ModalProvider,
    private request: RequestProvider,
    private p2Talk: PushToTalkService
  ) {

    let dt = this.navParams.get('datetime')

    if (dt != void (0) && dt != '') {
      this.lastLoginDate = moment(dt).format('DD MMM YYYY')
      this.lastLoginTime = moment(dt).format('HH:mm')
    }

    console.log("last login ", dt, this.lastLoginDate, this.lastLoginTime)

    this.menuCtrl.enable(true)
    this.hs = homeService

    this.events.subscribe('isStartWork', (isStart) => {
      console.log("event isStartWork", isStart)
      this.isStartWork = isStart
    })

    this.getJobAmount()
    this.getMobileSetting()
    this.getCheckNTrack()

    // this.timer = this.startTracking()
    this.trackingService.watchTracking()
    // this.langSubscription = this.global.watchLang()
    // .subscribe((data)=>{
    //   this.lang = data
    // })
    this.langInit()
    this.dataStore.getLogData('lang')
      .subscribe((data) => {
        this.langList = data.rows
      })

    this.dataStore.addLogData('reader', 'rfid')


  }

  initPushToTalkService() {
    
    this.p2Talk.enabledLog(true);

    var enabled = this.hs.getMobileSettingsValue('enable_broadcast232');
    var driverId = Global.getGlobal("driver_id");
    var webSite = Global.getGlobal("web_site");
    var ecm_siteId = Global.getGlobal("site_id");
    var region = Global.getGlobal("region");
    var name = 'driver';
    var privateId = Md5.hashStr(ecm_siteId + '-' + region + '-' + driverId);
    var roomId = this.hs.getMobileSettingsValue('broadcast_audio');
    var url = this.hs.getMobileSettingsValue('voice_url');

    if (enabled == 1) {
      this.p2Talk.initializeService(driverId, privateId, name, roomId, url);
    } else {
      this.p2Talk.unSubscribeUI();
    }
  }

  closeModal(modal) {
    this.modal.close(modal)
  }

  openModal(modal) {
    this.modal.open(modal)
  }

  // private startTracking(){
  //   return Observable
  //   .interval(1000*60 /* ms */)
  //   .timeInterval()
  //   .subscribe(
  //     (x)=>{
  //         console.log('Next: ', x)
  //         this.trackingService.sendTracking()
  //     },
  //     (err)=>{
  //         console.log('Error: ' + err)
  //     },
  //     ()=>{
  //         console.log('Completed')
  //     })
  // }

  async changeLang() {
    // this.dataStore.get
    this.dataStore.setLangDefault(this.langSelected)
    this.global.setLang(this.langSelected)
    this.lang = this.langSelected
    // var langPack = await this.dataStore.getLangPack(this.langSelected)
    // if(langPack == null) {
    this.request.getLangPack(this.langSelected)
      .subscribe((langPackData) => {
        this.dataStore.setLangPack(this.langSelected, { read: false, words: langPackData.results })
        this.global.setLangPack({ read: false, words: langPackData.results })
      })
    // }else{
    // this.global.setLangPack(langPack)
    // }

    this.modal.close('lang-dialog')
  }

  langInit() {
    this.dataStore.getLangDefault()
      .then((data) => {
        this.lang = data
        this.langSelected = data
      })
  }

  public unSubscribe(source: Subscription) {
    if (source != null) {
      source.unsubscribe()
    }
  }

  ngOnDestroy() {
    console.log('Home ngOnDestroy')
    this.unSubscribe(this.timer)
    // this.langSubscription.unsubscribe()
  }

  ionViewWillEnter() {
    this.getJobAmount()
  }

  private getJobAmount() {
    this.homeService.requestJobsAmount()
      .toPromise()
      .then((res) => {
        console.log('requestJobsAmount succ:', res)
        this.jobsAmount = res.result.length
        this.logo = Global.getGlobal('company_logo')

      })
      .catch((err) => {
        console.log('requestJobsAmount err:', err)
      })
  }

  private getMobileSetting() {
    this.homeService.requestMobileSetting()
      .toPromise()
      .then(
      (res) => {
        Global.setGlobal('mobile_settings', res.result)
        this.initPushToTalkService();
      }
      )
  }

  private getCheckNTrack() {
    this.homeService.requestCheckNTrack()
      .subscribe((res) => {
        console.log('getCheckNTrack succ:', res)
        this._ngZone.run(() => {

          //res.result = 1

          if (res.result == 1) {
            this.isCheckNTrack = true
          } else {
            this.isCheckNTrack = false
          }
          this.events.publish('isCheckNTrack', this.isCheckNTrack)
        })

      }, (err) => {
        console.log('getCheckNTrack err:', err)
        this.events.publish('isCheckNTrack', this.isCheckNTrack)
      })
  }

  private openPage(p) {
    if (p == 'sign_in_vehicle') {
      this.navCtrl.push(SignInVehiclePage)
    } else if (p == 'vehicle_check') {
      if (this.isCheckNTrack) { return }
      this.navCtrl.push(VehicleCheckPage)
    }
    else if (p == 'view_jobs') {
      if (this.isCheckNTrack) { return }
      this.navCtrl.push(JobsViewPage)
    }
  }
}
