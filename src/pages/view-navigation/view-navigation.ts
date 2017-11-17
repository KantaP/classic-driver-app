import { Subscription } from 'rxjs/Subscription';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

declare var google;
/**
 * Generated class for the ViewNavigationPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-view-navigation',
  templateUrl: 'view-navigation.html',
})
export class ViewNavigationPage {
  private map: any
  private markers: any
  private userMarker: any
  private userRadius: any
  private watchPosition: Subscription
  constructor(public navCtrl: NavController, public navParams: NavParams, private geo: Geolocation) {
    this.markers = null
    this.userMarker = null
    this.userRadius = null
  }

  ionViewWillEnter() {
    this.geo.getCurrentPosition().then((resp)=>{
      console.log(resp)
      this.initMap(resp)
    })
    .catch((error) => {
      console.log('Error getting location', error);
    });
  }

  ionViewDidLoad() {

    this.watchPosition = this.geo.watchPosition().subscribe(
      (resp)=>{
        this.updatePosition(resp)
      },
      (err)=>{
        console.log(err)
      }
    )
  }

  ionViewDidLeave(){
    this.clearEverything()
    this.watchPosition.unsubscribe()
  }

  clearEverything(){
    this.markers.setMap(null)
    this.userMarker.setMap(null)
    this.userRadius = null
    this.map = null
  }

  initMap(resp: Geoposition){
    var routeDetil = this.navParams.get('routeDetil')
    console.log(routeDetil)
    console.log(resp)
    var directionsService = new google.maps.DirectionsService;
    this.map = new google.maps.Map(document.querySelector('#map'),{
      center: new google.maps.LatLng(resp.coords.latitude,resp.coords.longitude),
      zoom:18
    })
    var rendererOptions = {
      map: this.map,
      suppressMarkers : true
    }
    var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    directionsService.route({
      origin: `${resp.coords.latitude},${resp.coords.longitude}`,
      destination: routeDetil.movement.des_latlng,
      optimizeWaypoints: true,
      travelMode: 'DRIVING'
    }, (response, status)=> {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
      }
      this.markers = new google.maps.Marker({
        position: new google.maps.LatLng(parseFloat(routeDetil.movement.des_latlng.split(',')[0]), parseFloat(routeDetil.movement.des_latlng.split(',')[1])),
        map: this.map,
        icon: 'assets/img/bus-stop-icon.png'
      })
      this.userMarker = new google.maps.Marker({
        position: new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude),
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          strokeColor: '#FFF',
          strokeWeight: 4,
          fillColor: '#1D4BC8',
          fillOpacity: 0.8,
        },
      })
      this.userRadius = new google.maps.Circle({
        strokeColor: '#C5D1EB',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#C5D1EB',
        fillOpacity: 0.35,
        map: this.map,
        center: new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude),
        radius: 100
      });
    })

  }

  updatePosition(resp: Geoposition){
    var newPosition = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude)
    if(this.userMarker != null) this.userMarker.setPosition(newPosition)
    if(this.userRadius != null) this.userRadius.setCenter(newPosition)
  }

}
