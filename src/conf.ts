import * as config from 'config'
import { FacebookConf } from './interfaces'

const facebook = config.get<FacebookConf>('facebook')

export default {
    facebook,
}
