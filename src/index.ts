import { get, Response } from 'got'
import { omit, some } from 'lodash'
import * as fs from 'fs'
import { safeDump } from 'js-yaml'
import { parse } from 'qs'
import * as PouchDB from 'pouchdb'
import * as upsert from 'pouchdb-upsert'
import { parameterize } from 'inflected'
import * as fws from 'fixed-width-string'
import chalk from 'chalk'
import { log } from './log'
import conf, { Group } from './conf'

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

const FIELDS = [
    'id',
    'comments{from,message,created_time,attachment}',
    'message',
    'from',
    'created_time',
    'updated_time',
    'full_picture',
    'picture',
    'attachments{title,type,url,description}',
]

export const tag = (group: Group) =>
    chalk.cyanBright(`${fws(group.name, 25, { align: 'right' })} |`)

export const fetchPage = async (nextUrl: string): Promise<List<RawPost>> => {
    const [url, query] = nextUrl.split('?')
    const { body: { data, paging } }: Response<List<RawPost>> = await get(url, {
        json: true,
        query: {
            ...parse(query),
            access_token: accessToken,
            fields: FIELDS.join(','),
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
        if (new Date(post.updated) > new Date(prev.updated)) {
            await db.upsert(post._id, () => post)
            return { updated: true, _id: post._id }
        }
        return { updated: false, _id: post._id }
    } catch (err) {
        if (err.status === 404) {
            await db.put<Post>(post)
            return { updated: true, _id: post._id }
        }
        throw err
    }
}

export const spider = async (
    db: PouchDB.Database,
    group: Group,
    initUrl: string,
    page: number = 0,
): Promise<void> => {
    let url = initUrl
    while (true) {
        log.info(`${tag(group)} spidering page ${page++} ${url}`)
        const { data, paging } = await fetchPage(url)

        log.info(`${tag(group)} num posts ${data.length}`)
        const posts: Post[] = data.map(createPost)
        const results = await Promise.all(
            posts.map((post) => upsertPost(db, post)),
        )

        const numUpdated = results.filter(({ updated }) => updated).length
        log.info(`${tag(group)} ${numUpdated}/${results.length} new or updated`)

        const proceed =
            data.length > 0 &&
            (numUpdated > 0 || conf.facebook.incremental === false) &&
            paging !== undefined &&
            page < (conf.facebook.pageLimit || conf.facebook.pageLimit === 0)

        if (!proceed) {
            log.info(`${tag(group)} finishing...`)
            break
        }
        url = paging.next
    }
}

export const dump = async (db: PouchDB.Database, group: Group) => {
    log.info(`${tag(group)} dumping to yaml`)
    fs.writeFileSync(
        `./dumps/${parameterize(group.name)}.yml`,
        safeDump(await db.allDocs({ include_docs: true })),
    )
}

Promise.all(
    conf.facebook.groups.map(async (group: Group) => {
        const db = new PouchDB(`backups/group-${group.id}`, {})
        log.info(`${tag(group)} db info`, await db.info())
        try {
            await spider(
                db,
                group,
                `https://graph.facebook.com/${apiVersion}/${group.id}/feed`,
            )
            await dump(db, group)
        } catch (err) {
            log.error(err, err.body)
            throw err
        }

        // const file = `${parameterize(group.name)}.backup.txt`
        // log.info(`writing file ${file}`)
    }),
)
