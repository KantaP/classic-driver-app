import { DataStorage } from './../../pages/util/storage';

import { Util } from './../../pages/util/util';
import { Global } from './../../pages/util/global';
import { Injectable } from '@angular/core';
import { Http, Headers , RequestOptions } from '@angular/http';
// import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/retry';
import * as moment from 'moment'

// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs/Observable';
// import { map, catchError } from 'rxjs/operators';

interface passengerUpdate {
  passenger_id?: number;
  status_new?: number;
  force_login?: number;
  pickup?: number;
  action_point_id?: number;
  timescan?: any;
  quote_id?: number;
}

interface driverAction {
  movement_id: number;
  action: string;
  lat: string;
  lng: string;
  type: string;
  date_time: string;
  quote_id?: string;
}

interface driverActionWhole {
  quote_id: number;
  action: string;
  lat: string;
  lng: string;
  type: string;
  date_time: string;
}

interface enRoute {
  movement_id: number;
  movement_order: number;
  quote_id: number;
  lat: string;
  lng: string;
  date_time: string;
}

interface requestParams {
  title: string;
  url: string;
  type: string;
  params?: Object;
}

/*
  Generated class for the RequestProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class RequestProvider {
  connection: string
  constructor(public http: Http , private store: DataStorage ) {
    console.log('Hello RequestProvider Provider');
  }


  saveRequestToStore(request: requestParams) {
    this.store.getLogDataPromise("request-in-progress")
    .then((data)=>{
      if(data != null) {
        if(typeof data != 'object') {
          data = [data]
        }
        data.push(request)
        this.store.addLogData("request-in-progress", data)
      }else{
        var saveData = [request]
        this.store.addLogData("request-in-progress", saveData)
      }
    })
  }

  async runRequestBackGround() {
    var requests = await this.store.getLogDataPromise("request-in-progress")
    if(requests != null) {
      var headers = new Headers()
      headers.append('x-access-key', Global.getGlobal('api_key'));
      headers.append('x-access-token', Global.getGlobal('api_token'));
      var options = new RequestOptions({ headers: headers });
      var newRequests = requests
      for(let request of requests) {
        var results = null
        if(request.type == 'GET' || request.type == 'get') {
          // results  = await this.http.get(request.url,options)
          // .retry(5)
          // .map((body)=> Object.assign({},{label:request.title},body.json()))
          // .toPromise()
          // if(results) {
          //   this.store.addLogData(results.label , results)
          // }else{
          //   console.log(request.title + ' has error' , results)
          // }
        }else {
          results = await this.http.post(request.url , (request.params)? request.params : {} , options)
          .retry(5)
          .map((body)=>body.json())
          .toPromise()
          if(results) {
            console.log(request.title + ' has been success' , results)
            newRequests = newRequests.filter((item)=>item.title != request.title)
          }else{
            console.log(request.title + ' has error' , results)
          }
        }
      }
      this.store.addLogData("request-in-progress", newRequests)
    }
  }

  saveDriverAction(params:driverAction) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    let body = params
    return this.http.post(Util.getSystemURL() + '/api/ecmdriver/mobileSettings/driveraction', body, options).retry(5)
  }

  saveDriverActionWhole(params: driverActionWhole) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    let body = params
    return this.http.post(Util.getSystemURL() + '/api/ecmdriver/mobileSettings/driveractionwhole', body, options).retry(5)
  }

  updatePassengerStatus(params:passengerUpdate) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    let body = params
    return this.http.post(Util.getSystemURL() + '/api/ecmdriver/passengers/passengerUpdateStatus', body, options).retry(5)
  }

  getAllPassengerInJob(quote_id: number) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(Util.getSystemURL() + '/api/ecmdriver/passengers/allPassengerInJob/' + quote_id, options)
      .retry(5)
      .map((body) => body.json())
  }

  searchFromApi(query: string, quote_id: number) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(
      Util.getSystemURL() + '/api/ecmdriver/passengers/searchPassenger/' + quote_id + '/' + query, options)
      .retry(5)
      .map((body) => body.json())
  }

  getPassengerInRoute(movement_id: number) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(Util.getSystemURL() + '/api/ecmdriver/passengers/passengersInRoute/' + movement_id, options)
      .retry(5)
      .map((body) => body.json())
  }

  getAllPassengerInSystem()  {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(Util.getSystemURL() + '/api/ecmdriver/passengers/allPassengerInSystem', options)
      .retry(5)
      .map((body) => Object.assign({},{label:'getAllPassengerInSystem'},body.json()))
  }

  getAllPassengerInSystemPromise() {
    return this.getAllPassengerInSystem().toPromise()
  }

  sendNotificationToParent(parent_email: string, data: object) {
    let body = {
      email: parent_email,
      data
    }
    return this.http.post(Util.getNotificationUrl(), body )
      .retry(5)
      .map((body) => body.json())
  }

  getJourneyProgress(quote_id: number) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(Util.getSystemURL() + '/api/ecmdriver/jobs/journeyProgress/'+quote_id, options)
      .retry(5)
      .map((body) => Object.assign({},{label:'getJourneyProgress'},body.json()))
  }

  startJourney(j_order: number , quote_id : number) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.post(
      Util.getSystemURL() + '/api/ecmdriver/jobs/startJourney',
        {
          j_order: j_order,
          quote_id: quote_id
        },
        options
      )
      .retry(5)
      .map((body) => body.json())
  }

  endJourney(j_order: number , quote_id : number) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.post(
      Util.getSystemURL() + '/api/ecmdriver/jobs/endJourney',
        {
          j_order: j_order,
          quote_id: quote_id
        },
        options
      )
      .retry(5)
      .map((body) => body.json())
  }

  rejectJob(driver_id: number, quote_id : number) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.post(
      Util.getSystemURL() + '/api/ecmdriver/jobs/reject',
      {
        driver_id,
        quote_id
      },
      options
    )
    .retry(5)
    .map((body) => body.json())
  }

  // getPassengerForFirstMovement(quote_id: number, journey_id:number) {
  //   let headers = new Headers()
  //   headers.append('x-access-key', Global.getGlobal('api_key'));
  //   headers.append('x-access-token', Global.getGlobal('api_token'));
  //   let options = new RequestOptions({ headers: headers });
  //   return this.http.get(
  //     Util.getSystemURL() + '/api/ecmdriver/passengers/passengerForFirstMovement/'+quote_id+'/'+journey_id,
  //     options)
  //     .map((body) => Object.assign({},{label:'getPassengerForFirstMovement_'+quote_id+'_'+journey_id},body.json()))
  // }

  getPassengerQuestions() {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(Util.getSystemURL() + '/api/ecmdriver/passengers/passengerQuestions', options)
      .retry(5)
      .map((body) => Object.assign({},{label:'passengerQuestions'},body.json()))
  }

  getPassengerQuestionsPromise(){
    return this.getPassengerQuestions().toPromise()
  }

  updateToOnsite(movement_order:number,quote_id:number) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.post(
      Util.getSystemURL() + '/api/ecmdriver/jobs/alreadyOnsite',
        {
          movement_order: movement_order,
          quote_id: quote_id
        },
        options
      )
      .retry(5)
      .map((body) => body.json())
  }

  updateToEndRoute(movement_order:number, quote_id:number, movement_id: number)  {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.post(
      Util.getSystemURL() + '/api/ecmdriver/jobs/endroute',
        {
          movement_order: movement_order,
          quote_id: quote_id,
          movement_id,
          datetime: moment().format('YYYY-MM-DD HH:mm:ss')
        },
        options
      )
      .retry(5)
      .map((body) => body.json())
  }

  addPassengerNote(quote_id:number,passenger_id:number,note:string,timeAdd: any) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.post(
      Util.getSystemURL() + '/api/ecmdriver/passengers/addPassengerNote',
        {
          quote_id,
          passenger_id,
          note,
          timeAdd
        },
        options
      )
      .retry(5)
      .map((body) => body.json())
  }

  addPassengerAnswer(quote_id:number,passenger_id:number,answer:string,movement_id:number,qut_id:number) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.post(
      Util.getSystemURL() + '/api/ecmdriver/passengers/addPassengerAnswer',
        {
          quote_id,
          passenger_id,
          answer,
          movement_id,
          qut_id
        },
        options
      )
      .retry(5)
      .map((body) => body.json())
  }

  getLang() {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(Util.getSystemURL() + '/api/ecmdriver/mobileSettings/lang',options)
                    .retry(5)
                    .map((body) => Object.assign({},{label:'lang'},body.json()))
  }

  getLangPromise(){
    return this.getLang().toPromise()
  }

  getLangPack(lang) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.get(Util.getSystemURL() + '/api/ecmdriver/mobileSettings/lang/'+lang,options)
                    .retry(5)
                    .map((body) => Object.assign({},{label:'lang_'+lang},body.json()))
  }

  enroute(params: enRoute) {
    let headers = new Headers()
    headers.append('x-access-key', Global.getGlobal('api_key'));
    headers.append('x-access-token', Global.getGlobal('api_token'));
    let options = new RequestOptions({ headers: headers });
    return this.http.post(Util.getSystemURL() + '/api/ecmdriver/jobs/enroute', params , options)
          .retry(5)
          .map((body)=>body.json())
  }

}


