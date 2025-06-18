import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PostsModel } from './entities/posts.entity';

import { MoreThan, type Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { paginatePostDto } from './dto/paginate-post.dto';
import { HOST, PROTOCOL } from 'src/common/const/env.const';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({ relations: ['author'] });
  }

  // 추후 삭제
  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `임의로 생성된 포스트 제목 ${i}`,
        content: `임의로 생성된 포스트 내용 ${i}`,
      });
    }
  }

  // 오름차 순으로 정렬하는 pagination만 구현한다.
  async paginatePosts(dto: paginatePostDto) {
    const posts = await this.postsRepository.find({
      where: { id: MoreThan(dto.where__id_more_than ?? 0) },
      order: { createdAt: dto.order__createdAt },
      take: dto.take,
    });

    // 해당되는 포스트가 0개 이상이면
    // 마지막 포스트를 가져오고
    // 아니면 null을 반환한다.
    const lastItem = posts.length > 0 ? posts[posts.length - 1] : null;

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`);

    if (nextUrl) {
      /**
       * dto의 키값들을 루핑하면서
       * 키값에 해당되는 밸류가 존재하면
       * param에 그대로 붙여넣는다.
       *
       * 단, where__id_more_than 값만 lastItem의 마지막 값으로 넣어준다.
       */
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (key !== 'where__id_more_than') {
            nextUrl.searchParams.append(key, String(dto[key]));
          }
        }
      }

      nextUrl.searchParams.append(
        'where__id_more_than',
        lastItem.id.toString(),
      );
    }

    /**
     * Response
     *
     * data: Data[]
     * cursor: {
     *    after: 마지막 Data의 ID
     * }
     * count: 응답한 데이터의 갯수
     * next: 다음 요청을 할때 사용할 URL
     */

    return {
      data: posts,
      cursor: {
        after: lastItem?.id,
      },
      count: posts.length,
      next: nextUrl?.toString(),
    };
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    const post = this.postsRepository.create({
      author: { id: authorId },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async updatePost(id: number, postDto: UpdatePostDto) {
    const post = await this.postsRepository.findOne({ where: { id } });
    const title = postDto.title;
    const content = postDto.content;

    if (!post) {
      throw new NotFoundException();
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(id: number) {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsRepository.delete(id);

    return id;
  }
}
