import { GlobalProvider } from './../../providers/global/global';
import { HomeService } from './../home/home.service'
import { SignOutVehicle } from './../signoutvehicle/signoutvehicle'
import { Global } from './../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController } from 'ionic-angular'

@Component({
    selector: 'page-jobsview',
    templateUrl: 'job.html',
    providers: [HomeService]
})

export class JobsViewPage {

    signedin_vehicle_name: string
    isVehicleSignedIn:boolean = false
    tabs:string = ''
    jobsAmount:number = 0

    constructor(
        private homeService: HomeService,
        public navCtrl: NavController,
        private _ngZone: NgZone,
        private modalCtrl: ModalController,
        private events: Events,
        private global: GlobalProvider
    ) {
        this.tabs = 'jobs_list'

        this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')

        this.events.subscribe('isVehicleSignIn', (isSignedIn)=>{
            this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')
            this.isVehicleSignedIn = isSignedIn
        })

        if(Global.getGlobal('vehicle_signin_insert_id') > 0){
            this.isVehicleSignedIn = true
        }

        this.requestJobsAmount()
    }

    requestJobsAmount(){
        this.homeService.requestJobsAmount()
        .subscribe((res)=>{
        console.log('requestJobsAmount succ:', res)
        this._ngZone.run(()=>{
            this.jobsAmount = res.result.length
        })

        },(err)=>{
        console.log('requestJobsAmount err:', err)
        })
    }

    /**
    * openSignOutDialog
    */
    public openSignOutDialog() {
        let modal = this.modalCtrl.create(SignOutVehicle, '', {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper'})
        modal.present()
    }

    /**
     * changeTabs
     */
    public changeTabs( tab ) {
        this._ngZone.run(()=>{
            this.tabs = tab
            console.log(this.tabs)
        })

    }

}
