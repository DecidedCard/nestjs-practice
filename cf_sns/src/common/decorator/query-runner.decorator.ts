import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryRunner as QR } from 'typeorm';

export const QueryRunner = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.queryRunner) {
      throw new InternalServerErrorException(
        'QueryRunner 데코레이터는 TransactionInterceptor와 함께 사용해야합니다.',
      );
    }

    return req.queryRunner as QR;
  },
);
