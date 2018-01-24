import { Global } from './global'
export class Util{

    // private static UK_SITE      = "sv.ecoachmanager.com:3000"
    // private static AU_SITE      = "svau.ecoachmanager.com:3000"
    private static CLOUD_SITE   = "http://192.168.1.21:8080"
    private static ASIA_SITE = "http://montriwebservice.ecoachmanager.com/driver"
    private static NOTIFICATION_SITE   = "http://montriwebservice.ecoachmanager.com/parent/passOnDevices"

    public static getSystemURL(type?:string){
        type = "dev"
        if(type == "dev"){
            return this.ASIA_SITE;
        }else{
            // if(Global.getGlobal('api_site') != void(0) &&
            //     Global.getGlobal('api_site') != ''
            // ){
            //     return Global.getGlobal('api_site')+":3000"
            // }
            // return this.UK_SITE
        }
    }

    public static getNotificationUrl() {
      return this.NOTIFICATION_SITE
    }

}
