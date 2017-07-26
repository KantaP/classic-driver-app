import { Injectable } from '@angular/core'
import { Http, Headers } from '@angular/http'
import { Util } from '../../../util/util'
import 'rxjs/add/operator/map'
import { Global } from '../../../util/global'


@Injectable()
export class ViewCheckListService {

  constructor(
    public http: Http) {

  }

  requestVehicleCheckList( chk_res_id, veh_id, page_no) {

    let type = "name"

    let headers = new Headers({
      'x-access-key': Global.getGlobal('api_key'),
      'x-access-token': Global.getGlobal('api_token')
    })
    
    return this.http.get( 
        Util.getSystemURL() + '/api/ecmdriver/vehicle/check/history/' + chk_res_id + '/' + veh_id + '/' + page_no, 
        { headers: headers }
      )
      .map(res => res.json())
  }

}