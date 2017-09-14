import { Global } from './../util/global';

import { Component, NgZone } from '@angular/core'
import { SignInVehiclePageService } from './signinvehiclepage.service'
import { ModalController, Events } from 'ionic-angular'
import { SignInVehicle } from '../signinvehicle/signinvehicle'
import { SignOutVehicle } from '../signoutvehicle/signoutvehicle'

@Component({
    selector: 'page-signinvehiclepage',
    templateUrl: 'signinvehiclepage.html',
    providers: [SignInVehiclePageService]
})
export class SignInVehiclePage{

    vehicleList: Array<{id:any, name: string}>
    signedin_vehicle_name: string
    isVehicleSignedIn:boolean = false

    constructor(
        public thisService: SignInVehiclePageService,
        private _ngZone: NgZone,
        private modalCtrl: ModalController,
        private events: Events
    ){
        this.vehicleList = []
        this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')

        this.events.subscribe('isVehicleSignIn', (isSignedIn)=>{
            this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')
            this.isVehicleSignedIn = isSignedIn
        })

        if(Global.getGlobal('vehicle_signin_insert_id') > 0){
            this.isVehicleSignedIn = true
        }

        this.loadVehicleList()
    }

     /**
     * loadVehicleList
     */
    public loadVehicleList(query='all'){
        console.log("query", query)
        if(query == '') query = 'all'
        this.thisService.requestVehicleList(query).subscribe(
            (res)=>{
                console.log('loadVehicleList succ:', res)
                if(res.code == 2){

                    this.vehicleList = []
                    
                    this._ngZone.run( () => this.vehicleList = res.result )                 
                }
                console.log(this.vehicleList)
            },
            (err)=>{
                console.log('loadVehicleList err:', err)
            }
        )

    }

    public sendSearch(key){
        this.loadVehicleList(key)
    }

    /**
     * openSignInDialog
     */
    public openSignInDialog( vehicle ) {
        let modal = this.modalCtrl.create(SignInVehicle, vehicle, {enableBackdropDismiss: false, cssClass: 'modal-signinvehicle-wrapper'});
        modal.present();
    }

    /**
     * openSignOutDialog
     */
    public openSignOutDialog() {
        let modal = this.modalCtrl.create(SignOutVehicle, '', {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper'});
        modal.present();
    }
}