import { Component } from '@angular/core'
import { ViewController, Events } from 'ionic-angular'
import { StartWorkService } from './startwork.service'
import { Global } from '../util/global'
import moment from 'moment'

@Component({
  selector: 'modal-startwork',
  templateUrl: 'modal.startwork.html',
  providers: [StartWorkService]
})
export class StartWork {

  thisTime: any 

  constructor(
    public viewCtrl: ViewController,
    private startWorkService: StartWorkService,
    public events: Events
    ) {

      this.thisTime = moment().format('DD MMM YYYY   h.mmA')

  }

  public closeStartWorkModal(){
    this.viewCtrl.dismiss()
  }

  updateStartWork(){
    console.log("updateStartWork")
    this.startWorkService.startWork()
      .subscribe((res)=>{
        console.log("startwork service succ:", res)

        if(res.code === 2){

          this.events.publish('isStartWork', true)

          Global.setGlobal("start_work_id", res.result.insertId)

          alert(res.text)

          this.closeStartWorkModal()
          
        }else{
          alert("Cannot update.")
        }
        
        
      },(err)=>{
        console.log("startwork service err:", err)
        alert("Cannot update.")
      })
  }

}
