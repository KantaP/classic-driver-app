import { SummaryItemInterface } from './../../util/model/summary.interface';
import { JobsSummaryService } from './jobssummary.service'
import { Global } from './../../util/global'
import { Component, NgZone } from '@angular/core'
import { NavController, Events, ModalController } from 'ionic-angular'

@Component({
    selector: 'page-jobssummary',
    templateUrl: 'jobssummary.html',
    providers: [JobsSummaryService]
})

export class JobsSummaryPage {
    date = {
        start: '',
        end:''
    }
    loading:boolean = false
    shownGroup = null
    uniqueId:number = 0
    summaryList: Array<SummaryItemInterface> = []
    itemsGroup:Array<{
        date: string, 
        item:Array<SummaryItemInterface>
    }> = []

    constructor(
        public navCtrl: NavController,
        private _ngZone: NgZone,
        private modalCtrl: ModalController,
        private events: Events,
        private jobsSummaryService: JobsSummaryService
    ) {
        
    }

    getSummaryList(){
        this.loading = true

        this.jobsSummaryService.requestJobsSummary(this.date)
        .subscribe((res)=>{
            this._ngZone.run(()=>{
                console.log('getSummaryList succ', res)

                let re = res.result
                let latestDateBuffer = ''
                let arrBuffer = []

                for (let i in re) {
                    if(re[i].date_start_convert !== latestDateBuffer){

                        arrBuffer = []

                        for (let j in re) {
                            if (re[i].date_start_convert === re[j].date_start_convert) {
                                let s:SummaryItemInterface = {
                                    uid: this.uniqueId,
                                    time_depart: re[j].time_departure,
                                    time_pickup: re[j].time_start_convert,
                                    time_arrival: re[j].time_departure,
                                    time_finish: re[j].time_finish,
                                    time_leave: '',
                                    size: re[j].time_departure,
                                    name_bus: (re[j].vehicle_reg == null ? '':re[j].vehicle_reg),
                                    name_pickup: re[j].col_address,
                                    name_destination: re[j].des_address,
                                    note_pickup: re[j].mov_col_note,
                                    note_des: re[j].mov_des_note
                                } 
                                this.uniqueId++
                                arrBuffer.push(s)
                            }
                        }

                        this.itemsGroup.push({
                            date: re[i].date_start_convert,
                            item: arrBuffer
                        })

                        latestDateBuffer = re[i].date_start_convert 
                    }
                }

                this.loading = false
                
                console.log('this.itemsGroup', this.itemsGroup)
            })
        },(err)=>{
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

    dateStartChange(){
        this.date.end = this.date.start
    }

    dateEndChange(){
        this.getSummaryList()
    }
    

}