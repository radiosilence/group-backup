export interface Group {
    name: string
    id: number
}

export interface FacebookConf {
    groups: Group[]
    pageLimit: number
    accessToken: string
    apiVersion: string
    incremental: boolean
    redactMembers: boolean
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
