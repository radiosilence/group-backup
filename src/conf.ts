import * as config from 'config'

export interface GroupConf {
    name: string
    id: number
}

export interface FacebookConf {
    groups: GroupConf[]
    pageLimit: number
    accessToken: string
    apiVersion: string
}

const facebook = config.get<FacebookConf>('facebook')

export default {
    facebook,
}
