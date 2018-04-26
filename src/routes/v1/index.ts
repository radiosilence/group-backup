import * as Router from 'koa-router'
import { feed } from './feed'

export const v1 = new Router()

v1.get('/feed', feed)
