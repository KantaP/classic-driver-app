import { Global } from './../util/global';
import { Injectable } from '@angular/core'
import { ModalController } from 'ionic-angular'
import { StartWork } from '../startwork/startwork'
import { StopWork } from '../stopwork/stopwork'
import { Http, Headers, RequestOptions } from '@angular/http'
import { Util } from '../util/util'
import 'rxjs/add/operator/map'

import { PushToTalkService } from '../../providers/pushToTalk/pushToTalk';
import { Item } from 'ionic-angular/components/item/item';


@Injectable()
export class HomeService {


    constructor(private modalCtrl: ModalController, public http: Http) { }

    public showStartWorkDialog() {
        let modal = this.modalCtrl.create(StartWork, "", { enableBackdropDismiss: false, cssClass: 'modal-startwork-wrapper' });
        modal.present();
    }
    public showStopWorkDialog() {
        let modal = this.modalCtrl.create(StopWork, "", { enableBackdropDismiss: false, cssClass: 'modal-stopwork-wrapper' });
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

    requestCheckNTrack() {
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

    requestMobileSetting() {
        let headers = new Headers({
            'x-access-key': Global.getGlobal('api_key'),
            'x-access-token': Global.getGlobal('api_token')
        })

        return this.http.get(
            Util.getSystemURL() + '/api/ecmdriver/mobileSettings',
            { headers: headers }
        )
            .map(res => res.json())
    }

    requestRemoveToken(token) {
        let body = {
            token
        }
        let headers = new Headers()
        headers.append('x-access-key', Global.getGlobal('api_key'));
        headers.append('x-access-token', Global.getGlobal('api_token'));
        let options = new RequestOptions({ headers: headers });
        return this.http.post(Util.getSystemURL() + '/api/ecmdriver/mobileSettings/deletetoken', body, options)
            .map((body) => body.json())
    }

    getMobileSettingsValue(key) {
        //console.log('getPushToTalkEnabled' + (JSON.stringify(Global.getGlobal('mobile_settings'))));
        var value;
        var data = Global.getGlobal('mobile_settings');
        data.forEach(item => {
            if (item.key == key) {
                value =  item.value;
            }
        });

        return value;
    }


}
