import { SignOutVehicle } from './../../../signoutvehicle/signoutvehicle'
import { Global } from './../../../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController, NavParams } from 'ionic-angular'
import { ViewJobService } from './viewjob.service'

@Component({
    selector: 'page-viewjob',
    templateUrl: 'viewjob.html',
    providers: [ViewJobService]
})

export class ViewJobPage {

    loading:boolean = true
    signedin_vehicle_name: string
    isVehicleSignedIn:boolean = false
    job_status:string = '0'
    qid = 0
    journey:any
    noResult:boolean = false

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private _ngZone: NgZone,
        private modalCtrl: ModalController,
        private events: Events,
        private viewJobService: ViewJobService
    ) {

        this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')

        this.events.subscribe('isVehicleSignIn', (isSignedIn)=>{
            this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')
            this.isVehicleSignedIn = isSignedIn
        })
        
        if(Global.getGlobal('vehicle_signin_insert_id') > 0){
            this.isVehicleSignedIn = true
        }

        this.qid = this.navParams.get("data")
        this.getJob(this.qid)
    }

    /**
    * openSignOutDialog
    */
    public openSignOutDialog() {
        let modal = this.modalCtrl.create(SignOutVehicle, '', {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper'})
        modal.present()
    }

    public getJob(quote_id){
        this.viewJobService.requestJobs(quote_id)
        .subscribe((res)=>{
            console.log('getJob res:', res)
            this._ngZone.run(()=>{
                this.loading = false
                if(res.code == 2){
                    this.journey = res.result
                }else{
                    this.noResult = true
                }
            })    
        },
        (err)=>{
            console.log('getJob err:', err)
            this._ngZone.run(()=>{
                this.loading = false
                this.noResult = true
            })
        })
    } 
}