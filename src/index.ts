import { get, Response } from 'got'
import { omit, some } from 'lodash'
import * as fs from 'fs'
import { safeDump } from 'js-yaml'
import { parse } from 'qs'
import * as PouchDB from 'pouchdb'
import * as upsert from 'pouchdb-upsert'
import { parameterize } from 'inflected'
import { log } from './log'
import conf, { GroupConf } from './conf'

PouchDB.plugin(upsert)

const { apiVersion, accessToken, pageLimit } = conf.facebook

export interface List<T> {
    data: T[]
    paging: {
        previous: string
        next: string
    }
}
export interface RawPost {
    id: number
    message: string
    created_time: string
    updated_time: string
    from: Person
    comments?: List<Comment>
}

export interface GroupResult extends GroupConf {
    posts: RawPost[]
}

export interface Person {
    name: string
    id: string
}

export interface Post {
    _id: string
    message?: string
    updated: Date
    created: Date
    from: Person
    comments: Comment[]
}

const FIELDS =
    'id,comments{from,message,created_time},message,from,created_time,updated_time'

export const fetchPage = async (nextUrl: string): Promise<List<RawPost>> => {
    const [url, query] = nextUrl.split('?')
    const { body: { data, paging } }: Response<List<RawPost>> = await get(url, {
        json: true,
        query: {
            ...parse(query),
            access_token: accessToken,
            fields: FIELDS,
            limit: 100,
        },
    })
    return { data, paging }
}

export const createPost = (post: RawPost): Post => ({
    _id: `${post.id}`,
    message: post.message,
    from: post.from,
    created: new Date(post.created_time),
    updated: new Date(post.updated_time),
    comments: post.comments ? (post.comments as List<Comment>).data : [],
})

export const upsertPost = async (db: PouchDB.Database, post: Post) => {
    try {
        const prev = await db.get<Post>(post._id)
        console.log('PREV', prev)
        console.log('NEXT', post)
        if (new Date(post.updated) > new Date(prev.updated)) {
            await db.upsert(post._id, () => post)
            return { updated: true, _id: post._id }
        }
        return { updated: false, _id: post._id }
    } catch (err) {
        log.error(err)
        await db.put<Post>(post)
        return { updated: true, _id: post._id }
    }
}

export const spider = async (
    db: PouchDB.Database,
    initUrl: string,
    page: number = 0,
): Promise<void> => {
    let url = initUrl
    while (true) {
        log.info(`spidering page ${page++} ${url}`)
        const { data, paging } = await fetchPage(url)
        log.info(`paging`, paging)

        log.info(`num posts ${data.length}`)
        const posts: Post[] = data.map(createPost)
        console.log('posts', posts)
        const results = await Promise.all(
            posts.map((post) => upsertPost(db, post)),
        )

        console.log('RESULTS', results)

        const proceed =
            data.length > 0 &&
            (some(results.map(({ updated }) => updated)) ||
                conf.facebook.incremental === false) &&
            paging !== undefined &&
            page < (conf.facebook.pageLimit || conf.facebook.pageLimit === 0)

        if (!proceed) {
            break
        }
        url = paging.next
    }
}

Promise.all(
    conf.facebook.groups.map(async ({ id }: GroupConf) => {
        const db = new PouchDB(`${id}`, {})
        log.info('db info', await db.info())
        try {
            await spider(
                db,
                `https://graph.facebook.com/${apiVersion}/${id}/feed`,
            )
        } catch (err) {
            log.error(err, err.body)
            throw err
        }

        // const file = `${parameterize(group.name)}.backup.txt`
        // log.info(`writing file ${file}`)
    }),
)
