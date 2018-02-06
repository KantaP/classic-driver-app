
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
      .retry(5)
      .map(res => res.json())
  }

  requestOtherJob(quote_id) {
    let headers = new Headers({
      'x-access-key': Global.getGlobal('api_key'),
      'x-access-token': Global.getGlobal('api_token')
    })

    return this.http.get(
        Util.getSystemURL() + '/api/ecmdriver/jobs/otherMovmentByQuote/' + quote_id,
        { headers: headers }
      )
      .retry(5)
      .map(res => res.json())
  }

  acceptJob(driver_id , quote_id) {
    let headers = new Headers({
      'x-access-key': Global.getGlobal('api_key'),
      'x-access-token': Global.getGlobal('api_token')
    })
    return this.http.post(
      Util.getSystemURL() + '/api/ecmdriver/jobs/driverAccept',
      { driver_id , quote_id},
      { headers: headers }
    )
    .retry(5)
    .map(res => res.json())
  }

}
