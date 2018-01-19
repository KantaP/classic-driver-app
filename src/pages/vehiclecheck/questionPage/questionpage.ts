import { Global } from './../../util/global';
import { SavedAnswerListInterface } from './../../util/model/savedAnswerListInterface'
import { QuestionObject } from './../../util/model/vehicleCheckQuestionInterFace'
import { NavController, NavParams, LoadingController } from 'ionic-angular'
import { QuestionService } from './questionpage.service'
import { Component, NgZone } from '@angular/core'
import { Camera, CameraOptions } from '@ionic-native/camera'
import { GlobalProvider } from '../../../providers/global/global';

@Component({
    selector: 'page-question',
    templateUrl: 'questionpage.html',
    providers:[QuestionService]
})

export class QuestionPage{

    chk_id:number = 0
    type: string = ''
    questionList:Array<QuestionObject> = []
    questionDesc: string = ""
    currentIndexOfQuestionList:any = 0
    isFollowUp:boolean = false
    isDefect:boolean = false
    followUpOptions = []
    multiTypeAnswerList = []
    radioTypeAnswerList = []
    radioIndex:number = null
    updateNumberValue:any = null
    radioValue = ""
    numberValue: number = null
    savedAnswerList:Array<SavedAnswerListInterface> = []
    minorFail:number = 0
    majorFail:number = 0
    successPercentage:number = 0
    prevTab:string = ''
    base64Image:string = ''
    veh_id:number = 0
    movement_id: number = 0

    photoList: Array<{key:string, name:string, uri:string}>= []


    constructor(
        private thisService: QuestionService,
        private navParams: NavParams,
        private navCtrl: NavController,
        private _ngZone: NgZone,
        private camera: Camera,
        public loadingCtrl: LoadingController,
        private global: GlobalProvider
    ) {
        console.log('QuestionPage', this.navParams)

        this.veh_id = this.navParams.data.vehicle_id

        this.getQuestionSheet()
    }

    /**
     * getQuestionSheet
     */
    private getQuestionSheet() {
        this.thisService.requestQuestionSheet().subscribe(
            (res)=>{
                console.log('getQuestionSheet succ:', res)

                this._ngZone.run(()=>{

                    this.questionList = res.result

                    this.setQuestion(
                        0,
                        this.questionList[0].chk_id,
                        this.questionList[0].chk_options.chk_type,
                        this.questionList[0].chk_desc,
                        this.questionList[0].chk_options.chk_options
                    )
                })

            },(err)=>{
                console.log('getQuestionSheet err:', err)
            }
        )
    }

    /**
     * setQuestion
     */
    private setQuestion( index, question_check_id, chk_type, desc, optionList ) {
        this._ngZone.run(()=>{
            console.log("setQuestion:", index, chk_type, desc)

            this.currentIndexOfQuestionList = index
            this.type = chk_type
            this.chk_id = question_check_id

            this.setQuestionDesc( desc )

            if(this.type == 'multi'){
                this.setMultiType( optionList )
            }
            if(this.type == 'radio'){
                this.setRadioType( optionList )
            }

            this.percentageCalculate()

        })
    }
    /**
     * percentageCalculate
     */
    private percentageCalculate() {
        let total = this.questionList.length
        let x = this.savedAnswerList.length

        this.successPercentage = x*100/total

        if(this.successPercentage > 100){
            this.successPercentage = 100
        }

        document.getElementById("progress_percent").style.width = this.successPercentage + '%'
    }
    /**
     * setQuestionDesc
     */
    private setQuestionDesc( desc ) {
        console.log("setQuestionDesc:", desc)
        this.questionDesc = desc
    }

    /**
     * submit
     */
    public submit( questionIndex, fromType ) {
        this._ngZone.run(()=>{

            if( (fromType == 'multi' && !this.isMultiHasChecked()) ||
                (fromType == 'radio' && this.radioIndex == null)){
                alert('Please select answer.')
                return
            }

            this.saveAnswer(fromType)

            let nextQuestionIndex = questionIndex+1
            console.log('questionIndex', questionIndex, "next:", nextQuestionIndex)


            if(nextQuestionIndex > this.questionList.length-1){

                this.percentageCalculate()

                let loader = this.loadingCtrl.create({
                    content: "Please wait..."
                })
                loader.present()

                this.thisService.sendCheckSheet(this.savedAnswerList)
                .subscribe((res)=>{
                    loader.dismiss()
                    console.log('sendCheckSheet succ:', res)
                    alert(res.text)
                    this.sendUploadPhoto(res.result[0])
                    this.navCtrl.pop()
                },(err)=>{
                    loader.dismiss()
                    console.log('sendCheckSheet err:', err)
                    alert(err)
                })
            }else{
                this.setQuestion(
                    nextQuestionIndex,
                    this.questionList[nextQuestionIndex].chk_id,
                    this.questionList[nextQuestionIndex].chk_options.chk_type,
                    this.questionList[nextQuestionIndex].chk_desc,
                    this.questionList[nextQuestionIndex].chk_options.chk_options
                )
            }
        })
    }

