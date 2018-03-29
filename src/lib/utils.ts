import * as fws from 'fixed-width-string'
import chalk from 'chalk'
import { Group } from '../interfaces'

export const tag = (group: Group) =>
    chalk.cyanBright(`${fws(group.name, 25, { align: 'right' })} |`)
