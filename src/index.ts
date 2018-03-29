import * as PouchDB from 'pouchdb'
import * as upsert from 'pouchdb-upsert'
import conf from './conf'
import { Group } from './interfaces'
import { spider, dump, tag } from './lib'
import { log } from './log'

PouchDB.plugin(upsert)

const { apiVersion, accessToken, pageLimit } = conf.facebook

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
