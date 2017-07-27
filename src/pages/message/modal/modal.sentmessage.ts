import { Component } from '@angular/core'
import { ViewController, NavParams } from "ionic-angular"

@Component({
  selector: 'modal-message',
  templateUrl: 'modal.sentmessage.html',
  providers: []
})
export class MessageModal {
    txt:string = ''
    constructor(
        public viewCtrl: ViewController,
        public navParams: NavParams
        ) {
            this.txt = this.navParams.get('txt')
    }

    dismiss() {
    this.viewCtrl.dismiss()
    }

}