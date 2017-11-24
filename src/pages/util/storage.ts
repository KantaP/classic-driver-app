import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject  } from '@ionic-native/sqlite'
import { CompanyModel  } from './model/company'
import { Observable } from "rxjs/Observable"
import moment from 'moment'
import { Global } from '../util/global';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core'



class ReplicaSQL {
  public rows: any
  constructor(data: Array<any> = []) {
    Array.prototype['item'] = this._item.bind(this)
    this.rows = Object.create(Array.prototype)
    this.rows = (data == null) ? [] : data
   }

  public _item(index) {
    return this.rows[index]
  }
}

@Injectable()
export class DataStorage{
    private sqlstorage: any
    private db: SQLiteObject

    constructor(private platform: Platform, private _storage: Storage , private _sqlLite: SQLite) {
        // if(this.platform.is('cordova')) {
        //   this.sqlstorage = this._sqlLite
        //   this.createDataBase()
        // }else{
          this.sqlstorage = this._storage
        // }

    }
    // OPEN DATABASE ------------------
    public createDataBase(){
        if(this.platform.is('cordova')) {
          this.sqlstorage.create({name: "classic_driver_app_newgen.db", location: "default"}).then((db: SQLiteObject) => {
              console.log("opened DataBase !!")
              this.createCompanyTables(db)
              this.createLogTables(db)
              this.createLastLoginTables(db)
          }, (err) => {
            console.log("!!! ", err)
          });
        }
    }

    public openDatabase():Observable<Comment>{
        if(this.platform.is('cordova')) {
          return Observable.create( observer =>{
              this.sqlstorage.create({name: "classic_driver_app_newgen.db", location: "default"})
              .then((sqliteObject: SQLiteObject) => {

                  this.db = sqliteObject
                  observer.next(this.db)
              },
              (err) => {
                  console.log("!!! openDatabase", err)
                  observer.error(err)
              });
          })
        }
    }

    // CREATE TABLE ------------------
    public createCompanyTables(db){
      if(this.platform.is('cordova')) {
        db.executeSql(`CREATE TABLE IF NOT EXISTS company_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            comp_name TEXT,
            comp_code TEXT,
            driver_id TEXT,
            driver_username TEXT,
            driver_password TEXT)`, {})
      }
    }

    public createLogTables(db){
      if(this.platform.is('cordova')) {
          db.executeSql(`CREATE TABLE IF NOT EXISTS log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT,
            value TEXT)`, {})
      }
    }

    public createLastLoginTables(db){
      if(this.platform.is('cordova')) {
        db.executeSql(`CREATE TABLE IF NOT EXISTS last_login (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          driver_id int,
          datetime datetime)`, {})
      }
    }

    // LAST LOGIN ----------------
    public addLastLogin(){
      // if(this.platform.is('cordova')) {
      //   let sql = "INSERT INTO last_login (driver_id, datetime)" +" VALUES(?, ?)"
      //   let driver_id = Global.getGlobal('driver_id')
      //   let datetime = moment().format("YYYY-MM-DD HH:mm:ss")
      //   console.log("addLastLogin datetime", datetime)
      //   return Observable.create((observer)=>{
      //       this.openDatabase().subscribe(
      //           (next)=>{
      //               //console.log("addLastLogin next:")
      //               this.db.transaction((tx)=>{
      //                   tx.executeSql(sql , [driver_id, datetime],
      //                       (tx, rs)=>{
      //                           //console.log("transaction succ: ", rs)
      //                           observer.next(rs)
      //                       },
      //                       (tx, err)=>{
      //                           //console.log("transaction err: ", err)
      //                           observer.error(err)
      //                       }
      //                   )
      //               })
      //           },
      //           (err)=>{
      //               //console.log("addLastLogin err:", err)
      //               observer.error(err)
      //           }
      //       )
      //   })
      // }else{
        return Observable.create((observer)=>{
          this.sqlstorage.get('lastLogin')
          .then((data)=>{
            var loginLogs = new ReplicaSQL(data)
            loginLogs.rows.push({driver_id: Global.getGlobal('driver_id'),datetime:moment().format("YYYY-MM-DD HH:mm:ss")})
            console.log('add login log' , loginLogs.rows)
            this.sqlstorage.set('lastLogin', loginLogs.rows)
            .then(()=>{observer.next(true)})
          })

        })
      // }
    }

