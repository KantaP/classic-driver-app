import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Util } from '../util/util';
import 'rxjs/add/operator/map';
import { Global } from '../util/global'


@Injectable()
export class LoginService {

  constructor(
    public http: Http) {

  }

  requestApiKey(){
    return this.http.get( Util.getSystemURL() + '/secret/generateApiKey/ecmdriver')
      .map(res => res.json())
  }

  requestSiteURL( company_code ) {
    let body = {
      code: company_code
    }

    let headers = new Headers({
      'x-access-key': Global.getGlobal('api_key')
    })


    return this.http.post(
        Util.getSystemURL() + '/api/ecmdriver/companycode',
        body,
        {
          headers: headers
        }
      )
      .map(res => res.json())
  }

  authen( user, pass, code) {
    let body = {
      code: code,
      _u: user,
      _p: pass
    }
    console.log(Global.getGlobal('api_key'))
    let headers = new Headers({
      'x-access-key': Global.getGlobal('api_key')
    })

    return this.http.post(
        Util.getSystemURL() + '/api/ecmdriver/authenticate',
        body,
        { headers: headers }
      )
      .map(res => res.json())
  }

}
