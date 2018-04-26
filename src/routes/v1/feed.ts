import { Context } from 'koa'

export const feed = async (ctx: Context) => {
    ctx.body = 'feed!'
}
