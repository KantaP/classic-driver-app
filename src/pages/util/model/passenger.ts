export interface Passenger {
  passenger_id?: number;
  first_name?: string;
  surname?: string;
  status?: number;
  force_login?: number;
  photo?: string;
  RFID?: string;
  pickup?: number
  point_id?: number
  fromOtherRoute?: boolean
  correctPickUp?: string
  correctDestination?: string
  action_point_id?: number
  job_passengers_id?: number
  parents?: Array<Parent>
  jobPattern?: Array<JobPattern>
  j_id?: number
  movement_order?: number
  quote_id?:number
}

interface Parent {
  email?: string
}


interface JobPattern {
  job_name?: string
}
