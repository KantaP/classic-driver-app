import { Global } from './../pages/util/global';
import { PassengerListPage } from './../pages/passenger-list/passenger-list';
import { Network } from '@ionic-native/network';
import { MessagePage } from './../pages/message/message'
import { VehicleHistoryPage } from './../pages/vehiclecheckhistory/history/veh_history'
import { VehiclecheckHistoryPage } from './../pages/vehiclecheckhistory/vehiclecheckhistory'
import { ViewJobPage } from './../pages/job/jobslist/viewjob/viewjob'
import { JobsSummaryPage } from './../pages/job/jobssummary/jobssummary'
import { Component, ViewChild } from '@angular/core'
import { Nav, Platform, ModalController, Events } from 'ionic-angular'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'
import { LoginPage } from '../pages/login/login'
import { JobsViewPage } from '../pages/job/job'
import { HomePage } from '../pages/home/home'
import { HomeService } from '../pages/home/home.service'
import { DataStorage } from '../pages/util/storage'
import { SettingPage } from '../pages/setting/setting'
import { AddCompany } from '../pages/addcompany/addcompany'
import { SignInVehiclePage } from '../pages/signinvehiclelist/signinvehiclepage'
import { VehicleCheckPage } from '../pages/vehiclecheck/vehiclecheck'
import { QuestionPage } from '../pages/vehiclecheck/questionPage/questionpage'
import { VehicleCheckListPage } from "../pages/vehiclecheckhistory/history/viewchecklist/viewchecklist"
import { Push } from '@ionic-native/push';

@Component({
  templateUrl: 'app.html',
  providers:[HomeService, DataStorage]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav

  rootPage: any

  pages: Array<{title: string, component: any, show:boolean, isCheckNTrack: boolean}>

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public modalCtrl: ModalController,
    public events: Events,
    private homeService:HomeService,
    private dataStorage: DataStorage,
    private network: Network,
    private push: Push
  ) {

    this.initializeApp()

    this.pages = [
      { title: "START WORK", component:"start_work", show: true, isCheckNTrack:false },
      { title: "STOP WORK", component:"stop_work", show: false, isCheckNTrack:false },
      { title: "SELECT THE VEHICLE", component: SignInVehiclePage, show: true, isCheckNTrack:false },
      { title: "VIEW JOBS", component:JobsViewPage, show: true, isCheckNTrack:false },
      { title: "VEHICLE CHECK", component: VehicleCheckPage, show: true, isCheckNTrack:false },
      { title: "VEHICLE CHECK HISTORY", component: VehiclecheckHistoryPage, show: true, isCheckNTrack:false },
      { title: "MESSAGE", component: MessagePage, show: true, isCheckNTrack:false },
      { title: "SETTING", component: SettingPage, show: false, isCheckNTrack:false },
      { title: "ADD COMPANY", component: "add_company", show: true, isCheckNTrack:false },
      { title: "LOGOUT", component: "logout", show: true, isCheckNTrack:false },
      { title: "LOGIN", component: LoginPage, show:false , isCheckNTrack: false},
      { title: "HOME", component: HomePage, show:false , isCheckNTrack: false}
    ]

    this.events.subscribe('isStartWork', (isStart)=>{
      if(isStart){
        this.pages[0].show = false
        this.pages[1].show = true
      }else{
        this.pages[0].show = true
        this.pages[1].show = false
      }
    })

    this.events.subscribe('isCheckNTrack', (isCheckNTrack)=>{
      if(isCheckNTrack){
        for (var i in this.pages) {
          if (this.pages[i].component == JobsViewPage ||
            this.pages[i].component == VehicleCheckPage ||
            this.pages[i].component == VehiclecheckHistoryPage ||
            this.pages[i].component == "add_company") {

            this.pages[i].show = true
            this.pages[i].isCheckNTrack = true
          }
        }
      }else{
        for (var i in this.pages) {
          if (this.pages[i].component == JobsViewPage ||
            this.pages[i].component == VehicleCheckPage ||
            this.pages[i].component == VehiclecheckHistoryPage ||
            this.pages[i].component == "add_company") {

            this.pages[i].show = true
            this.pages[i].isCheckNTrack = false
          }
        }
      }
    })


  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // this.rootPage = PassengerListPage
      this.rootPage = LoginPage
      // this.dataStorage.getLogData('auth')
      // .subscribe(
      //   (res)=>{
      //     console.log(res.rows.length)
      //     if(res.rows.length > 0) {
      //       this.openPage(this.pages.filter((item)=>item.title == 'HOME')[0])
      //     }else{
      //       this.openPage(this.pages.filter((item)=>item.title == 'LOGIN')[0])
      //     }
      //   }
      // )
      this.statusBar.styleDefault()
      this.splashScreen.hide()

      // this.dataStorage = new DataStorage()
      if(this.platform.is('cordova')) {
        let connectSubscription = this.network.onConnect().subscribe(() => {
          // alert(this.network.type)
        })
        let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
          // alert('Please check your internet.')
        })
      }

    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if(page.component == "start_work"){
      this.homeService.showStartWorkDialog()

    }else if(page.component == "stop_work"){
      this.homeService.showStopWorkDialog()

    }else if(page.component == "add_company"){
      let modal = this.modalCtrl.create(AddCompany, "",{enableBackdropDismiss: false})
      modal.present()

    }else if(page.component == "logout"){
      var pushObject = this.push.init({})
      pushObject.unregister()
      this.dataStorage.getLogData('push_token')
      .subscribe((res)=>{
        let items = res.rows
        console.log(items)
        this.dataStorage.clearLogDB('push_token')
        this.dataStorage.clearLogDB('auth')
        this.homeService.requestRemoveToken(items.item(0))
        .subscribe((res)=>{this.nav.setRoot(LoginPage)})
      })

    }else{
      this.nav.push(page.component)
    }
  }
}
