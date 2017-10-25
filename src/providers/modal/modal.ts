import { Injectable } from '@angular/core';
/*
  Generated class for the ModalProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ModalProvider {

  private modals: Array<any>
  constructor() {
    this.modals = []
    console.log('Hello ModalProvider Provider');
  }

  add(modal: any) {
      // add modal to array of active modals
      this.modals.push(modal);
  }

  remove(id: string) {
      // remove modal from array of active modals
      this.modals = this.modals.filter((item)=>item.id != id)
  }

  open(id: string) {
      // open modal specified by id
      let modal = this.modals.filter((item)=>item.id == id);
      modal[0].open();
  }

  close(id: string) {
      // close modal specified by id
      let modal = this.modals.filter((item)=>item.id == id);
      modal[0].close();
  }

}
