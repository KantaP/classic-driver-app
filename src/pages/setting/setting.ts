import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html'
})
export class SettingPage {
  reader: string
  constructor(public navCtrl: NavController) {
    this.reader = 'rfid'
  }
}
