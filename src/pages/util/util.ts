import { Global } from './global'
export class Util{

    private static UK_SITE      = "sv.ecoachmanager.com:3000"
    private static AU_SITE      = "svau.ecoachmanager.com:3000"
    private static CLOUD_SITE   = "http://52.77.47.28:3000"

    public static getSystemURL(type?:string){
        type = "dev"
        if(type == "dev"){
            return this.CLOUD_SITE;
        }else{
            if(Global.getGlobal('api_site') != void(0) &&
                Global.getGlobal('api_site') != ''
            ){
                return Global.getGlobal('api_site')+":3000"
            }
            return this.UK_SITE
        }
    }
    
}