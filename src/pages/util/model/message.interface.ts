interface MessageInterface {
    uid:number
    cate: string
    message: Message[]
}

interface Message {
    can_id: number
    title: string
    message: string
    cate_id: number
}