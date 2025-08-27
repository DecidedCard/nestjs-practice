import { BadRequestException, Injectable } from '@nestjs/common';
import { paginateCommentDto } from './dto/paginate-comment.dto';
import { Repository } from 'typeorm';
import { CommentsModel } from './entity/comments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { UsersModel } from 'src/users/entity/users.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  async paginateComments(dto: paginateCommentDto, postId: number) {
    return this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        where: { post: { id: postId } },
        relations: { author: true },
      },
      `posts/${postId}/comments`,
    );
  }

  async getCommentById(id: number) {
    const comment = await this.commentsRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new BadRequestException(`id: ${id} Comment는 존재하지 않습니다.`);
    }

    return comment;
  }

  async createComment(
    author: UsersModel,
    postId: number,
    dto: CreateCommentDto,
  ) {
    return this.commentsRepository.save({
      ...dto,
      post: { id: postId },
      author,
    });
  }
}
