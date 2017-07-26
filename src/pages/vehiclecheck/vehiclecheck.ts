import { QuestionPage } from './questionPage/questionpage'
import { SignOutVehicle } from './../signoutvehicle/signoutvehicle'
import { VehicleCheckService } from './vehiclecheck.service'
import { Global } from './../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController } from 'ionic-angular'

@Component({
  selector: 'page-vehiclecheck',
  templateUrl: 'vehiclecheck.html',
  providers: [VehicleCheckService]
})
export class VehicleCheckPage {

  signedin_vehicle_name: string
  isVehicleSignedIn:boolean = false

  vehicleList: Array<{index:any, vehicle_id:any, vehicle_reg:string}>

  choosenVehicle: Array<{index:any, vehicle_id:any, vehicle_reg:string}> = []

  constructor(
    public navCtrl: NavController,
    private _ngZone: NgZone,
    private thisService: VehicleCheckService,
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

    this.vehicleList = [
      { index:0, vehicle_id: 0, vehicle_reg: "Vehicle"},
      { index:1, vehicle_id: 4, vehicle_reg: "Vehicle1"}
    ]

    this.loadVehicleList()
  }

  /**
   * loadVehicleList
   */
  public loadVehicleList(query='all'){
    this.thisService.requestVehicleList(query).subscribe(
        (res)=>{
          console.log('loadVehicleList succ:', res)
          if(res.code == 2){

            this.vehicleList = [{ index:0, vehicle_id: 0, vehicle_reg: "Vehicle"}]

            this._ngZone.run( () => {

              for (var i = 0; i < res.result.length; i++) {
                this.vehicleList.push({
                  index:i+1, 
                  vehicle_id: res.result[i].vehicle_id, 
                  vehicle_reg: res.result[i].vehicle_reg
                })
              }

            })                 
          }
          console.log(this.vehicleList)
        },
        (err)=>{
          console.log('loadVehicleList err:', err)
        }
    )
  }

  /**
  * openSignOutDialog
  */
  public openSignOutDialog() {
      let modal = this.modalCtrl.create(SignOutVehicle, '', {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper'})
      modal.present()
  }

  /**
  * openCheckQuestionPage
  */
  public setChoosenVehicle(index) {
    console.log('openCheckQuestionPage', index, this.vehicleList[index])
    if (this.choosenVehicle.length > 0) {
      this.choosenVehicle.pop()
    }
    this.choosenVehicle.push(this.vehicleList[index])
  }

  /**
   * openCheckQuestionPage
   */
  public openCheckQuestionPage() {

    if(this.choosenVehicle[0] != void(0) && 
      this.choosenVehicle[0].vehicle_id != void(0) && 
      this.choosenVehicle[0].vehicle_id > 0){

      this.navCtrl.push(QuestionPage, this.choosenVehicle)
    }else{
      alert('Please, Select vehicle.')
    }
  }
}