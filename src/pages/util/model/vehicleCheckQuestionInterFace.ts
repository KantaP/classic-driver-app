export interface QuestionObject {
            'chk_id': number
            'chk_group_id': number
            'chk_name': string
            'chk_desc': string
            'chk_options': Chkoptions
            'chk_order': number
            'car_id': number
        }

interface Chkoptions{
    'chk_type': string
    'chk_options': Chkoption[]
}

interface Chkoption {
    option: Option[]
}

interface Option {
    name: string
    type: string
    take_photo: any
    follow_up: Followup[]
}

interface Followup {
  'chk_type': string
  'text_field': boolean
  'chk_options': Followup_Chkoption[]
}

interface Followup_Chkoption {
  option: Followup_Option[]
}

interface Followup_Option {
  name: string
  critical: boolean
}