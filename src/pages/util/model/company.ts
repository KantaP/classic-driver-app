
export class CompanyModel{

    comp_name: string
    comp_code: string
    driver_id: string
    driver_username: string
    driver_password: string

    constructor(
        comp_name: string,
        comp_code: string,
        driver_id: string,
        driver_username: string,
        driver_password: string,
    ){
        this.comp_name = comp_name
        this.comp_code = comp_code
        this.driver_id = driver_id
        this.driver_username = driver_username
        this.driver_password = driver_password
    }
    
}