    public getLastLogin(driver_id){
        // if(this.platform.is('cordova')) {
        //   let where = ''
        //   if(driver_id != void(0) && driver_id != ''){
        //       where = " WHERE driver_id = " + driver_id + " ORDER BY datetime DESC LIMIT 0,1"
        //   }
        //   let sql = "SELECT * FROM last_login" + where
        //   return Observable.create((observer)=>{
        //       this.openDatabase().subscribe(
        //           (next)=>{
        //               //console.log("getLastLogin next:")
        //               this.db.transaction((tx)=>{
        //                   tx.executeSql(sql , [],
        //                       (tx, rs)=>{
        //                           //console.log("transaction succ: ", rs)
        //                           observer.next(rs)
        //                       },
        //                       (tx, err)=>{
        //                           //console.log("transaction err: ", err)
        //                           observer.error(err)
        //                       }
        //                   )
        //               })
        //           },
        //           (err)=>{
        //               //console.log("getLastLogin err:", err)
        //               observer.error(err)
        //           }
        //       )
        //   })
        // }else{
          return Observable.create((observer)=>{
            this.sqlstorage.get('lastLogin')
            .then((data)=>{
              var loginLogs = new ReplicaSQL(data)
              console.log('get login log:' , loginLogs)
              if(!driver_id){
                observer.next(loginLogs)
              }else{
                loginLogs.rows = loginLogs.rows.filter((item)=>item.driver_id == driver_id)
                if(loginLogs.rows.length > 0) {
                  loginLogs.rows = loginLogs.rows.reverse()
                }
                observer.next(loginLogs)
              }
            })
            .catch((err)=>{
              observer.error(err)
            })
          })
        // }
    }


    // COMPANY DATA ------------------

    public addCompanyData(company:CompanyModel) {

        // console.log("addCompanyData", company.comp_name, company.comp_code, company.driver_id, company.driver_username, company.driver_password)
        // if(this.platform.is('cordova')) {
        //   let sql = "INSERT INTO company_data (comp_name, comp_code, driver_id, driver_username, driver_password)"+" VALUES (?, ?, ?, ?, ?)"
        //     return Observable.create((observer)=>{
        //       this.openDatabase().subscribe(
        //         (next)=>{
        //           //console.log("addCompanyData next:")
        //           this.db.transaction((tx)=>{
        //               tx.executeSql(sql , [company.comp_name, company.comp_code, company.driver_id, company.driver_username, company.driver_password],
        //                   (tx, rs)=>{
        //                       //console.log("transaction succ: ", rs)
        //                       observer.next(rs)
        //                   },
        //                   (tx, err)=>{
        //                       //console.log("transaction err: ", err)
        //                       observer.error(err)
        //                   }
        //               )
        //           })
        //         },
        //         (err)=>{
        //           //console.log("addCompanyData err:", err)
        //           observer.error(err)
        //         }
        //       )
        //     })
        // }else{
          return Observable.create((observer)=> {
            this.sqlstorage.get('company')
            .then((data)=>{
              var companies = new ReplicaSQL(data)
              companies.rows.push(company)
              console.log('add company' , companies.rows)
              this.sqlstorage.set('company', companies.rows)
              .then(()=>{observer.next(true)})
            })
          })
        // }
    }

    public getCompanyData(comp_code?){

        // if(this.platform.is('cordova')) {
        //   let sqlCondition = ""
        //   if(comp_code != void(0) && comp_code != ''){
        //       sqlCondition = " WHERE comp_code = " + comp_code
        //   }
        //   let sql = 'SELECT * FROM company_data' + sqlCondition
        //   console.log(sql)
        //   return Observable.create((observer)=>{
        //       this.openDatabase().subscribe(
        //           (next)=>{
        //               //console.log("getCompanyData next:")
        //               this.db.transaction((tx)=>{
        //                   tx.executeSql(sql , [],
        //                       (tx, rs)=>{
        //                           console.log("SELECT succ: ", tx, rs)
        //                           observer.next(rs)
        //                       },
        //                       (tx, err)=>{
        //                           console.log("SELECT err: ", tx, err)
        //                           observer.error(err)
        //                       }
        //                   )
        //               })
        //           },
        //           (err)=>{
        //               //console.log("getCompanyData err:", err)
        //               observer.error(err)
        //           }
        //       )
        //   })
        // }else{
          return Observable.create((observer)=>{
            console.log('Get company: ' +comp_code)
            this.sqlstorage.get('company')
            .then((data)=>{
              var companies = new ReplicaSQL(data)
              console.log('get company data:' , companies)
              if(!comp_code){
                observer.next(companies)
              }else{
                companies.rows = companies.rows.filter((item)=>item.comp_code == comp_code)
                observer.next(companies)
              }
            })
            .catch((err)=>{
              observer.error(err)
            })

          })
        // }

    }

