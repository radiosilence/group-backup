import * as PouchDB from 'pouchdb'
import { RawPost, Post, List } from '../interfaces'

export const createPost = (post: RawPost): Post => ({
    _id: `${post.id}`,
    message: post.message,
    from: post.from,
    created: new Date(post.created_time),
    updated: new Date(post.updated_time),
    comments: post.comments ? (post.comments as List<Comment>).data : [],
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
