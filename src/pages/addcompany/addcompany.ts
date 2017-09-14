import { Global } from './../util/global'

import { LoginService } from '../login/login.service'
import { Component, NgZone } from '@angular/core'
import { DataStorage } from '../util/storage'
import{ ViewController, Events } from 'ionic-angular'
import { CompanyModel } from '../util/model/company'

@Component({
  selector: 'modal-addcompany',
  templateUrl: 'modal.addcompany.html',
  providers: [LoginService]
})

export class AddCompany{

  found_company: boolean = false
  company_name = "Company Name"
  dataStore: DataStorage
  next: boolean = false
  eleRef: Element
  
  constructor(
    private viewCtrl: ViewController,
    private loginService: LoginService,
    public events: Events,
    private _ngZone: NgZone
    ){
      this.dataStore = new DataStorage()
      
  }

  ngAfterViewInit() {
    this.eleRef = document.getElementsByClassName('modal-wrapper').item(0)
    this.eleRef.classList.add('modal-fix-h170')
  }

  public closeModal(){
    this.viewCtrl.dismiss();
  }

  private findCompany(code){
    console.log(code)
    if(code == void(0) || code == ""){
      alert("Please fill input form.")
      return
    }

    this.loginService.requestSiteURL(code)
    .subscribe((res)=>{
      console.log(res)
      this._ngZone.run(()=>{
        if(res.code == 2){
          this.found_company = true
          this.company_name = res.name
        }
      })    
    }, (err)=>{
      console.log(err)
      alert('Cann\'t connect server.')
    })
    
  }

  private expandBox(){
    this.eleRef.classList.remove('modal-fix-h170')
    this.eleRef.classList.add('modal-fix-h270')
  }

  private apply(c_name, code, driver_id, username, password){
    
    let comp_model = new CompanyModel(c_name, code, driver_id, username, password)
    
    this.dataStore.addCompanyData(comp_model)
    .subscribe((data)=>{
      console.log('addCompanyData succ:', data)
      this.events.publish('company:added')
      this.closeModal()
    }, (err)=>{
      console.log('addCompanyData err:', err)
      this.events.publish('company:added', err)
      this.closeModal()
    })


  }

}