import { GlobalProvider } from './../../providers/global/global';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { MessageModal } from './modal/modal.sentmessage'
import { SignOutVehicle } from './../signoutvehicle/signoutvehicle'
import { MessageService } from './message.service'
import { Component } from '@angular/core'
import { ViewController, Events, ModalController, LoadingController } from 'ionic-angular'
import { Global } from '../util/global'
// import moment from 'moment'

@Component({
  selector: 'page-message',
  templateUrl: 'message.html',
  providers: [MessageService]
})
export class MessagePage {

    signedin_vehicle_name: string
    isVehicleSignedIn:boolean = false

    loading: boolean = true
    shownGroup = null
    uniqueId:number = 0

    message = {
        subject: '',
        body: ''
    }

    cannedMessages: Array<any> = []
    messageForm : FormGroup

    constructor(
        public viewCtrl: ViewController,
        public events: Events,
        private modalCtrl: ModalController,
        private messageService: MessageService,
        public loadingCtrl: LoadingController,
        private fb: FormBuilder,
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
        this.messageForm = this.fb.group({
          title: ['',Validators.required],
          body: ['',Validators.required]
        })
        this.getMessage()
    }

    getMessage(){
        this.messageService.requestMessage()
        .subscribe((x)=>{
            console.log('getMessage succ:', x)
            this.loading = false
            if (x.code == 2) {
                for (let i in x.result) {
                    x.result[i].uid = this.uniqueId
                    this.uniqueId++
                }
                this.cannedMessages = x.result
            }
            console.log('cannedMessages', this.cannedMessages)
        },(err)=>{
            console.log('getMessage err:', err)
            this.loading = false
        })
    }

    /**
    * openSignOutDialog
    */
    public openSignOutDialog() {
        let modal = this.modalCtrl.create(SignOutVehicle, '', {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper'})
        modal.present()
    }

    sendMessage(){


        let loader = this.loadingCtrl.create({
            content: "Please wait..."
        })
        loader.present()
        this.message = {
          subject: this.messageForm.controls['title'].value,
          body: this.messageForm.controls['body'].value,
        }
        this.messageService.sendMessageToServer(this.message)
        .subscribe((x)=>{
            console.log('sendMessage succ:', x)
            loader.dismiss()
            let modal = this.modalCtrl.create(MessageModal, {txt: x.text}, {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper modal-message-custom'})
            modal.present()
        },(err)=>{
            loader.dismiss()
            let modal = this.modalCtrl.create(MessageModal, {txt:'Error: ' + err}, {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper modal-message-custom'})
            modal.present()
            console.log('sendMessage err:', err)
        })
    }
    // setMessage(msg){
    //     this.message.subject = msg.title
    //     this.message.body = msg.message
    // }

    // toggleGroup(group) {
    //     if (this.isGroupShown(group)) {
    //         this.shownGroup = null
    //     } else {
    //         this.shownGroup = group
    //     }
    // }

    // isGroupShown(group) {
    //     return this.shownGroup === group
    // }

    selectMessage(e:any) {
      this.messageForm.controls['title'].patchValue(e.title)
      this.messageForm.controls['body'].patchValue(e.message)
    }

}
