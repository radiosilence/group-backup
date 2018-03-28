import { transports, Logger } from 'winston'

export const log = new Logger({
    transports: [
        new transports.Console({
            colorize: true,
            level: 'info',
            formatter: undefined,
        }),
    ],
})
