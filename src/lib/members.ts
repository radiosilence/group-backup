import conf from '../conf'
import { List, Person, Group, Members } from '../interfaces'
import { Response, get } from 'got'
import { tag } from './utils'
import { log } from '../log'
import { parse } from 'qs'

const { facebook: { apiVersion } } = conf

export const fetchMembers = async (group: Group): Promise<Members> => {
    let url = `https://graph.facebook.com/${apiVersion}/${group.id}/members`
    let query = {}
    let members: Person[] = []
    let i = 1
    while (true) {
        log.info(`${tag(group)} getting page ${i} of members`)

        const { body: { data, paging } }: Response<List<Person>> = await get(
            url,
            {
                json: true,
                query: {
                    ...query,
                    access_token: conf.facebook.accessToken,
                    fields: 'name,id',
                    limit: 100,
                },
            },
        )

        log.info(`${tag(group)} added ${data.length} members to redact list`)

        if (data.length === 0) {
            break
        }
        members = [...members, ...data]

        if (!paging.next) {
            break
        }

        const next = paging.next.split('?')
        url = next[0]
        query = parse(next[1])
        i++
    }
    return members
}
