import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Util } from '../util/util';
import 'rxjs/add/operator/map';
import { Global } from '../util/global'


@Injectable()
export class VehicleCheckService {

  constructor(
    public http: Http) {

  }

  requestVehicleList( query) {

    let type = "name"

    let headers = new Headers({
      'x-access-key': Global.getGlobal('api_key'),
      'x-access-token': Global.getGlobal('api_token')
    })
    
    return this.http.get( 
        Util.getSystemURL() + '/api/ecmdriver/vehicle/list/' + type + '/' + query, 
        { headers: headers }
      )
      .map(res => res.json())
  }

}