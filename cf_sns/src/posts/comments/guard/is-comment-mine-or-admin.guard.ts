import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { RolesEnum } from 'src/users/const/roles.const';
import { UsersModel } from 'src/users/entity/users.entity';
import { CommentsService } from '../comments.service';

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
  constructor(private readonly commentService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & { user: UsersModel } = context
      .switchToHttp()
      .getRequest();

    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const commentId = req.params.commentId;

    if (!commentId) {
      throw new BadRequestException(
        'comment ID가 파라미터로 제공 되어야 합니다.',
      );
    }

    const isOk = await this.commentService.isCommentMine(
      user.id,
      parseInt(commentId),
    );

    if (!isOk) {
      throw new ForbiddenException('권환이 없습니다.');
    }

    return true;
  }
}
