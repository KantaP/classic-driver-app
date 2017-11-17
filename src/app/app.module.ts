import { ViewNavigationPage } from './../pages/view-navigation/view-navigation';
import { ViewRoutePage } from './../pages/view-route/view-route';
import { ModalProvider } from './../providers/modal/modal';
import { ModalDirective } from './../directives/modal/modal';


import { LoginPage } from '../pages/login/login'
import { MessagePage } from './../pages/message/message'
import { VehicleHistoryPage } from './../pages/vehiclecheckhistory/history/veh_history'
import { VehiclecheckHistoryPage } from './../pages/vehiclecheckhistory/vehiclecheckhistory'
import { ViewJobPage } from './../pages/job/jobslist/viewjob/viewjob'
import { JobsSummaryPage } from './../pages/job/jobssummary/jobssummary'
import { JobsListPage } from './../pages/job/jobslist/jobslist'
import { BrowserModule } from '@angular/platform-browser'
import { ErrorHandler, NgModule } from '@angular/core'
import { FileTransfer } from '@ionic-native/file-transfer'
import { File } from '@ionic-native/file'
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular'
import { HttpModule} from '@angular/http'
import { Camera } from '@ionic-native/camera'
import { Diagnostic } from '@ionic-native/diagnostic'

import { MyApp } from './app.component'
import { HomePage } from '../pages/home/home'
import { JobsViewPage } from '../pages/job/job'
import { AddCompany } from '../pages/addcompany/addcompany'
import { StartWork } from '../pages/startwork/startwork'
import { StopWork } from '../pages/stopwork/stopwork'
import { SettingPage } from '../pages/setting/setting'
import { SignInVehiclePage } from '../pages/signinvehiclelist/signinvehiclepage'
import { SignInVehicle } from '../pages/signinvehicle/signinvehicle'
import { SignOutVehicle } from '../pages/signoutvehicle/signoutvehicle'
import { VehicleCheckPage } from '../pages/vehiclecheck/vehiclecheck'
import { QuestionPage } from '../pages/vehiclecheck/questionPage/questionpage'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'
import { Geolocation } from '@ionic-native/geolocation'
import { VehicleCheckListPage } from "../pages/vehiclecheckhistory/history/viewchecklist/viewchecklist"
import { MessageModal } from "../pages/message/modal/modal.sentmessage"

import { Network } from '@ionic-native/network';
import { IonicStorageModule } from '@ionic/storage';
import { SQLite } from '@ionic-native/sqlite';
import { Push } from '@ionic-native/push';
import { PassengerListPage } from './../pages/passenger-list/passenger-list';

import { RequestProvider } from '../providers/request/request';
import { PassengerAddNotePage } from '../pages/passenger-add-note/passenger-add-note';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage,
    JobsViewPage,
    AddCompany,
    StartWork,
    StopWork,
    JobsListPage,
    JobsSummaryPage,
    VehiclecheckHistoryPage,
    MessageModal,
    VehicleHistoryPage,
    SignInVehicle,
    SignOutVehicle,
    SignInVehiclePage,
    VehicleCheckListPage,
    ViewJobPage,
    QuestionPage,
    MessagePage,
    VehicleCheckPage,
    SettingPage,
    PassengerListPage,
    ModalDirective,
    ViewRoutePage,
    ViewNavigationPage,
    PassengerAddNotePage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: '__classic_driver_app',
         driverOrder: ['sqlite', 'indexeddb', 'websql']
    }),
    FormsModule,
    ReactiveFormsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage,
    JobsViewPage,
    AddCompany,
    JobsListPage,
    JobsSummaryPage,
    VehiclecheckHistoryPage,
    VehicleCheckListPage,
    VehicleHistoryPage,
    StartWork,
    StopWork,
    SignInVehiclePage,
    MessageModal,
    ViewJobPage,
    QuestionPage,
    MessagePage,
    SignInVehicle,
    SignOutVehicle,
    VehicleCheckPage,
    SettingPage,
    PassengerListPage,
    ViewRoutePage,
    ViewNavigationPage,
    PassengerAddNotePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Camera,
    Diagnostic,
    FileTransfer,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Network,
    SQLite,
    ModalProvider,
    Push,
    RequestProvider,
  ]
})
export class AppModule {}
