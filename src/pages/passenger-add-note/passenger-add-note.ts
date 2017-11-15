import { MessageModal } from './../message/modal/modal.sentmessage';
import { Passenger } from './../util/model/passenger';
import { DataStorage } from './../util/storage';
import { Component,  } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { FormGroup  , Validators , FormControl} from '@angular/forms';
import { RequestProvider } from '../../providers/request/request';
import { ModalProvider } from '../../providers/modal/modal';

/**
 * Generated class for the PassengerAddNotePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
interface Question {
  qut_name?: string;
  qut_description?: string;
  qut_format?:string;
  qut_options?: string;
  qut_id?:number;
}

@Component({
  selector: 'page-passenger-add-note',
  templateUrl: 'passenger-add-note.html',
})
export class PassengerAddNotePage {
  private questions: Array<Question>
  private passenger: Passenger
  private questionForm: FormGroup
  private expandItemLabel: Array<string>
  private passengerNote: string
  private popUpMessage: string
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private dataStore: DataStorage , private request: RequestProvider, private modal:ModalProvider,
    private modalCtrl: ModalController) {
    this.passenger = this.navParams.get('passenger')
    this.questions = []
    this.questionForm = undefined
    this.expandItemLabel = []
    this.passengerNote = ""
    this.popUpMessage = ""
  }

  ngAfterViewInit(){
    this.initQuestion()
  }

  initQuestion(){
    this.dataStore.getLogData('passengerQuestions')
    .subscribe((data)=>{
      var rows = data.rows
      let group: any = {};
      for(let i = 0 ; i < rows.length; i++) {
        var item = rows.item(i)
        var options = rows.item(i).qut_options
        if(options.includes(',')){
          item.options = options.split(',')
        }
        group[item.qut_name] =  new FormControl('')
        this.questions.push(item)
      }
      this.questionForm = new FormGroup(group)
    })
  }

  expandSub(label: string, e: any){
    // console.log(e.checked)
    var index = this.expandItemLabel.findIndex((item)=>item==label)
    if(index > -1) {
      this.expandItemLabel = this.expandItemLabel.filter((item)=>item!=label)
      e.checked = false
      this.questionForm.controls[label].patchValue("")
    }else{
      this.expandItemLabel.push(label)
      e.checked = true
    }
  }

  expandedItem(label) {
    var index = this.expandItemLabel.findIndex((item)=>item==label)
    if(index > -1) {
      return true
    }else{
      return false
    }
  }

  submitForm() {
    var funcs = []
    // send note
    if(this.passengerNote != "") {
      funcs.push(this.request.addPassengerNote(this.passenger.quote_id,this.passenger.passenger_id,this.passengerNote).toPromise())
    }

    Object.keys(this.questionForm.controls).forEach((key)=>{
      if(this.questionForm.controls[key].value != "") {
        funcs.push(
          this.request.addPassengerAnswer(
            this.passenger.quote_id,
            this.passenger.passenger_id,
            this.questionForm.controls[key].value,
            this.passenger.point_id,
            this.questions.filter((item)=>item.qut_name==key)[0].qut_id
          ).toPromise()
        )
      }
    })

    Promise.all(funcs)
    .then((responses)=>{
      this.popUpMessage = "Success!!!"
      // this.modal.open('alert-popup')
      let modal = this.modalCtrl.create(MessageModal, {txt:this.popUpMessage}, {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper modal-message-custom'})
      modal.present()
    })

  }

  closePopup(){
    this.modal.close('alert-popup')
  }

}
