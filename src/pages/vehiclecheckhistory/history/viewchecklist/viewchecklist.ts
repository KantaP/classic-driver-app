
import { SignOutVehicle } from './../../../signoutvehicle/signoutvehicle'
import { Global } from './../../../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController, NavParams } from 'ionic-angular'
import { ViewCheckListService } from "./viewchecklist.service"
import { GlobalProvider } from '../../../../providers/global/global';

@Component({
  selector: 'page-viewchecklist',
  templateUrl: 'viewchecklist.html',
  providers: [ViewCheckListService]
})
export class VehicleCheckListPage {

  signedin_vehicle_name:string
  isVehicleSignedIn:boolean = false

  loading:boolean = true
  isEmpty:boolean = false

  storyList: Array<{
    chk_res_sing_id: number,
    chk_res_id: number,
    driver_id: number,
    vehicle_id: number,
    quote_id: number,
    movement_id: number,
    chk_id: number,
    chk_pass: number,
    chk_critical_fail: number,
    chk_notes: string,
    chk_date: string,
    chk_date_convert: string,
    chk_status: string,
    chk_img: string[],
    question: string,
    chk_notes_bg_color: string,
    status: string,
    status_bg: string}> = []

  chk_id:number = 0
  veh_id:number = 0

  constructor(
    public navCtrl:NavController,
    private _ngZone:NgZone,
    private modalCtrl:ModalController,
    private events:Events,
    private viewCheckListService:ViewCheckListService,
    private navParams:NavParams,
    private global: GlobalProvider
  ) {
    this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')

    this.events.subscribe('isVehicleSignIn', (isSignedIn)=>{
        this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')
        this.isVehicleSignedIn = isSignedIn
    })

    if(Global.getGlobal('vehicle_signin_insert_id') > 0){
        this.isVehicleSignedIn = true
    }

    this.veh_id = this.navParams.get('vehicle_id')
    this.chk_id = this.navParams.get('chk_id')

    this.loadCheckList(this.chk_id, this.veh_id)

  }

  /**
   * loadHistoryList
   */
  public loadCheckList(chk_id, vid) {
      this.viewCheckListService.requestVehicleCheckList(chk_id, vid, 1)
      .subscribe((res)=>{
        this._ngZone.run(()=>{
          this.loading = false
          console.log('loadCheckList succ:', res)
          this.storyList = res.result.data
          if(this.storyList.length == 0){
            this.isEmpty = true
          }
        })
      },(err)=>{
        this.loading = false
        this.isEmpty = true
        console.log('loadCheckList err:', err)
      })
  }

  /**
  * openSignOutDialog
  */
  public openSignOutDialog() {
      let modal = this.modalCtrl.create(SignOutVehicle, '', {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper'})
      modal.present()
  }
}
