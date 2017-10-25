import { ModalProvider } from './../../providers/modal/modal';
import { Component , ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
/**
 * Generated class for the ModalDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Component({
  selector: 'modal',
  template: '<ng-content></ng-content>'
})
export class ModalDirective implements OnInit,OnDestroy {
  @Input() id: string;
  private element: any;
  constructor(private modalService: ModalProvider, private el: ElementRef) {
      this.element = $(el.nativeElement);
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
