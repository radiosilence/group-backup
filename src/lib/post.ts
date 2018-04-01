import * as PouchDB from 'pouchdb'
import {
    RawPost,
    Post,
    List,
    Person,
    Comment,
    RawComment,
    Members,
} from '../interfaces'
import { redact } from './redact'

export const createComment = (
    members: Members,
    comment: RawComment,
): Comment => ({
    _id: comment.id,
    from: !members ? comment.from : undefined,
    message: redact(members, comment.message),
    created: new Date(comment.created_time),
})

export const createPost = (members: Members, post: RawPost): Post => ({
    _id: `${post.id}`,
    message: redact(members, post.message),
    from: !members ? post.from : undefined,
    created: new Date(post.created_time),
    updated: new Date(post.updated_time),
    comments: post.comments
        ? post.comments.data.map((c) => createComment(members, c))
        : [],
})

export const upsertPost = async (db: PouchDB.Database, post: Post) => {
    try {
        const prev = await db.get<Post>(post._id)
        if (new Date(post.updated) > new Date(prev.updated)) {
            await db.upsert(post._id, () => post)
            return { updated: true, _id: post._id }
        }
        return { updated: false, _id: post._id }
    } catch (err) {
        if (err.status === 404) {
            await db.put<Post>(post)
            return { updated: true, _id: post._id }
        }
        throw err
    }
}
