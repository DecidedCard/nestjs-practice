import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RolesEnum } from 'src/users/const/roles.const';
import { PostsService } from '../posts.service';
import { UsersModel } from 'src/users/entity/users.entity';
import { Request } from 'express';

@Injectable()
export class IsPostMineOrAdmin implements CanActivate {
  constructor(private readonly postService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & { user: UsersModel } = context
      .switchToHttp()
      .getRequest();

    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    /**
     * Admin일 경우 그냥 패스
     */
    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestException('Post ID가 파라미터로 제공 되어야 합니다.');
    }

    return this.postService.isPostMine(user.id, parseInt(postId));
  }
}
