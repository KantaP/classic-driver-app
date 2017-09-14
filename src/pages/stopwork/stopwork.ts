import { Component } from '@angular/core'
import { ViewController, Events, LoadingController } from 'ionic-angular'
import { StopWorkService } from './stopwork.service'
import { Global } from '../util/global'
import moment from 'moment'

@Component({
  selector: 'modal-stopwork',
  templateUrl: 'modal.stopwork.html',
  providers: [StopWorkService]
})
export class StopWork {

  thisDate:any = ""
  thisTime:any = ""
  editTime:any = ""
  editDate:any = ""
  minDate = ""
  startWorkDate = ""
  startWorkTime = ""
  isEdit: boolean = false

  constructor(
    public viewCtrl: ViewController,
    private stopWorkService: StopWorkService,
    public loadingCtrl: LoadingController,
    public events: Events
    ) {

      this.thisDate = moment().format('DD MMM YYYY')
      this.thisTime = moment().format('HH:mm')

      this.startWorkDate = moment(Global.getGlobal("start_work_time")).format('DD MMM YYYY')
      this.startWorkTime = moment(Global.getGlobal("start_work_time")).format('HH:mm')
    
  }

  public closeStopWorkModal(){
    this.viewCtrl.dismiss()
  }

  updateStopWork(){

    let stopTime = ""
    if(this.isEdit){
      stopTime = this.editDate + " " + this.editTime
    }else{
      stopTime = this.thisDate + " " + this.thisTime
    }

    stopTime = moment(stopTime).format("YYYY-MM-DD HH:mm")

    let loader = this.loadingCtrl.create({
      content: "Please wait..."
    })
    loader.present()
  

    this.stopWorkService.stopWork(stopTime)
      .subscribe((res)=>{

        loader.dismiss()

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

  updateMinDate(){
    this.editDate = moment(this.startWorkDate).format('YYYY-MM-DD')
    this.editTime = moment(this.startWorkDate).format('HH:mm')

    this.minDate = this.editDate

  }

  clearStopDate(){
    this.minDate = ""
    this.editDate = ""
    this.editTime = ""
  }

}