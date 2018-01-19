import { toPromise } from 'rxjs/operator/toPromise';
import { Injectable } from '@angular/core'
import { Http, Headers } from '@angular/http'
import { Geolocation } from '@ionic-native/geolocation'
import { Util } from '../util/util'
import 'rxjs/add/operator/map'
import { Global } from '../util/global'
import { Observable } from "rxjs/Observable"

@Injectable()
export class SignOutVehicleService {

  constructor(
    public http: Http,
    public geolocation: Geolocation
    ) {

    }

    async signOutVehicleNew(vehicle_id) {
      let headers = new Headers({
          'x-access-key': Global.getGlobal('api_key'),
          'x-access-token': Global.getGlobal('api_token')
      })
      var pos = await this.geolocation.getCurrentPosition({enableHighAccuracy: true, timeout:3000})
      let body = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          vehicle_id: vehicle_id,
          start_id: Global.getGlobal('vehicle_signin_insert_id')
      }

      return this.http
      .post( Util.getSystemURL() + '/api/ecmdriver/vehicle/signout', body, { headers: headers })
      .map(res => res.json())
      .toPromise()
    }

    signOutVehicle( vehicle_id ):Observable<any>{

        return Observable.create( observer =>{

            let headers = new Headers({
                'x-access-key': Global.getGlobal('api_key'),
                'x-access-token': Global.getGlobal('api_token')
            })

            let body = {
                lat: 0,
                lng: 0,
                vehicle_id: vehicle_id,
                start_id: Global.getGlobal('vehicle_signin_insert_id')
            }

            this.geolocation.getCurrentPosition({enableHighAccuracy: true, timeout:3000}).then((pos) => {

                console.log('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude)

                body.lat = pos.coords.latitude
                body.lng = pos.coords.longitude

                this.http
                    .post( Util.getSystemURL() + '/api/ecmdriver/vehicle/signout', body, { headers: headers })
                    .map(res => res.json())
                    .subscribe((res)=>{
                        observer.next(res)
                    },(err)=>{
                        observer.error(err)
                    })

            }).catch((error) => {
                console.log('Error getting location', error)
                this.http
                    .post( Util.getSystemURL() + '/api/ecmdriver/vehicle/signout', body, { headers: headers })
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
