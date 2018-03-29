import { Group, Post } from '../interfaces'
import conf from '../conf'
import { fetchPage } from './group'
import { createPost, upsertPost } from './post'
import { log } from '../log'
import { tag } from './utils'

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
