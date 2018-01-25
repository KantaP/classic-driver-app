import { Subscription } from 'rxjs/Subscription';
import { Global } from './global'
import { Injectable } from '@angular/core'
import { Http, Headers } from '@angular/http'
import { Util } from '../util/util'
import { Geolocation } from '@ionic-native/geolocation'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/retry';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment'
import { DataStorage } from './storage';
declare var google;
@Injectable()
export class TrackingService {
    watchSubscription: any
    constructor(
        public http: Http,
        public geolocation: Geolocation,
        public dataStorage: DataStorage) {
          this.watchSubscription = null
    }

    public forceTracking() {
      var opts = {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 5000
      };
      this.geolocation.getCurrentPosition(opts)
        .then((pos) => {
          this.sendTracking(pos)
        })
    }

    public watchTracking() {
      // this.watchSubscription = this.geolocation.watchPosition()
      //                           .filter((p) => p.coords !== undefined) //Filter Out Errors
      //                           .subscribe(position => {
      //                             this.sendTracking(position)
      //                           });
      var opts = {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 5000
    };
     this.watchSubscription = Observable
      .interval(60000)
      .subscribe(()=>{
        this.geolocation.getCurrentPosition(opts)
        .then((pos) => {
          this.sendTracking(pos)
        })
      })
    }

    public stopWatchTracking() {
      if(this.watchSubscription != null) this.watchSubscription.unsubscribe()
    }

    public sendTracking(position){

        let quote_id    = (Global.getGlobal('quote_id') == void(0) ? 0 : Global.getGlobal('quote_id'))
        let journey_id  = (Global.getGlobal('journey_id') == void(0) ? 0 : Global.getGlobal('journey_id'))
        let movement_id = (Global.getGlobal('movement_id') == void(0) ? 0 : Global.getGlobal('movement_id'))
        let status      = 0
        let lat         = 0
        let lng         = 0
        let speed       = 0
        let timestamp   = ''
        let duration    = 0
        let next_movement = Global.getGlobal('next_movement')

        let body = {
            quote_id: quote_id,
            movement_id: movement_id,
            journey_id: journey_id,
            lat: lat,
            lng: lng,
            status: status,
            speed: speed,
            duration: duration,
            timestamp: timestamp
        }

        if(next_movement && next_movement.progress != 9) {
          var service = new google.maps.DistanceMatrixService();
          console.log(next_movement)
          // console.log(journey_id , movement_id , quote_id)
          var destination = (journey_id == 0 && movement_id == 0)
                        ? new google.maps.LatLng(next_movement.add_lat,next_movement.add_lng)
                        : new google.maps.LatLng(next_movement.des_lat,next_movement.des_lng)
          if((next_movement.movement_order-99) > 0) {
            destination =  new google.maps.LatLng(next_movement.des_lat,next_movement.des_lng)
          }
          console.log(destination.toJSON())
          service.getDistanceMatrix(
            {
              origins: [new google.maps.LatLng(position.coords.latitude,position.coords.longitude)],
              destinations: [destination],
              travelMode: 'DRIVING',
              unitSystem: google.maps.UnitSystem.METRIC,
              avoidHighways: true,
              avoidTolls: true,
            }, (response, status)=>{
              if (status == 'OK') {
                var origins = response.originAddresses;
                for (var i = 0; i < origins.length; i++) {
                  var results = response.rows[i].elements;
                  for (var j = 0; j < results.length; j++) {
                    var element = results[j];
                    body.duration = parseInt(element.duration.text.split(' ')[0]);
                    body.lat = position.coords.latitude
                    body.lng = position.coords.longitude
                    body.speed = position.coords.speed || 0
                    body.timestamp = moment().format('YYYY-MM-DD HH:mm:ss')
                    body.status = next_movement.progress
                    this.sent(body)
                  }
                }
              }
            });
        }else{
          body.lat = position.coords.latitude
          body.lng = position.coords.longitude
          body.speed = position.coords.speed || 0
          body.duration = 0
          body.status = 9
          body.timestamp = moment().format('YYYY-MM-DD HH:mm:ss')

          this.sent(body)
        }
        // this.geolocation.getCurrentPosition({enableHighAccuracy: true, timeout:3000}).then((pos) => {

        //     console.log('sendTracking succ:', 'lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude)

        //     body.lat = pos.coords.latitude
        //     body.lng = pos.coords.longitude
        //     body.speed = pos.coords.speed

        //     this.sent(body)

        // }).catch((error) => {

        //     console.log('sendTracking err:', error)
        //     this.sent(body)
        // })

    }

    public sent(body){

        let headers = new Headers({
            'x-access-key': Global.getGlobal('api_key'),
            'x-access-token': Global.getGlobal('api_token')
        })

        this.http.post(
                    Util.getSystemURL() + '/api/ecmdriver/tracking',
                    body,
                    { headers: headers }
                )
                .retry(5)
                .map(res => res.json())
                .subscribe(
                (x)=>{
                    console.log('Next: ', x)
                    // this.dataStorage.addTrackingData(Global.getGlobal('quote_id'),body)
                    // .subscribe((data)=>{
                    //   console.log(data)
                    // })

                },
                (err)=>{
                    this.dataStorage.saveTodoAgain('sentTracking', body)
                    .subscribe((res)=>{
                      console.log('Error: ', err)
                    })

                },
                ()=>{
                    console.log('Completed')
                })
    }

}
