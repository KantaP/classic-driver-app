import { Component } from '@angular/core'
import { ViewController, Events } from 'ionic-angular'
import { StopWorkService } from './stopwork.service'
import { Global } from '../util/global'
import moment from 'moment'

@Component({
  selector: 'modal-stopwork',
  templateUrl: 'modal.stopwork.html',
  providers: [StopWorkService]
})
export class StopWork {

  thisTime:any 

  constructor(
    public viewCtrl: ViewController,
    private stopWorkService: StopWorkService,
    public events: Events
    ) {

      this.thisTime = moment().format('DD MMM YYYY   h.mmA')
  }

  public closeStopWorkModal(){
    this.viewCtrl.dismiss()
  }

  updateStopWork(){
    console.log("updateStopWork")
    this.stopWorkService.stopWork()
      .subscribe((res)=>{
        console.log("stopWork service succ:", res)

        if(res.code === 2){
          Global.setGlobal("start_work_id", 0)

          alert(res.text)

          this.closeStopWorkModal()

          this.events.publish('isStartWork', false)
          
        }else{
          alert("Cannot update.")
        }
        
        
      },(err)=>{
        console.log("stopWork service err:", err)
        alert("Cannot update.")
      })
  }

}
