import { Group, Post, Person } from '../interfaces'
import conf from '../conf'
import { fetchPage } from './group'
import { createPost, upsertPost } from './post'
import { log } from '../log'
import { tag } from './utils'

export const spider = async (
    db: PouchDB.Database,
    group: Group,
    initUrl: string,
    members: Person[] | false,
): Promise<void> => {
    let url = initUrl
    let page = 0
    log.info(`${tag(group)} spidering group`, group)
    if (members) {
        log.info(`${tag(group)} redacting ${members.length} members`)
    }
    while (true) {
        log.info(`${tag(group)} spidering page ${page++}`)
        const { data, paging } = await fetchPage(url)

        log.info(`${tag(group)} num posts ${data.length}`)
        const posts: Post[] = data.map((post) => createPost(post, members))
        const results = await Promise.all(
            posts.map((post) => upsertPost(db, post)),
        )

        const numUpdated = results.filter(({ updated }) => updated).length
        log.info(`${tag(group)} ${numUpdated}/${results.length} new or updated`)

        const proceed =
            data.length > 0 &&
            (numUpdated > 0 || conf.facebook.incremental === false) &&
            paging !== undefined &&
            (page < conf.facebook.pageLimit || conf.facebook.pageLimit === 0)

        if (!proceed) {
            log.info(`${tag(group)} finishing...`)
            break
        }
        url = paging.next
    }
}
