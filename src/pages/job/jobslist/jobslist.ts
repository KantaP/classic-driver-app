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
        private jobsListService: JobsListService
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

                console.log(this.jobs)
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

    openViewJob(qid){
        this.navCtrl.push(ViewJobPage, {data: qid})
    }
}