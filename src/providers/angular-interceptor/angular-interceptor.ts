import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest , HttpErrorResponse} from '@angular/common/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the AngularInterceptorProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class AngularInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).timeout(5000).do(event => {}, err => { // timeout of 5000 ms
        if(err instanceof HttpErrorResponse){
            console.log("Error Caught By Interceptor");
            //Observable.throw(err);
        }
    });
  }
}
