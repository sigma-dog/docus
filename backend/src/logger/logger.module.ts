import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const consoleFormat = combine(
    colorize({ all: true }),
    timestamp({ format: 'HH:mm:ss' }),
    printf(({ level, message, timestamp: ts, context, ...meta }) => {
        const ctx =
            typeof context === 'string' && context ? ` [${context}]` : '';
        const extra = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : '';
        const ts_ = typeof ts === 'string' ? ts : String(ts);
        const msg = typeof message === 'string' ? message : String(message);
        return `${ts_} ${level}${ctx}: ${msg}${extra}`;
    })
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

@Module({
    imports: [
        WinstonModule.forRoot({
            transports: [
                new winston.transports.Console({
                    format: consoleFormat,
                }),
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    format: fileFormat,
                }),
                new winston.transports.File({
                    filename: 'logs/combined.log',
                    format: fileFormat,
                }),
            ],
        }),
    ],
})
export class LoggerModule {}
