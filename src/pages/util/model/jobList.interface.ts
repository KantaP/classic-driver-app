export interface JobsListInterface {
    'quote_id': number,
    'movement_id': number,
    outward: string,
    return: string,
    pickup: string,
    destination: string,
    'passengers_num': number,
    'driver_confirm': string,
    'driver_accept': boolean,
    'balance_due': number,
    'driver_pay': number
}