import { Global } from './global'
import { Injectable } from '@angular/core'
import { Http, Headers } from '@angular/http'
import { Util } from '../util/util'
import { Geolocation } from '@ionic-native/geolocation'
import 'rxjs/add/operator/map'


@Injectable()
export class TrackingService {

    constructor(
        public http: Http,
        public geolocation: Geolocation) {
            this.sendTracking()
    }

    sendTracking(){

        let quote_id    = (Global.getGlobal('quote_id') == void(0) ? 0 : Global.getGlobal('quote_id'))
        let movement_id = (Global.getGlobal('movement_id') == void(0) ? 0 : Global.getGlobal('movement_id'))
        let status      = (Global.getGlobal('job_status') == void(0) ? 0 : Global.getGlobal('job_status'))
        let lat         = 0
        let lng         = 0
        let speed       = 0

        let body = {
            quote_id: quote_id,
            movement_id: movement_id,
            lat: lat,
            lng: lng,
            status: status,
            speed: speed
        }

        this.geolocation.getCurrentPosition({enableHighAccuracy: true, timeout:3000}).then((pos) => {

            console.log('sendTracking succ:', 'lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude)

            body.lat = pos.coords.latitude
            body.lng = pos.coords.longitude
            body.speed = pos.coords.speed

            this.sent(body)
            
        }).catch((error) => {
            
            console.log('sendTracking err:', error)
            this.sent(body)
        })
    }

    sent(body){

        let headers = new Headers({
            'x-access-key': Global.getGlobal('api_key'),
            'x-access-token': Global.getGlobal('api_token')
        })

        this.http.post( 
                    Util.getSystemURL() + '/api/ecmdriver/tracking', 
                    body,
                    { headers: headers }
                )
                .map(res => res.json())
                .subscribe(
                (x)=>{
                    console.log('Next: ' + x)
                },
                (err)=>{
                    console.log('Error: ' + err)
                },
                ()=>{
                    console.log('Completed')
                })
    }

}