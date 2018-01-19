import { Component } from '@angular/core'
import { ViewController, Events } from 'ionic-angular'
import { SignOutVehicleService } from './signoutvehicle.service'
import { Global } from '../util/global'
import { GlobalProvider } from '../../providers/global/global';
// import moment from 'moment'

@Component({
  selector: 'modal-signoutvehicle',
  templateUrl: 'modal.signoutvehicle.html',
  providers: [SignOutVehicleService]
})
export class SignOutVehicle {

  vehicleName: any
  vehicleId: any

  constructor(
    public viewCtrl: ViewController,
    private thisService: SignOutVehicleService,
    public events: Events,
    private global: GlobalProvider
    ) {
      this.vehicleName = Global.getGlobal('signed_vehicle_name')
      this.vehicleId = Global.getGlobal('signed_vehicle_id')

  }

  public closeSignOutVehicleModal(){
    this.viewCtrl.dismiss()
  }

  updateSignOutVehicle(vehicle_id){
    console.log("updateSigOutVehicle: "+vehicle_id)
    this.thisService.signOutVehicle( vehicle_id )
      .subscribe((res)=>{
        console.log("signOutVehicle service succ:", res)

        if(res.code === 2){

          Global.setGlobal("vehicle_signin_insert_id", 0)
          Global.setGlobal("signed_vehicle_id", 0)
          Global.setGlobal("signed_vehicle_name", "-")

          this.events.publish('isVehicleSignIn', false)

          alert(res.text)

          this.closeSignOutVehicleModal()

        }else{
          alert("Cannot update.")
        }


      },(err)=>{
        console.log("signOutVehicle service err:", err)
        alert("Cannot update.")
      })
  }

}
