import { Injectable } from '@angular/core'
import { ModalController } from 'ionic-angular'
import { StartWork } from '../startwork/startwork'
import { StopWork } from '../stopwork/stopwork'
import { Http, Headers } from '@angular/http'
import { Util } from '../util/util'
import 'rxjs/add/operator/map'
import { Global } from '../util/global'


@Injectable()
export class HomeService {
    

    constructor(private modalCtrl: ModalController, public http: Http) { }

    public showStartWorkDialog(){
        let modal = this.modalCtrl.create(StartWork, "",{enableBackdropDismiss: false, cssClass: 'modal-startwork-wrapper'});
        modal.present();
    }
    public showStopWorkDialog(){
        let modal = this.modalCtrl.create(StopWork, "",{enableBackdropDismiss: false, cssClass: 'modal-stopwork-wrapper'});
        modal.present();
    }

    requestJobsAmount() {

        let headers = new Headers({
        'x-access-key': Global.getGlobal('api_key'),
        'x-access-token': Global.getGlobal('api_token')
        })
        
        return this.http.get( 
            Util.getSystemURL() + '/api/ecmdriver/jobs/amount', 
            { headers: headers }
        )
        .map(res => res.json())
    }

    requestCheckNTrack(){
        let headers = new Headers({
        'x-access-key': Global.getGlobal('api_key'),
        'x-access-token': Global.getGlobal('api_token')
        })
        
        return this.http.get( 
            Util.getSystemURL() + '/api/ecmdriver/checkntrack', 
            { headers: headers }
        )
        .map(res => res.json())
    }

}