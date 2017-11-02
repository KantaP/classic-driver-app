import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
/*
  Generated class for the ActionStorageProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
interface actionInput {

}

@Injectable()
export class ActionStorageProvider {

  constructor(public http: Http, private storage: Storage) {

  }

  setKey(key: string, value: any ) {

  }

}
