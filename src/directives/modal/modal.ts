import { ModalProvider } from './../../providers/modal/modal';
import { Component , ElementRef, Input, OnInit, OnDestroy , OnChanges } from '@angular/core';
import * as $ from 'jquery';
declare var google;
/**
 * Generated class for the ModalDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
interface routeItem {
  col_latlng?: string;
  des_latlng?: string;

}

@Component({
  selector: 'modal',
  template: '<ng-content></ng-content>'
})
export class ModalDirective implements OnInit,OnDestroy {
  @Input() id: string;
  @Input() google: string;
  @Input() googleEle: string;
  @Input() route: Array<routeItem>;
  private element: any;
  private map: any
  private marker: Array<any>
  private _route: Array<routeItem>
  constructor(private modalService: ModalProvider, private el: ElementRef) {
      this.element = $(el.nativeElement);
      this.map = null
      this.marker = []
  }

  ngOnChanges(change) {
    if(change && change.hasOwnProperty('route')){
      this._route = change.route.currentValue
      if(this.google) {
        if(this._route.length > 0) {
          this.clearMarker()
          var col_latlng = this._route[0].col_latlng
          var Latlng = new google.maps.LatLng(parseFloat(col_latlng.split(',')[0]), parseFloat(col_latlng.split(',')[1]));
          this.map = new google.maps.Map(document.querySelector(this.googleEle),{
            zoom:8 ,
            center: Latlng,
          })
          var marker = new google.maps.Marker({
            position: Latlng,
            map: this.map,
            icon: 'assets/img/bus-stop-icon.png'
          })
          this.marker.push(marker)
        }
      }
    }
  }

  clearMarker() {
    this.marker.forEach((item)=>{
      item.setMap(null)
    })
    this.marker = []
  }

  ngOnInit() {
      let modal:any = this;
      // ensure id attribute exists
      if (!this.id) {
          console.error('modal must have an id');
          return;
      }
      // move element to bottom of page (just before </body>) so it can be displayed above everything else
      this.element.appendTo('body');

      // close modal on background click
      this.element.on('click', function (e: any) {
          var target = $(e.target);
          if (!target.closest('.modal-body').length) {
              modal.close();
          }
      });

      // add self (this modal instance) to the modal service so it's accessible from controllers
      this.modalService.add(this);
  }

  ngOnDestroy() {
    this.modalService.remove(this.id);
    this.element.remove();

  }

  // open modal
  open(): void {
      this.element.show();
      $('body').addClass('modal-open');

  }

  // close modal
  close(): void {
      this.element.hide();
      $('body').removeClass('modal-open');
  }

}
