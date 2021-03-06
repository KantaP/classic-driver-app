
import { Injectable } from '@angular/core'
import { Http, Headers } from '@angular/http'
import { Util } from '../../../util/util'
import 'rxjs/add/operator/map'
import { Global } from '../../../util/global'


@Injectable()
export class ViewJobService {

  constructor(
    public http: Http) {

  }

  requestJobs(quote_id) {

    let headers = new Headers({
      'x-access-key': Global.getGlobal('api_key'),
      'x-access-token': Global.getGlobal('api_token')
    })
    
    return this.http.get( 
        Util.getSystemURL() + '/api/ecmdriver/jobs/byQuoteId/' + quote_id, 
        { headers: headers }
      )
      .map(res => res.json())
  }

}