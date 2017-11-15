
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
declare var google;
/**
 * Generated class for the ViewRoutePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-view-route',
  templateUrl: 'view-route.html',
})
export class ViewRoutePage {
  private map: any
  private markers: Array<any>
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.markers = []
  }

  ionViewDidLoad() {
    var directionsService = new google.maps.DirectionsService;
    var journey = this.navParams.get('journey')
    this.map = new google.maps.Map(document.querySelector('#map'), {
      center: new google.maps.LatLng(parseFloat(journey.movement[0].col_latlng.split(',')[0]), parseFloat(journey.movement[0].col_latlng.split(',')[1])),
      zoom:8
    })
    var rendererOptions = {
      map: this.map,
      suppressMarkers : true
    }
    var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    var pickUpPlace = journey.movement[0].col_latlng
    var [last] = [...journey.movement].reverse()
    var destinationPlace = last.des_latlng
    var extra = journey.movement.filter((extra,index)=>{
      if(index != 0 && index != (journey.movement.length-1))
      return extra
    })
    directionsService.route({
      origin: pickUpPlace,
      destination: destinationPlace,
      waypoints: extra.map((item)=>{return{location:item.col_latlng}}),
      optimizeWaypoints: true,
      travelMode: 'DRIVING'
    },(response, status)=> {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
      }
      journey.movement.forEach((item,index)=>{
        var marker = null
        if(index == 0) {
          marker =  new google.maps.Marker({
            position: new google.maps.LatLng(parseFloat(item.col_latlng.split(',')[0]), parseFloat(item.col_latlng.split(',')[1])),
            map: this.map,
            icon: 'assets/img/bus-stop-icon-blue.png'
          })
          this.markers.push(marker)
        }else if(index == (journey.movement.length-1)) {
          marker =  new google.maps.Marker({
            position: new google.maps.LatLng(parseFloat(item.des_latlng.split(',')[0]), parseFloat(item.des_latlng.split(',')[1])),
            map: this.map,
            icon: 'assets/img/bus-stop-icon.png'
          })
          this.markers.push(marker)
        }else{
          marker =  new google.maps.Marker({
            position: new google.maps.LatLng(parseFloat(item.col_latlng.split(',')[0]), parseFloat(item.col_latlng.split(',')[1])),
            map: this.map,
            icon: 'assets/img/bus-stop-icon-black.png'
          })
          this.markers.push(marker)
        }
      })
    })
  }

}
