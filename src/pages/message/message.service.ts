import { Injectable } from '@angular/core'
import { Http, Headers } from '@angular/http'
import { Geolocation } from '@ionic-native/geolocation'
import { Util } from '../util/util'
import 'rxjs/add/operator/map'
import { Global } from '../util/global'
import { Observable } from "rxjs/Observable"


@Injectable()
export class MessageService {

  constructor(
    public http: Http,
    public geolocation: Geolocation
    ) {

    }

    public requestMessage(){
        let headers = new Headers({
            'x-access-key': Global.getGlobal('api_key'),
            'x-access-token': Global.getGlobal('api_token')
        })

        return this.http
                .get( Util.getSystemURL() + '/api/ecmdriver/message', { headers: headers })
                .map(res => res.json())
    }

    public sendMessageToServer(msg):Observable<any>{

        return Observable.create( observer =>{
            let headers = new Headers({
                'x-access-key': Global.getGlobal('api_key'),
                'x-access-token': Global.getGlobal('api_token')
            })

            let body = {
                quoteid: (Global.getGlobal('quote_id') == void(0) ? 0 : Global.getGlobal('quote_id')),
                lat:0,
                lng:0,
                subject: msg.subject,
                message: msg.body
            }

            this.geolocation.getCurrentPosition({enableHighAccuracy: true, timeout:3000}).then((pos) => {

                console.log('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude)

                body.lat = pos.coords.latitude
                body.lng = pos.coords.longitude

                this.http
                    .post( Util.getSystemURL() + '/api/ecmdriver/message', body, { headers: headers })
                    .map(res => res.json())
                    .subscribe((res)=>{
                        observer.next(res)
                    },(err)=>{
                        observer.error(err)
                    })

            }).catch((error) => {
                console.log('Error getting location', error)
                this.http
                    .post( Util.getSystemURL() + '/api/ecmdriver/message', body, { headers: headers })
                    .map(res => res.json())
                    .subscribe((res)=>{
                        observer.next(res)
                    },(err)=>{
                        observer.error(err)
                    })
            })
        })
    }

}
