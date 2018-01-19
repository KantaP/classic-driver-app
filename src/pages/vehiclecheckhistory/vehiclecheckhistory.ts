import { VehicleHistoryPage } from './history/veh_history'
import { SignOutVehicle } from './../signoutvehicle/signoutvehicle'
import { VehicleCheckService } from './../vehiclecheck/vehiclecheck.service'
import { Global } from './../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController } from 'ionic-angular'
import { GlobalProvider } from '../../providers/global/global';

@Component({
  selector: 'page-vehiclecheckhistory',
  templateUrl: 'vehiclecheckhistory.html',
  providers: [VehicleCheckService]
})
export class VehiclecheckHistoryPage {

  loading:boolean = true

  signedin_vehicle_name: string
  isVehicleSignedIn:boolean = false

  vehicleList: Array<{index:any, vehicle_id:any, vehicle_reg:string}>

  choosenVehicle: Array<{index:any, vehicle_id:any, vehicle_reg:string}> = []

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

    this.vehicleList = []

    this.loadVehicleList()
  }

  /**
   * loadVehicleList
   */
  public loadVehicleList(query='all'){
    this.thisService.requestVehicleList(query).subscribe(
        (res)=>{
          console.log('Veh History loadVehicleList succ:', res)
          if(res.code == 2){

            this._ngZone.run( () => {

              for (var i = 0; i < res.result.length; i++) {
                this.vehicleList.push({
                  index:i+1,
                  vehicle_id: res.result[i].vehicle_id,
                  vehicle_reg: res.result[i].vehicle_reg
                })
              }
              this.loading = false
            })
          }
          console.log(this.vehicleList)
        },
        (err)=>{
          console.log('Veh History loadVehicleList err:', err)
        }
    )
  }

  /**
  * openChoosenVehicle
  */
  public openChoosenVehicle(index) {
    console.log('openChoosenVehicle', index, this.vehicleList[index])
    if (this.choosenVehicle.length > 0) {
      this.choosenVehicle.pop()
    }
    this.choosenVehicle.push(this.vehicleList[index])
    this.navCtrl.push(VehicleHistoryPage, this.choosenVehicle)
  }

  /**
  * openSignOutDialog
  */
  public openSignOutDialog() {
      let modal = this.modalCtrl.create(SignOutVehicle, '', {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper'})
      modal.present()
  }
}
