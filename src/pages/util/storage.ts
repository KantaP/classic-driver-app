import { SQLite, SQLiteObject  } from '@ionic-native/sqlite'
import { CompanyModel  } from './model/company'
import { Observable } from "rxjs/Observable"
import moment from 'moment'
import { Global } from '../util/global'

export class DataStorage{
    private sqlstorage: SQLite
    private db: SQLiteObject

    constructor() {
        this.sqlstorage = new SQLite()
        this.createDataBase()
    }
    // OPEN DATABASE ------------------
    public createDataBase(){
       
        this.sqlstorage.create({name: "classic_driver_app_newgen.db", location: "default"}).then((db: SQLiteObject) => {
            console.log("opened DataBase !!")
            this.createCompanyTables(db)
            this.createLogTables(db)
            this.createLastLoginTables(db)
        }, (err) => {
           console.log("!!! ", err)
        });
    }

    public openDatabase():Observable<Comment>{
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

    // CREATE TABLE ------------------
    public createCompanyTables(db){
       db.executeSql(`CREATE TABLE IF NOT EXISTS company_data (
           id INTEGER PRIMARY KEY AUTOINCREMENT, 
           comp_name TEXT,
           comp_code TEXT,
           driver_id TEXT,
           driver_username TEXT, 
           driver_password TEXT)`, {})
       .then(()=>{

       })        
    }

    public createLogTables(db){
       db.executeSql(`CREATE TABLE IF NOT EXISTS log (
           id INTEGER PRIMARY KEY AUTOINCREMENT, 
           key TEXT,
           value TEXT)`, {})
       .then(()=>{

       })          
    }

    public createLastLoginTables(db){
       db.executeSql(`CREATE TABLE IF NOT EXISTS last_login (
           id INTEGER PRIMARY KEY AUTOINCREMENT, 
           driver_id int,
           datetime datetime)`, {})
       .then(()=>{

       })   
    }

    // LAST LOGIN ----------------
    public addLastLogin(){
        let sql = "INSERT INTO last_login (driver_id, datetime)" + 
                " VALUES(?, ?)"
        
        let driver_id = Global.getGlobal('driver_id')
        let datetime = moment().format("YYYY-MM-DD HH:mm:ss")

        console.log("addLastLogin datetime", datetime)

        return Observable.create((observer)=>{
            this.openDatabase().subscribe(
                (next)=>{
                    //console.log("addLastLogin next:")
                    this.db.transaction((tx)=>{
                        tx.executeSql(sql , [driver_id, datetime],
                            (tx, rs)=>{ 
                                //console.log("transaction succ: ", rs) 
                                observer.next(rs)
                            },
                            (tx, err)=>{ 
                                //console.log("transaction err: ", err)
                                observer.error(err)
                            }
                        )
                    })
                },
                (err)=>{
                    //console.log("addLastLogin err:", err)
                    observer.error(err)
                }
            )   
        })   
    }

    public getLastLogin(driver_id){
        let where = ''
        if(driver_id != void(0) && driver_id != ''){
            where = " WHERE driver_id = " + driver_id + " ORDER BY datetime DESC LIMIT 0,1"
        }


        let sql = "SELECT * FROM last_login" + where
        
        return Observable.create((observer)=>{
            this.openDatabase().subscribe(
                (next)=>{
                    //console.log("getLastLogin next:")
                    this.db.transaction((tx)=>{
                        tx.executeSql(sql , [],
                            (tx, rs)=>{ 
                                //console.log("transaction succ: ", rs) 
                                observer.next(rs)
                            },
                            (tx, err)=>{ 
                                //console.log("transaction err: ", err)
                                observer.error(err)
                            }
                        )
                    })
                },
                (err)=>{
                    //console.log("getLastLogin err:", err)
                    observer.error(err)
                }
            )   
        })   
    }


    // COMPANY DATA ------------------

    public addCompanyData(company:CompanyModel) {

        console.log("addCompanyData", company.comp_name, company.comp_code, company.driver_id, company.driver_username, company.driver_password)

        let sql = "INSERT INTO company_data (comp_name, comp_code, driver_id, driver_username, driver_password)"+
                            " VALUES (?, ?, ?, ?, ?)"
        return Observable.create((observer)=>{
            this.openDatabase().subscribe(
                (next)=>{
                    //console.log("addCompanyData next:")
                    this.db.transaction((tx)=>{
                        tx.executeSql(sql , [company.comp_name, company.comp_code, company.driver_id, company.driver_username, company.driver_password],
                            (tx, rs)=>{ 
                                //console.log("transaction succ: ", rs) 
                                observer.next(rs)
                            },
                            (tx, err)=>{ 
                                //console.log("transaction err: ", err)
                                observer.error(err)
                            }
                        )
                    })
                },
                (err)=>{
                    //console.log("addCompanyData err:", err)
                    observer.error(err)
                }
            )   
        })   
    }

    public getCompanyData(comp_code?){

        let sqlCondition = ""

        if(comp_code != void(0) && comp_code != ''){
            sqlCondition = " WHERE comp_code = " + comp_code
        }

        let sql = 'SELECT * FROM company_data' + sqlCondition

        console.log(sql)

        return Observable.create((observer)=>{
            this.openDatabase().subscribe(
                (next)=>{
                    //console.log("getCompanyData next:")
                    this.db.transaction((tx)=>{
                        tx.executeSql(sql , [],
                            (tx, rs)=>{ 
                                console.log("SELECT succ: ", tx, rs) 
                                observer.next(rs)
                            },
                            (tx, err)=>{ 
                                console.log("SELECT err: ", tx, err)
                                observer.error(err)
                            }
                        )
                    })
                },
                (err)=>{
                    //console.log("getCompanyData err:", err)
                    observer.error(err)
                }
            )   
        })
    }

    public clearCompanyDB(comp_code){

        this.openDatabase().subscribe(
             (next)=>{
                 console.log("clearCompanyDB next:")
                 this.db.transaction((tx)=>{
                    tx.executeSql('DELETE FROM company_data WHERE comp_code = ?' , [comp_code],
                        (tx, rs)=>{ console.log("DELETE succ: ", rs) },
                        (tx, err)=>{ console.log("DELETE err: ", err) }
                    )
                 }).then((succ)=>{
                     console.log("transaction succ: ", succ)
                 })
                 .catch((err)=>{
                    console.log("transaction err: ", err)
                 })
             },
             (err)=>{
                console.log("clearCompanyDB err:", err)
             }
        )
           
    }

    // LOG DATA ------------------

    public addLogData(key, value) {
         this.openDatabase().subscribe(
             (next)=>{
                 console.log("addLogData next:")
                 this.db.transaction((tx)=>{
                    tx.executeSql('DELETE FROM log WHERE key = ?' , [key],
                        (tx, rs)=>{ console.log("DELETE succ: ", rs) },
                        (tx, err)=>{ console.log("DELETE err: ", err) }
                    )

                    tx.executeSql("INSERT INTO log (key, value) VALUES (?, ?)", [key, value],
                        (tx, rs)=>{ console.log("INSERT succ: ", rs) },
                        (tx, err)=>{ console.log("INSERT err: ", err) }
                    )
                 }).then((succ)=>{
                    console.log("addLogData transaction succ: ", succ)
                 })
                 .catch((err)=>{
                    console.log("addLogData transaction err: ", err)
                 })
             },
             (err)=>{
                console.log("addLogData err:", err)
             }
         )  
    }

    public getLogData(key?){

        if(key != void(0) || key != ''){
            key = "WHERE key LIKE '" + key + "'"
        }else{
            key = ''
        }

        let sql = 'SELECT * FROM log '+key

        return Observable.create((observer)=>{
            this.openDatabase().subscribe(
                (next)=>{
                    //console.log("getLogData next:")
                    this.db.transaction((tx)=>{
                        tx.executeSql(sql , [],
                            (tx, rs)=>{ 
                                //console.log("transaction succ: ", rs) 
                                observer.next(rs)
                            },
                            (tx, err)=>{ 
                                //console.log("transaction err: ", err)
                                observer.error(err)
                            }
                        )
                    })
                },
                (err)=>{
                    //console.log("getLogData err:", err)
                    observer.error(err)
                }
            )   
        })
    }
    

    public clearLogDB(key){

        this.openDatabase().subscribe(
             (next)=>{
                 console.log("clearLogDB next:")
                 this.db.transaction((tx)=>{
                    tx.executeSql('DELETE FROM log WHERE key = ?' , [key],
                        (tx, rs)=>{ console.log("DELETE succ: ", rs) },
                        (tx, err)=>{ console.log("DELETE err: ", err) }
                    )
                 }).then((succ)=>{
                     console.log("transaction succ: ", succ)
                 })
                 .catch((err)=>{
                    console.log("transaction err: ", err)
                 })
             },
             (err)=>{
                console.log("clearLogDB err:", err)
             }
        )
    }
}