    sendUploadPhoto(resourceKey){
        this.thisService.uploadPhoto(resourceKey, this.photoList)
    }

    /**
     * savePhotoToLocal
     */
    public savePhotoToLocal(key, uri) {
        if(uri != void(0) &&
            uri != ''){

            this.photoList.push({
                key: key,
                name: uri.substr(uri.lastIndexOf('/')+1),
                uri: uri
            })
        }
    }

    /**
     * saveAnswer
     */
    private saveAnswer(answerType) {

        if(answerType == 'choice'){
            let val = 0
            let note = ''

            if(this.isDefect){
                val = 0
                note = 'Defect'
                this.countFail(true, 1)
            }else{
                val = 1
                note = 'No Defect'
            }

            let item:SavedAnswerListInterface = {
                critical: true,
                title: note,
                movement_id: this.movement_id,
                vehicle_id: this.veh_id,
                chk_id: this.chk_id,
                value: val,
                photo:[this.base64Image]
            }

            this.savePhotoToLocal(this.chk_id, this.base64Image)

            this.savedAnswerList.push(item)
        }
        if(answerType == 'multi'){
            console.log("saveAnswer multi", this.multiTypeAnswerList)

            for (var i = 0 ; i < this.multiTypeAnswerList.length; i++) {

                let mItem = this.multiTypeAnswerList[i].option[0]

                if (mItem.check == true) {
                    let item:SavedAnswerListInterface = {
                        critical: mItem.critical,
                        title: mItem.name,
                        movement_id: this.movement_id,
                        vehicle_id: this.veh_id,
                        chk_id: this.chk_id,
                        value: 0,
                        photo:[this.base64Image]
                    }
                    this.savePhotoToLocal(this.chk_id, this.base64Image)
                    this.savedAnswerList.push(item)
                    this.countFail(item.critical, 1)
                }
            }
        }
        if(answerType == 'radio'){
            console.log("saveAnswer radio", this.radioTypeAnswerList, "this.isFollowUp: "+this.isFollowUp, 'this.radioIndex: '+this.radioIndex)
            let radioItem = this.radioTypeAnswerList[this.radioIndex].option[0]
            let value = 0
            let cri_fail = false

            if(this.isFollowUp){
                if(radioItem.critical == 'pass' || radioItem.critical == 'true' || radioItem.critical == true){ cri_fail = true }
                else{ cri_fail = false }
                this.countFail(cri_fail, 1)

            }else{
                if(radioItem.critical == 'pass' || radioItem.critical == 'true' || radioItem.critical == true){
                    value = 1
                    cri_fail = true
                }
                else{
                    value = 0
                    this.countFail(false, 1)
                }
            }

            let item:SavedAnswerListInterface = {
                critical: cri_fail,
                title: radioItem.name,
                movement_id: this.movement_id,
                vehicle_id: this.veh_id,
                chk_id: this.chk_id,
                value: value,
                photo:[this.base64Image]
            }
            this.savePhotoToLocal(this.chk_id, this.base64Image)
            this.savedAnswerList.push(item)
        }

        if(answerType == 'number'){

            let item:SavedAnswerListInterface = {
                critical: false,
                title: this.updateNumberValue,
                movement_id: this.movement_id,
                vehicle_id: this.veh_id,
                chk_id: this.chk_id,
                value: 1,
                photo:[this.base64Image]
            }
            this.savePhotoToLocal(this.chk_id, this.base64Image)
            this.savedAnswerList.push(item)
        }

        console.log("this.savedAnswerList", this.savedAnswerList)
        this.base64Image = ''
        this.isFollowUp = false
        this.isDefect = false
    }

    /**
     * takePhoto
     */
    private takePhoto() {

        const options: CameraOptions = {
            quality: 100,
            targetHeight: 300,
            targetWidth: 300,
            destinationType: this.camera.DestinationType.FILE_URI,
            // In this app, dynamically set the picture source, Camera or photo gallery
            sourceType: this.camera.PictureSourceType.CAMERA,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            saveToPhotoAlbum: true,
            correctOrientation: true  //Corrects Android orientation quirks
        }

        this.camera.getPicture(options).then((imageData) => {
            // imageData is either a base64 encoded string or a file URI
            // If it's base64:
            this._ngZone.run(()=>{
                this.base64Image = imageData
                console.log("takePhoto succ:", imageData)
            })
        }, (err) => {
            // Handle error
            console.log("takePhoto err:", err)
        })
    }

