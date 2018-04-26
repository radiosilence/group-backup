import * as escape from 'escape-string-regexp'
import { Person } from '../interfaces'

export const redact = (members: Person[] | false, text: string) => {
    console.log('redacting with members', members)
    console.log('redacting text', text)
    if (!members || members.length === 0 || !text) {
        return text
    }
    const expString = `(${members.map(({ name }) => escape(name)).join('|')})`
    const exp = new RegExp(expString, 'gi')
    const redacted = text.replace(exp, '[redacted]')
    console.log('redacted text', redacted)
    return redacted
}