    public clearCompanyDB(comp_code){
      //   if(this.platform.is('cordova')){
      //     this.openDatabase().subscribe(
      //           (next)=>{
      //               console.log("clearCompanyDB next:")
      //               this.db.transaction((tx)=>{
      //                 tx.executeSql('DELETE FROM company_data WHERE comp_code = ?' , [comp_code],
      //                     (tx, rs)=>{ console.log("DELETE succ: ", rs) },
      //                     (tx, err)=>{ console.log("DELETE err: ", err) }
      //                 )
      //               }).then((succ)=>{
      //                   console.log("transaction succ: ", succ)
      //               })
      //               .catch((err)=>{
      //                 console.log("transaction err: ", err)
      //               })
      //           },
      //           (err)=>{
      //             console.log("clearCompanyDB err:", err)
      //           }
      //     )
      // }else{
        this.sqlstorage.get('company')
        .then((data)=>{
          var companies = new ReplicaSQL(data)
          console.log('Delete company: ' , comp_code)
          companies.rows = companies.rows.filter((item)=>item.comp_code != comp_code)
          this.sqlstorage.set('company',companies.rows)
        })
      // }


    }

    // LOG DATA ------------------

    public addLogData(key, value) {

        //  if(this.platform.is('cordova')) {
        //     this.openDatabase().subscribe(
        //         (next)=>{
        //             console.log("addLogData next:" , key, value)
        //             this.db.transaction((tx)=>{
        //               tx.executeSql('DELETE FROM log WHERE key = ?' , [key],
        //                   (tx, rs)=>{ console.log("DELETE  "+key+" succ: ", rs) },
        //                   (tx, err)=>{ console.log("DELETE  "+key+" err: ", err) }
        //               )

        //               tx.executeSql("INSERT INTO log (key, value) VALUES (?, ?)", [key, value],
        //                   (tx, rs)=>{ console.log("INSERT "+key+"succ: ", rs) },
        //                   (tx, err)=>{ console.log("INSERT  "+key+" err: ", err) }
        //               )
        //             }).then((succ)=>{
        //               console.log("addLogData transaction succ: ", succ)
        //             })
        //             .catch((err)=>{
        //               console.log("addLogData transaction err: ", err)
        //             })
        //         },
        //         (err)=>{
        //           console.log("addLogData err:", err)
        //         }
        //     )
        //  }else{
           this.sqlstorage.set('log_'+key,value)
        //  }

    }

    public getLogData(key?: string): Observable<any>{

        // if(this.platform.is('cordova')) {

        //   return Observable.create((observer)=>{
        //     if(key != void(0) || key != ''){
        //       key = "WHERE key = '" + key + "'"
        //   }else{
        //       key = ''
        //   }

        //   let sql = 'SELECT * FROM log '+key
        //   console.log(sql)
        //       this.openDatabase().subscribe(
        //           (next)=>{
        //               //console.log("getLogData next:")
        //               this.db.transaction((tx)=>{
        //                   tx.executeSql(sql , [],
        //                       (tx, rs)=>{
        //                           console.log("transaction succ: ", rs)
        //                           observer.next(rs)
        //                       },
        //                       (tx, err)=>{
        //                           console.log("transaction err: ", err)
        //                           observer.error(err)
        //                       }
        //                   )
        //               })
        //           },
        //           (err)=>{
        //               //console.log("getLogData err:", err)
        //               observer.error(err)
        //           }
        //       )
        //   })
        // }else{
          return Observable.create((observer)=>{
            this.sqlstorage.get('log_'+key)
            .then((data)=>{
              if(typeof data != 'object') data = [data]
              var logInfo = new ReplicaSQL(data)
              observer.next(logInfo)
            })
            .catch((err)=>{
              observer.error(err)
            })
          })
        // }
    }


    public clearLogDB(key){
        // if(this.platform.is('cordova')) {
        //   this.openDatabase().subscribe(
        //         (next)=>{
        //             console.log("clearLogDB next:")
        //             this.db.transaction((tx)=>{
        //               tx.executeSql('DELETE FROM log WHERE key = ?' , [key],
        //                   (tx, rs)=>{ console.log("DELETE succ: ", rs) },
        //                   (tx, err)=>{ console.log("DELETE err: ", err) }
        //               )
        //             }).then((succ)=>{
        //                 console.log("transaction succ: ", succ)
        //             })
        //             .catch((err)=>{
        //               console.log("transaction err: ", err)
        //             })
        //         },
        //         (err)=>{
        //           console.log("clearLogDB err:", err)
        //         }
        //   )
        // }else{
          this.sqlstorage.remove('log_'+key)
        // }

    }

    public getLangPack(lang: string): Promise<any> {
      return this.sqlstorage.get('lang_'+lang)
    }

    public setLangPack(lang: string, data: any) {
      this.sqlstorage.set('lang_'+lang,data)
    }

    public getLangDefault(): Promise<any> {
      return this.sqlstorage.get('lang_default')
    }

    public setLangDefault(lang: string) {
      this.sqlstorage.set('lang_default' , lang)
    }
}