    private back() {
        this.type = this.prevTab
    }

    /**
     * defect
     */
    private defect( questionIndex ) {
        this._ngZone.run(()=>{
            this.isDefect = true
            let follow_up = this.questionList[questionIndex].chk_options.chk_options[1].option[0].follow_up
            let isTakePhoto = this.questionList[questionIndex].chk_options.chk_options[1].option[0].take_photo
            console.log('follow_up', follow_up)

            if (follow_up != void(0) &&
                follow_up.length > 0) {

                this.isFollowUp = true
                this.type = follow_up[0].chk_type
                this.followUpOptions = follow_up[0].chk_options
                // console.log(follow_up[0])
                if(this.type == 'multi'){
                    this.setMultiType( this.followUpOptions )
                }
                if(this.type == 'radio'){
                    this.setRadioType( this.followUpOptions )
                }

                this.prevTab = this.type

                if(isTakePhoto){
                    this.type = 'photo'
                }
            }

            if(this.type == 'choice'){
                this.submit(questionIndex, 'choice')
            }
        })
    }
     /**
     * MultiType
     */
    private setMultiType( answerList ){
        this._ngZone.run(()=>{
            this.multiTypeAnswerList = answerList
            for(let i = 0; i < this.multiTypeAnswerList.length; i++){
                this.multiTypeAnswerList[i].option[0].check = false
            }
        })
    }

    private updateMultiAnswerValue( index, item ){
        console.log('updateMultiAnswerValue', index, item)
    }

    private cancelMulti(){
        // this._ngZone.run(()=>{

            for(let i = 0; i < this.multiTypeAnswerList.length; i++){
                this.multiTypeAnswerList[i].option[0].check = false
            }

            let prev = this.prevQuestionIndex()
            // let savedAnswerSize = this.savedAnswerList.length
            // if(savedAnswerSize > 0) {
            //   for (let i = savedAnswerSize-1; i >= 0; i--) {
            //       console.log(i , prev)
            //       if (this.savedAnswerList[i].chk_id == this.questionList[prev].chk_id) {
            //           // COUNT FAIL
            //           console.log('before cancel' , this.savedAnswerList)
            //           this.countFail(this.savedAnswerList[i].critical, -1)
            //           this.savedAnswerList.pop()
            //           console.log('after cancel' , this.savedAnswerList)
            //       }
            //   }
            // }

            // console.log('cancel multi this.savedAnswerList', this.savedAnswerList)

            this.isFollowUp = false
            this.isDefect = false

            this.setQuestion(
                prev,
                this.questionList[prev].chk_id,
                this.questionList[prev].chk_options.chk_type,
                this.questionList[prev].chk_desc,
                this.questionList[prev].chk_options.chk_options
            )
            // this.percentageCalculate()

        // })
    }

    /**
     * Radio
     */
    private setRadioType( answerList ) {
        this._ngZone.run(()=>{
            this.radioIndex = null
            this.radioTypeAnswerList = answerList
        })
    }

    /**
     * updateRadioAnswerValue
     */
    private updateRadioAnswerValue( index, item ){
        console.log('updateRadioAnswerValue', index, item)
        this.radioIndex = index

    }

    /**
     * cancelRadio
     */
    private cancelRadio() {
        // this._ngZone.run(()=>{
            this.radioValue = ""
            this.radioTypeAnswerList = []

             // COUNT FAIL
            //  if(this.savedAnswerList.length > 0) {
            //   this.countFail(this.savedAnswerList[this.savedAnswerList.length-1].critical, -1)
            //   this.savedAnswerList.pop()
            //  }

            console.log('save answer' , this.savedAnswerList)
            let prev = this.prevQuestionIndex() || 0

            this.setQuestion(
                prev,
                this.questionList[prev].chk_id,
                this.questionList[prev].chk_options.chk_type,
                this.questionList[prev].chk_desc,
                this.questionList[prev].chk_options.chk_options
            )
            // this.percentageCalculate()
        // })
    }

    private isMultiHasChecked(){
        let isChecked = false
        for (let i = 0; i < this.multiTypeAnswerList.length; i++) {
            let item = this.multiTypeAnswerList[i]
            if(item.option[0].check == true){
                isChecked = true
            }
        }
        return isChecked
    }

    private prevQuestionIndex() {
        var prev = this.currentIndexOfQuestionList
        return (prev < 0) ? 0 :  prev
    }

    private countFail( failType, amount ){
        if(failType == true){ // Minor
            this.minorFail = this.minorFail + amount
        }
        if(failType == false){ // Major
            this.majorFail = this.majorFail + amount
        }

        if(this.minorFail < 0){
            this.minorFail = 0
        }
        if(this.majorFail < 0){
            this.majorFail = 0
        }

    }

}
