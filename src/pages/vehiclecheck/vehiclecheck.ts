import { QuestionPage } from './questionPage/questionpage'
import { SignOutVehicle } from './../signoutvehicle/signoutvehicle'
import { VehicleCheckService } from './vehiclecheck.service'
import { Global } from './../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController } from 'ionic-angular'
import { GlobalProvider } from '../../providers/global/global';

@Component({
  selector: 'page-vehiclecheck',
  templateUrl: 'vehiclecheck.html',
  // providers: [VehicleCheckService]
})
export class VehicleCheckPage {

  signedin_vehicle_name: string
  isVehicleSignedIn:boolean = false

  vehicleList: Array<{index:any, vehicle_id:any, vehicle_reg:string}>

  choosenVehicle: {index:any, vehicle_id:any, vehicle_reg:string}

  constructor(
    public navCtrl: NavController,
    private _ngZone: NgZone,
    private thisService: VehicleCheckService,
    private modalCtrl: ModalController,
    private events: Events,
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

            this._ngZone.run( () => {

              this.vehicleList = []

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

  public sendSearch(key){
    this.loadVehicleList(key)
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
  public setChoosenVehicle(vehInstanceObject) {
    console.log('openCheckQuestionPage', vehInstanceObject)
    this.choosenVehicle = vehInstanceObject
    this.openCheckQuestionPage()
  }

  /**
   * openCheckQuestionPage
   */
  public openCheckQuestionPage() {

    if(this.choosenVehicle != void(0) &&
      this.choosenVehicle.vehicle_id != void(0) &&
      this.choosenVehicle.vehicle_id > 0){

      this.navCtrl.push(QuestionPage, this.choosenVehicle)
    }else{
      alert('Please, Select vehicle.')
    }
  }
}
