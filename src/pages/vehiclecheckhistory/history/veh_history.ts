import { VehicleHistoryService } from './veh_history.service'
import { SignOutVehicle } from './../../signoutvehicle/signoutvehicle'
import { Global } from './../../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController, NavParams } from 'ionic-angular'
import { VehicleCheckListPage } from "./viewchecklist/viewchecklist"

@Component({
  selector: 'page-vehhistory',
  templateUrl: 'veh_history.html',
  providers: [VehicleHistoryService]
})
export class VehicleHistoryPage {

  signedin_vehicle_name:string
  isVehicleSignedIn:boolean = false

  loading:boolean = true
  isEmpty:boolean = false

  storyList: Array<{
    vehicle_id:number,
    chk_res_id:number,
    chk_time:string,
    chk_pass:number,
    first_name:string,
    surname:string
    }> = []

  veh_id:number = 0
  veh_name:string = ''
  
  choosenId:number = null

  constructor(
    public navCtrl:NavController,
    private _ngZone:NgZone,
    private modalCtrl:ModalController,
    private events:Events,
    private vehicleHistoryService:VehicleHistoryService,
    private navParams:NavParams
  ) {
    this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')

    this.events.subscribe('isVehicleSignIn', (isSignedIn)=>{
        this.signedin_vehicle_name = Global.getGlobal('signed_vehicle_name')
        this.isVehicleSignedIn = isSignedIn
    })
    
    if(Global.getGlobal('vehicle_signin_insert_id') > 0){
        this.isVehicleSignedIn = true
    }

    this.veh_id = this.navParams.data[0].vehicle_id
    this.veh_name = this.navParams.data[0].vehicle_reg

    this.loadHistoryList(this.veh_id)

  }

  /**
   * loadHistoryList
   */
  public loadHistoryList(vid) {
      this.vehicleHistoryService.requestVehicleHistory(vid)
      .subscribe((res)=>{
        this.loading = false
        console.log('loadHistoryList succ:', res)
        this.storyList = res.result
        if(this.storyList.length == 0){
          this.isEmpty = true
        }
        
      },(err)=>{
        console.log('loadHistoryList err:', err)
        this.loading = false
        this.isEmpty = true
      })
  }

   /**
  * openCheckQuestionPage
  */
  public openChoosenStory(index) {
    console.log('setChoosenStory', index, this.storyList[index])
    this.choosenId = this.storyList[index].chk_res_id

    this.navCtrl.push(VehicleCheckListPage, 
      {
        vehicle_id: this.storyList[index].vehicle_id, 
        chk_id: this.choosenId
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
