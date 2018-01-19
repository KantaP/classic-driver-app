import { GlobalProvider } from './../../../providers/global/global';
import { ViewJobPage } from './viewjob/viewjob'
import { JobsListInterface } from './../../util/model/jobList.interface'
import { JobsListService } from './jobslist.service'
import { Global } from './../../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController } from 'ionic-angular'

@Component({
    selector: 'page-jobslist',
    templateUrl: 'jobslist.html',
    providers: [JobsListService]
})

export class JobsListPage {

    jobs: Array<JobsListInterface> = []
    loading:boolean = true

    constructor(
        public navCtrl: NavController,
        private _ngZone: NgZone,
        private modalCtrl: ModalController,
        private events: Events,
        private jobsListService: JobsListService,
        private global: GlobalProvider
    ) {
        this.getJobs()
    }

    getJobs(){
        this.jobsListService.requestJobs()
        .subscribe((res)=>{
            console.log('getJobs res:', res)
            this._ngZone.run(()=>{
                let re:Array<JobsListInterface> = res.result
                let latestQuoteBuffer = 0

                for (let i in re) {
                    if (re[i].quote_id != latestQuoteBuffer) {
                        this.jobs.push(re[i])
                        latestQuoteBuffer = re[i].quote_id
                    }
                }
                // don't know why always add blank array in last index
                this.jobs.pop()
                // console.log(this.jobs)
                this.loading = false
            })
        },
        (err)=>{
            console.log('getJobs err:', err)
             this._ngZone.run(()=>{
                 this.loading = false
             })
        })
    }

    callbackForUpdate(needUpdate: boolean, _param?: any) {
      return new Promise((resolve, reject) => {
        if(needUpdate) this.getJobs()
      })

    }

    openViewJob(job){
      console.log(job)
        this.navCtrl.push(ViewJobPage, {data: job, callback: this.callbackForUpdate.bind(this)})
    }
}
