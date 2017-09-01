import { Component } from '@angular/core'
import { ViewController, Events, LoadingController } from 'ionic-angular'
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
    public loadingCtrl: LoadingController,
    public events: Events
    ) {

      this.thisTime = moment().format('DD MMM YYYY   HH:mm')

  }

  public closeStartWorkModal(){
    this.viewCtrl.dismiss()
  }

  updateStartWork(){
    console.log("updateStartWork")

    let start = moment(this.thisTime).format("YYYY-MM-DD HH:mm")

    let loader = this.loadingCtrl.create({
      content: "Please wait..."
    })
    loader.present()
    
    this.startWorkService.startWork(start)
      .subscribe((res)=>{
        console.log("startwork service succ:", res)

        loader.dismiss()

        if(res.code === 2){

          this.events.publish('isStartWork', true)

          Global.setGlobal("start_work_id", res.result.insertId)
          Global.setGlobal("start_work_time", res.result.workTime)

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
