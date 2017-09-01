import { Injectable } from '@angular/core'
import { Http, Headers } from '@angular/http'
import { Geolocation } from '@ionic-native/geolocation'
import { Util } from '../util/util'
import 'rxjs/add/operator/map'
import { Global } from '../util/global'
import { Observable } from "rxjs/Observable"


@Injectable()
export class StopWorkService {

  constructor(
    public http: Http,
    public geolocation: Geolocation
    ) {

    }

    stopWork(stopTime):Observable<any>{

        return Observable.create( observer =>{

            let headers = new Headers({
                'x-access-key': Global.getGlobal('api_key'),
                'x-access-token': Global.getGlobal('api_token')
            })

            let body = {
                lat: 0,
                lng: 0,
                time: stopTime,
                start_id: Global.getGlobal('start_work_id')
            }
            
            this.geolocation.getCurrentPosition({enableHighAccuracy: true, timeout:3000}).then((pos) => {

                console.log('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude)

                body.lat = pos.coords.latitude
                body.lng = pos.coords.longitude

                this.http
                    .post( Util.getSystemURL() + '/api/ecmdriver/stopwork', body, { headers: headers })
                    .map(res => res.json())
                    .subscribe((res)=>{
                        observer.next(res)
                    },(err)=>{
                        observer.error(err)
                    })

            }).catch((error) => {
                console.log('Error getting location', error)
                this.http
                    .post( Util.getSystemURL() + '/api/ecmdriver/stopwork', body, { headers: headers })
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