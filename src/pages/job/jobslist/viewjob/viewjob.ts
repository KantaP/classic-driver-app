import { SignOutVehicle } from './../../../signoutvehicle/signoutvehicle'
import { Global } from './../../../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController } from 'ionic-angular'

@Component({
    selector: 'page-viewjob',
    templateUrl: 'viewjob.html',
    providers: []
})

export class ViewJobPage {

    loading:boolean = true
    signedin_vehicle_name: string
    isVehicleSignedIn:boolean = false
    job_status:string = '0'

    constructor(
        public navCtrl: NavController,
        private _ngZone: NgZone,
        private modalCtrl: ModalController,
        private events: Events
    ) {

        this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')

        this.events.subscribe('isVehicleSignIn', (isSignedIn)=>{
            this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')
            this.isVehicleSignedIn = isSignedIn
        })
        
        if(Global.getGlobal('vehicle_signin_insert_id') > 0){
            this.isVehicleSignedIn = true
        }

    }

    /**
    * openSignOutDialog
    */
    public openSignOutDialog() {
        let modal = this.modalCtrl.create(SignOutVehicle, '', {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper'})
        modal.present()
    }
    
}