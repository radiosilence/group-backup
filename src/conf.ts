import * as config from 'config'

export interface Group {
    name: string
    id: number
}

export interface FacebookConf {
    groups: Group[]
    pageLimit: number
    accessToken: string
    apiVersion: string
    incremental: boolean
}

const facebook = config.get<FacebookConf>('facebook')

export default {
    facebook,
}
