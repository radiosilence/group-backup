import { template } from 'lodash'
import * as path from 'path'
import { readFileSync } from 'fs'
import { Context } from 'koa'
import * as Router from 'koa-router'
import { v1 } from './v1'
import conf from '../conf'

export const router = new Router()
const page = template(
    readFileSync(
        path.join(__dirname, '..', '..', 'html', 'index.html'),
        'utf-8',
    ),
)

router.use('/v1', v1.routes())
router.get('/', async (ctx: Context) => {
    ctx.body = page(conf.facebook)
})
