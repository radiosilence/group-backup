import conf from '../conf'
import { List, Person, Group } from '../interfaces'
import { Response, get } from 'got'

const { facebook: { apiVersion } } = conf

export const fetchMembers = async (group: Group): Promise<Person[]> => {
    let url = `https://graph.facebook.com/${apiVersion}/${group.id}/members`
    let members: Person[] = []

    while (true) {
        const { body: { data, paging } }: Response<List<Person>> = await get(
            url,
            {
                json: true,
                query: {
                    access_token: conf.facebook.accessToken,
                    fields: 'name,id',
                    limit: 100,
                },
            },
        )
        if (data.length === 0) {
            break
        }
        members = [...members, ...data]
        url = paging.next
    }
    return members
}
