import { SummaryItemInterface } from './../../util/model/summary.interface';
import { JobsSummaryService } from './jobssummary.service'
import { Global } from './../../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController } from 'ionic-angular'

interface dateType {
  start?: string;
  end?: string;
}

@Component({
  selector: 'page-jobssummary',
  templateUrl: 'jobssummary.html',
  providers: [JobsSummaryService]
})

export class JobsSummaryPage {
  date: dateType
  loading: boolean = false
  shownGroup = null
  uniqueId: number = 0
  summaryList: Array<SummaryItemInterface> = []
  itemsGroup: Array<{
    date: string,
    item: Array<SummaryItemInterface>
  }> = []

  constructor(
    public navCtrl: NavController,
    private _ngZone: NgZone,
    private modalCtrl: ModalController,
    private events: Events,
    private jobsSummaryService: JobsSummaryService
  ) {
    this.date = {
      start: '',
      end: ''
    }
  }

  splitIitem(item:string) {
    if(item.includes(',')){
      return item.split(',')[0]
    }else{
      item
    }
  }

  ifStartEmtpy(){
    if(this.date.start == '') return true
    else return false
  }

  getSummaryList() {
    this.loading = true
    this.itemsGroup = []
    this.jobsSummaryService.requestJobsSummary(this.date)
      .subscribe((res) => {
        this._ngZone.run(() => {
          console.log('getSummaryList succ', res)

          let re = res.result
          let latestDateBuffer = ''

          if (re.length > 0) {
            for (let i in re) {
              if (re[i].date_start_convert !== latestDateBuffer) {
                let arrBuffer = []
                arrBuffer = arrBuffer.concat(
                  re
                    .filter((item) => item.date_start_convert == re[i].date_start_convert)
                    .map((item) => {
                      let s: SummaryItemInterface = {
                        uid: this.uniqueId,
                        time_depart: item.time_departure,
                        time_pickup: item.time_start_convert,
                        time_arrival: item.time_departure,
                        time_finish: item.time_finish,
                        time_leave: '',
                        size: item.time_departure,
                        name_bus: (item.vehicle_reg == null ? '' : item.vehicle_reg),
                        name_pickup: item.col_address,
                        name_destination: item.des_address,
                        note_pickup: item.mov_col_note,
                        note_des: item.mov_des_note
                      }
                      this.uniqueId++
                      return s
                    })
                )
                this.itemsGroup.push({
                  date: re[i].date_start_convert,
                  item: arrBuffer
                })
                latestDateBuffer = re[i].date_start_convert
              }
            }
            // this.itemsGroup.pop()
          }
          this.loading = false
          console.log('this.itemsGroup', this.itemsGroup)
        })
      }, (err) => {
        console.log('getSummaryList err:', err)
        this.loading = false
      })
  }

  toggleGroup(group) {
    if (this.isGroupShown(group)) {
      this.shownGroup = null
    } else {
      this.shownGroup = group
    }
  }

  isGroupShown(group) {
    return this.shownGroup === group
  }

  dateStartChange() {
    this.date.end = this.date.start
  }

  dateEndChange() {
    this.getSummaryList()
  }


}
