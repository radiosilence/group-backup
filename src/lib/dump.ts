import * as fs from 'fs'
import { parameterize } from 'inflected'
import { safeDump } from 'js-yaml'
import { tag } from './utils'
import { log } from '../log'
import { Group } from '../interfaces'

export const dump = async (db: PouchDB.Database, group: Group) => {
    log.info(`${tag(group)} dumping to yaml`)
    fs.writeFileSync(
        `./dumps/${parameterize(group.name)}.yml`,
        safeDump(await db.allDocs({ include_docs: true })),
    )
}
