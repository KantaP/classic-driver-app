import { SavedAnswerListInterface } from './../../util/model/savedAnswerListInterface';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer'
import { File } from '@ionic-native/file'
import { Global } from './../../util/global'
import { Util } from './../../util/util'
import { Injectable } from '@angular/core'
import { Http, Headers, Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import * as moment from 'moment'

@Injectable()
export class QuestionService {
    constructor(
        private http: Http,
        private transfer: FileTransfer,
        private file: File) {
    }

    requestQuestionSheet(){

        let headers = new Headers({
            'x-access-key': Global.getGlobal('api_key'),
            'x-access-token': Global.getGlobal('api_token')
        })

        return this.http.get(Util.getSystemURL() + '/api/ecmdriver/vehicle/check/sheet', { headers: headers })
                .map( res => res.json())
    }

    sendCheckSheet( answerList ){
        console.log(answerList)
        let headers = new Headers({
            'x-access-key': Global.getGlobal('api_key'),
            'x-access-token': Global.getGlobal('api_token')
        })

        let qid = Global.getGlobal('vehicle_check_quote_id')
        qid = (qid == void(0) ? 0 : qid)

        //this.uploadPhoto(answerList)

        return this.http.post(
            Util.getSystemURL() + '/api/ecmdriver/vehicle/check/sheet',
            {
                checkedList: answerList,
                quote_id: qid,
                timecheck: moment().format('YYYY-MM-DD HH:mm:ss')
            },
            {
                headers: headers
            })
            .map( res => res.json())

    }

    uploadPhoto(resKey, photolist){

        for (let i in resKey) {
            for (let j in photolist) {
                if (resKey[i].chk_id == photolist[j].key) {

                    let options: FileUploadOptions = {
                        fileKey: 'file',
                        fileName: photolist[j].name,
                        mimeType: "image/jpeg",
                        params: {
                            action: 'uploadPhoto',
                            chk_res_sing_id: resKey[i].chk_res_sing_id
                        }

                    }

                    let fileTransfer: FileTransferObject = this.transfer.create()

                    fileTransfer.upload(photolist[j].uri, encodeURI(Global.getGlobal('web_site')+"lib/api/?driver-journey"), options)
                    .then((data) => {
                        // success
                        console.log('uploadPhoto succ:', data)
                    }, (err) => {
                        // error
                        console.log('uploadPhoto err:', err)
                    })
                }
            }
        }




    }


    sendSheetCheckToServer(answer: SavedAnswerListInterface){

        let cri_val = 0

        if (answer.critical) {
            cri_val = 0
        } else {
            cri_val = 1
        }

        let headers = new Headers({
            'x-access-key': Global.getGlobal('api_key'),
            'x-access-token': Global.getGlobal('api_token')
        })

        return this.http.post(
            Util.getSystemURL() + '/api/ecmdriver/vehicle/check/sheet',
            {
                action: 'updateCheckSheet',
				movement_id: answer.movement_id,
				driver_id:Global.getGlobal('driver_id'),
				vehicle_id: answer.vehicle_id,
				chk_id: answer.chk_id,
				chk_pass: answer.value,
				chk_critical_fail: cri_val,
				chk_notes: answer.title
            },
            {
                headers: headers
            })
            .map( res => res.json())

    }
}
