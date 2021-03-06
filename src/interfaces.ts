export interface Group {
    name: string
    id: number
    redact: boolean
}

export interface FacebookConf {
    appId: string
    appSecret: string
    groups: Group[]
    pageLimit: number
    accessToken: string
    apiVersion: string
    incremental: boolean
    fields: string[]
}

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
    comments?: List<RawComment>
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
    from?: Person
    comments: Comment[]
}

export interface RawComment {
    id: string
    created_time: string
    message: string
    from: Person
}

export interface Comment {
    _id: string
    created: Date
    message: string
    from?: Person
}

export interface MembersResponse {
    data: Person[]
    paging: {
        cursors: {
            before: string
            after: string
        }
    }
}

export type Members = Person[] | false
