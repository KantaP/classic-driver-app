
import { RequestProvider } from './../../providers/request/request';
import { LoginService } from './login.service'
import { Component, NgZone } from '@angular/core'
import { IonicPage, NavController, MenuController, Platform , NavParams, ModalController, ViewController, Events, LoadingController, normalizeURL } from 'ionic-angular'
import { Http, Headers } from '@angular/http'
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { HomePage } from '../home/home'
import { DataStorage } from '../util/storage'
import { CompanyModel } from '../util/model/company'
import { Global } from '../util/global'
import { AddCompany } from '../addcompany/addcompany'
import { Network } from '@ionic-native/network';
import { GlobalProvider } from '../../providers/global/global';
/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [LoginService]
})
export class LoginPage {

  company_select:string = ""
  username:string = ""
  password:string = ""
  // dataStore: DataStorage
  login_box: boolean = false
  select_box: boolean = false
  add_comp_box: boolean = false
  comp_list:Array<{index:any,comp_code:string, comp_name:string, driver_u:string, driver_p:string}>

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public menuCtrl: MenuController,
    private loginService: LoginService,
    public events: Events,
    public loadingCtrl: LoadingController,
    private _ngZone: NgZone,
    private dataStore: DataStorage,
    private platform: Platform,
    private push: Push,
    private request: RequestProvider,
    private network: Network,
    private global: GlobalProvider
  ) {

    this.comp_list = [{
      index: 0,
      comp_code: "0",
      comp_name: "SELECT COMPANY",
      driver_u: "",
      driver_p: ""
    }]

    this.company_select = "0"
    this.menuCtrl.enable(false)
    // this.dataStore = new DataStorage()



    this.events.subscribe('company:added', () => {
      console.log('Welcome')
      this.getCompany()
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage')
    this.getApiKey()
    this.getCompany()
  }

  registerFCMToken() {
    const options: PushOptions = {
      android: {},
      ios: {
        alert: 'true',
        badge: false,
        sound: 'true'
      },
      windows: {}
    };
    const pushObject: PushObject = this.push.init(options);

    pushObject.on('registration').subscribe((data: any) => {
      console.log('device token -> ' + data.registrationId);
      this.savePushToken(data.registrationId)
      this.dataStore.addLogData("push_token", data.registrationId)
      //TODO - send device token to server
    });
  }

  savePushToken(token: string) {
    this.loginService.saveToken(token)
    .subscribe(
      (res)=>{
        console.log('save token result: ' , res)
      }
    )
  }

  private getApiKey(){
    this.loginService.requestApiKey()
      .subscribe( res =>{
        console.log(res);
        Global.setGlobal("api_key", res.result)
        this.dataStore.addLogData("api_key", res.result)
        console.log('Global get ',Global.getGlobal("api_key"))
      },
      err =>{
        console.log(err)
      })
  }
  private getCompany(){
    // Find all company
    this.dataStore.getCompanyData()
      .subscribe((res)=>{
        // when test on web browser
        // console.log(res)
        if(res == null) {
          res = {
            rows: []
          }
        }
        console.log("getCompany succ:", res.rows)
        this._ngZone.run(()=>{
          let items = res.rows
          // console.log(items.item(0))
          if(items.length == 0){
            this.add_comp_box = true
            this.select_box = false
            this.login_box = false
          }else if(items.length == 1){
            this.add_comp_box = false
            this.select_box = false
            this.login_box = true
            this.company_select = items.item(0).comp_code
          }else{
            // if length of items > 1
            this.add_comp_box = false
            this.select_box = true
            this.login_box = true

            this.comp_list = [{
              index: 0,
              comp_code: "0",
              comp_name: "SELECT COMPANY",
              driver_u: "",
              driver_p: ""
            }]

            for(var i = 0; i < items.length; i++){
              //console.log("items[i] :", items.item(i))
              this.comp_list.push({
                index: i+1,
                comp_code: items.item(i).comp_code,
                comp_name: items.item(i).comp_name,
                driver_u: items.item(i).driver_username,
                driver_p: items.item(i).driver_password
              })
            }
            console.log(this.comp_list)
          }
        })
      },(err)=>{
        console.log("getCompany err:", err)
        this._ngZone.run(()=>{
          this.add_comp_box = true
          this.select_box = false
          this.login_box = false
        })
      })
  }

  private showModal(){
    let modal = this.modalCtrl.create(AddCompany, "",{enableBackdropDismiss: false});
    modal.present();
  }

  private fillLoginBox(index){

    let comp = this.comp_list[index]

    this.company_select = comp.comp_code
    this.username = comp.driver_u
    this.password = comp.driver_p
  }

  private login(){
    var connection = Global.getGlobal('connection')
    // alert(connection)
    if(connection == 'none') {
      alert("Please check your internet")
      return false
    }
    //this.username = "nodev"
    //this.password = "123456"
    if(this.username == "" || this.password == ""){
      alert("Please enter Username or Password")
      return
    }

    let loader = this.loadingCtrl.create({
      content: "Please wait..."
    })
    loader.present()

    this.loginService.authen(this.username, this.password, this.company_select)
    .subscribe((res)=>{

      loader.dismiss()

      console.log("loginService", res)
      if(res.code == 2){

        Global.setGlobal("api_token", res.result)
        Global.setGlobal("driver_id", res.driver_id)
        Global.setGlobal("company_logo", res.company_logo)
        Global.setGlobal('api_site', res.apisite)
        Global.setGlobal('web_site', res.website)

        let datetimeLogin = {
          datetime: ''
        }
        this.dataStore.addLogData('auth',true)
        console.log('logged in on platform : ' + this.platform._platforms)
        if(this.platform.is('cordova')) {
          this.dataStore.getLogData('push_token')
          .subscribe((data)=>{
            if(data.rows.length == 0) {
              this.registerFCMToken()
            }
          })
        }

        this.dataStore.getLastLogin(res.driver_id)
          .subscribe((res)=>{
            console.log("getLastLogin succ:", res)
            let re = res.rows

            this.dataStore.addLastLogin()
              .subscribe(
                (res)=>{ console.log("addLastLogin succ:",res) },
                (err)=>{ console.log("addLastLogin err:",err) }
              )

            datetimeLogin.datetime = (re.item(0) == void(0) ? '':re.item(0).datetime)

            console.log('datetimeLogin', datetimeLogin)

          },(err)=>{
            console.log("getLastLogin err:", err)
            // this.navCtrl.setRoot(HomePage, datetimeLogin)
        })
        // this.dataStore.clearLogDB('AlreadyEnRoute')
        var promiseData = []

        // promiseData.push(this.request.getAllPassengerInSystemPromise())
        promiseData.push(this.request.getPassengerQuestionsPromise())
        promiseData.push(this.request.getLangPromise())
        Promise.all(promiseData)
        .then((items)=>{
          console.log(items)
          items.forEach((item,index)=>{
            var label = item.label || 'item#'+index
            // if(label == 'getAllPassengerInSystem') {
            //   item.results = item.results.map((passenger) => {
            //     if (passenger.photo == "") passenger.photo = normalizeURL("assets/img/nouser.png")
            //     passenger.fromOtherRoute = true
            //     return passenger
            //   })
            // }
            this.dataStore.clearLogDB(label)
            this.dataStore.addLogData(label,item.results)
          })
          this.dataStore.getLangDefault()
          .then((lang)=>{
            if(lang == null) {
              lang = 'TH'
            }
            this.dataStore.setLangDefault(lang)
            this.global.setLang(lang)
            this.request.getLangPack(lang)
            .subscribe((data)=>{
              this.dataStore.setLangPack(lang,{read:false,words:data.results})
              this.global.setLangPack({read:false,words:data.results})
              this.navCtrl.setRoot(HomePage, datetimeLogin)
            })
          })
        })

      }else{
        alert("Invalid Username or Password")
        return
      }
    },(err)=>{
      loader.dismiss()
      console.log("err: ",err)
    })
  }

}
