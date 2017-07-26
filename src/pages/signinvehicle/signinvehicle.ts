import { Component } from '@angular/core'
import { ViewController, Events, NavParams } from 'ionic-angular'
import { SignInVehicleService } from './signinvehicle.service'
import { Global } from '../util/global'
import moment from 'moment'

@Component({
  selector: 'modal-signinvehicle',
  templateUrl: 'modal.signinvehicle.html',
  providers: [SignInVehicleService]
})
export class SignInVehicle {

  vehicleName: any 
  vehicleId: any

  constructor(
    public viewCtrl: ViewController,
    private thisService: SignInVehicleService,
    public events: Events,
    public navParams: NavParams
    ) {
      console.log(this.navParams)
      this.vehicleName = this.navParams.get('vehicle_reg')
      this.vehicleId = this.navParams.get('vehicle_id')
      
  }

  public closeSignInVehicleModal(){
    this.viewCtrl.dismiss()
  }

  updateSignInVehicle(vehicle_id){
    console.log("updateSigInVehicle: "+vehicle_id)
    this.thisService.signInVehicle( vehicle_id )
      .subscribe((res)=>{
        console.log("signinvehicle service succ:", res)

        if(res.code === 2){

          Global.setGlobal("vehicle_signin_insert_id", res.result.insertId)
          Global.setGlobal("signed_vehicle_id", this.vehicleId)
          Global.setGlobal("signed_vehicle_name", this.vehicleName)

          this.events.publish('isVehicleSignIn', true)

          alert(res.text)

          this.closeSignInVehicleModal()
          
        }else{
          alert("Cannot update.")
        }
        
        
      },(err)=>{
        console.log("signinvehicle service err:", err)
        alert("Cannot update.")
      })
  }

}
