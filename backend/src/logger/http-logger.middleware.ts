import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    use(req: Request, res: Response, next: NextFunction): void {
        const { method, originalUrl } = req;
        const start = Date.now();

        res.on('finish', () => {
            const { statusCode } = res;
            const ms = Date.now() - start;
            const level =
                statusCode >= 500
                    ? 'error'
                    : statusCode >= 400
                      ? 'warn'
                      : 'info';

            this.logger.log(
                level,
                `${method} ${originalUrl} ${statusCode} ${ms}ms`,
                {
                    context: 'HTTP',
                }
            );
        });

        next();
    }
}
