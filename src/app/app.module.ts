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
import { LoginPage } from '../pages/login/login'
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

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    JobsViewPage,
    LoginPage,
    AddCompany,
    StartWork,
    StopWork,
    JobsListPage,
    JobsSummaryPage,
    VehiclecheckHistoryPage,
    VehicleHistoryPage,
    SignInVehicle,
    SignOutVehicle,
    SignInVehiclePage,
    VehicleCheckListPage,
    ViewJobPage,
    QuestionPage,
    VehicleCheckPage,
    SettingPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    JobsViewPage,
    LoginPage,
    AddCompany,
    JobsListPage,
    JobsSummaryPage,
    VehiclecheckHistoryPage,
    VehicleCheckListPage,
    VehicleHistoryPage,
    StartWork,
    StopWork,
    SignInVehiclePage,
    ViewJobPage,
    QuestionPage,
    SignInVehicle,
    SignOutVehicle,
    VehicleCheckPage,
    SettingPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Camera,
    Diagnostic,
    FileTransfer, 
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
