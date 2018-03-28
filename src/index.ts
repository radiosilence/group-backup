import { get, Response } from 'got'
import * as fs from 'fs'
import { safeDump } from 'js-yaml'
import { parse } from 'qs'
import { parameterize } from 'inflected'
import { log } from './log'
import conf, { GroupConf } from './conf'

export interface List<T> {
    data: T[]
    paging: {
        previous: string
        next: string
    }
}
export interface Post {
    message: string
    comments?: List<Comment> | Comment[]
}

export interface GroupResult extends GroupConf {
    posts: Post[]
}
const FIELDS = 'comments{from,message,created_time},message,from,created_time'
export const spider = async (
    nextUrl: string,
    page: number = 0,
): Promise<Post[]> => {
    log.info(`spidering page ${page} ${nextUrl}`)
    const [url, query] = nextUrl.split('?')
    const { body: { data, paging } }: Response<List<Post>> = await get(url, {
        json: true,
        query: {
            ...parse(query),
            access_token: conf.facebook.accessToken,
            fields: FIELDS,
            limit: 100,
        },
    })
    log.info(`num posts ${data.length}`)
    const posts = data.map((post: Post) => ({
        ...post,
        comments: post.comments ? (post.comments as List<Comment>).data : [],
    }))
    return posts.length > 0 &&
        page < (conf.facebook.pageLimit || conf.facebook.pageLimit === 0)
        ? [...posts, ...(await spider(paging.next, page + 1))]
        : posts
}

Promise.all(
    conf.facebook.groups.map(async (groupConf: GroupConf) => {
        const group: GroupResult = {
            posts: await spider(
                `https://graph.facebook.com/${conf.facebook.apiVersion}/${
                    groupConf.id
                }/feed`,
            ),
            ...groupConf,
        }
        const file = `${parameterize(group.name)}.backup.txt`
        log.info(`writing file ${file}`)
        fs.writeFileSync(file, safeDump(group.posts), 'utf-8')
    }),
)
