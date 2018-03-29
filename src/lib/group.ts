import { get, Response } from 'got'
import { parse } from 'qs'
import { List, RawPost } from '../interfaces'
import conf from '../conf'

export const fetchPage = async (nextUrl: string): Promise<List<RawPost>> => {
    const [url, query] = nextUrl.split('?')
    const { body: { data, paging } }: Response<List<RawPost>> = await get(url, {
        json: true,
        query: {
            ...parse(query),
            access_token: conf.facebook.accessToken,
            fields: conf.facebook.fields.join(','),
            limit: 100,
        },
    })
    return { data, paging }
}
