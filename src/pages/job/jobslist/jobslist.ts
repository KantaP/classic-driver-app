import { ViewJobService } from './viewjob/viewjob.service';
import { RequestProvider } from './../../../providers/request/request';
import { DataStorage } from './../../util/storage';

import { GlobalProvider } from './../../../providers/global/global';
import { ViewJobPage } from './viewjob/viewjob'
import { JobsListInterface } from './../../util/model/jobList.interface'
import { JobsListService } from './jobslist.service'
import { Global } from './../../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController, LoadingController, normalizeURL } from 'ionic-angular'
import { MessageModal } from '../../message/modal/modal.sentmessage';

@Component({
  selector: 'page-jobslist',
  templateUrl: 'jobslist.html',
  providers: [JobsListService],
})

export class JobsListPage {

  jobs: Array<JobsListInterface> = []
  jobsShow: Array<JobsListInterface> = []
  loading: boolean = true
  startIndex: number = 0
  endIndex: number = 4

  constructor(
    public navCtrl: NavController,
    private _ngZone: NgZone,
    private modalCtrl: ModalController,
    private events: Events,
    private jobsListService: JobsListService,
    private global: GlobalProvider,
    private store: DataStorage,
    private loadCtrl: LoadingController,
    private request: RequestProvider,
    private dataStorage: DataStorage,
    private viewJobService: ViewJobService
  ) {
    Global.setGlobal('quote_id', 0)
  }

  ngAfterViewInit() {
    this.getJobs()
  }

  getJobs() {
    console.log('test')
    this.jobsListService.requestJobs()
      .toPromise()
      .then((res) => {
        console.log('getJobs res:', res)
        this.jobsShow = res.result
        this.store.addLogData('jobs_cache', res.result)
        this.jobs = this.jobsShow.slice(this.startIndex, this.endIndex).map((item) => item)
        this.loading = false
        this.startIndex = this.endIndex
        this.endIndex += 4
        // this._ngZone.run(()=>{
        // let re:Array<JobsListInterface> = res.result
        // let latestQuoteBuffer = 0

        // for (let i in re) {
        //     if (re[i].quote_id != latestQuoteBuffer) {
        //         this.jobs.push(re[i])
        //         latestQuoteBuffer = re[i].quote_id
        //     }
        // }
        // don't know why always add blank array in last index
        // this.jobs.pop()
        // console.log(this.jobs)
        // this.loading = false
        // })
      })
      .catch((err) => {
        console.log('getJobs err:', err)
        console.log('load data from cache')
        this.store.getLogDataPromise('jobs_cache')
          .then((data) => {
            if (data != null) {
              this.jobsShow = data
              this.jobs = this.jobsShow.slice(this.startIndex, this.endIndex).map((item) => item)
              this.startIndex = this.endIndex
              this.endIndex += 4
            } else {
              console.log("do not have data in cache")
              this.jobs = []
              this.jobsShow = []
            }
            this.loading = false
          })

      })
  }

  callbackForUpdate(needUpdate: boolean, _param?: any) {
    return new Promise((resolve, reject) => {
      if (needUpdate) this.getJobs()
    })

  }

  loadAllPassengers(job: any) {
    return new Promise(async (resolve, reject) => {
      this.request.getAllPassengerInJob(job.quote_id)
        .toPromise()
        .then((data) => {
          if (data.results.length > 0) {
            data.results = data.results.map((item) => {
              if (item.photo == "") item.photo = normalizeURL("assets/img/nouser.png")
              item.fromOtherRoute = true
              return item
            })
            this.dataStorage.addLogData('passengers_' + job.quote_id + '_' + Global.getGlobal('driver_id'), data.results)
          } else {
            this.dataStorage.addLogData('passengers_' + job.quote_id + '_' + Global.getGlobal('driver_id'), [])
          }
          resolve()
        })
        .catch((err) => {
          console.log(err)
          resolve()
        })
    })
  }

  getJob(quote_id) {
    return new Promise(async (resolve, reject) => {
      try {
        var jobResult = await this.viewJobService.requestJobs(quote_id).toPromise()
        if (jobResult.code == 2) {
          this.dataStorage.addLogData('job_' + quote_id + '_cache', jobResult.result)
          try {
            var progressResult = await this.request.getJourneyProgress(quote_id).toPromise()
            this.dataStorage.addLogData('journey_progress_' + quote_id + '_cache', progressResult.results)
          } catch (err) {
            this.dataStorage.addLogData('journey_progress_' + quote_id + '_cache', [])
          }
        } else {
          this.dataStorage.addLogData('job_' + quote_id + '_cache', [])
        }
        resolve()
      } catch (err) {
        console.log(err)
        resolve()
      }
    })
  }

  getOtherJob(quote_id: number) {
    return new Promise(async (resolve, reject) => {
      try {
        var otherJobs = await this.viewJobService.requestOtherJob(quote_id).toPromise()
        if (otherJobs.code == 2) {
          this.dataStorage.addLogData('other_' + quote_id + '_cache', otherJobs.result)
        } else {
          this.dataStorage.addLogData('other_' + quote_id + '_cache', [])
        }
        resolve()
      } catch (err) {
        console.log(err)
        resolve()
      }
    })
  }

  openViewJob(job) {
    console.log(job)
    var loader = this.loadCtrl.create({
      content: '',
      duration: 10000
    })
    loader.present()
    var promiseLoad = []
    promiseLoad.push(this.getJob(job.quote_id))
    promiseLoad.push(this.getOtherJob(job.quote_id))
    promiseLoad.push(this.loadAllPassengers(job))

    Promise.all(promiseLoad)
      .then((data: any) => {
        this.navCtrl.push(ViewJobPage, { data: job, callback: this.callbackForUpdate.bind(this) })
        loader.dismiss()
      })
      .catch((err) => {
        loader.dismiss()
        let modal = this.modalCtrl.create(MessageModal, {txt:this.global.translate("Please try again")}, {enableBackdropDismiss: false, cssClass: 'modal-signoutvehicle-wrapper modal-message-custom'})
        modal.present()
      })

  }

  onScrollDown(infiniteScroll) {
    if (this.jobsShow.length != this.jobs.length) {
      this.loading = true
      this.jobs = this.jobs.concat(this.jobsShow.slice(this.startIndex, this.endIndex).map((item) => item))
      this.startIndex = this.endIndex
      this.endIndex += 4
      this.loading = false
      infiniteScroll.complete()
    }
  }


}
