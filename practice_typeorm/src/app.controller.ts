import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entity/user.entity';
import {
  Between,
  Equal,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { ProfileModel } from './entity/profile.entity';
import { PostModel } from './entity/post.entity';
import { TagModel } from './entity/tag.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(ProfileModel)
    private readonly profileRepository: Repository<ProfileModel>,
    @InjectRepository(PostModel)
    private readonly postRepository: Repository<PostModel>,
    @InjectRepository(TagModel)
    private readonly tagRepository: Repository<TagModel>,
  ) {}

  @Post('users')
  async postUser() {
    for (let i = 0; i < 100; i++) {
      await this.userRepository.save({ email: `user-${i}@google.com` });
    }
  }

  @Post('sample')
  async sample() {
    // 생성 저장하지 않음
    // const user1 = this.userRepository.create({ email: 'test@codefactory.ai' });

    //저장
    // const user2 = await this.userRepository.save({
    //   email: 'testt@codefactory.ai',
    // });

    // 입력된 값을 기반으로 데이터베이스에 있는 데이터를 불러오고
    // 추가 입력된 값으로 데이터베이스에서 가져온 값들을 대체함.
    // 저장하지 않음.
    // const user3 = await this.userRepository.preload({
    //   id: 101,
    //   email: 'codefactory@codefactory.ai',
    // });

    //삭제하기
    // await this.userRepository.delete(101);

    // 값을 증가시킴
    // await this.userRepository.increment(
    //   {
    //     id: 3,
    //   },
    //   'count',
    //   100,
    // );

    // 값을 감소시킴
    // await this.userRepository.decrement({ id: 1 }, 'count', 1);

    // 갯수 카운팅하기
    // const count = await this.userRepository.count({
    //   where: { email: ILike('%0%') },
    // });

    // sum
    // const sum = await this.userRepository.sum('count', { id: LessThan(4) });

    // average
    // const average = await this.userRepository.average('count', {
    //   id: LessThan(4),
    // });

    // 최소값
    // const min = await this.userRepository.minimum('count', { id: LessThan(4) });

    // 최대값
    // const max = await this.userRepository.maximum('count', { id: LessThan(4) });

    // const users = await this.userRepository.find()

    // const userOne = await this.userRepository.findOne({ where: { id: 3 } });

    const usersAndCount = await this.userRepository.findAndCount({
      take: 3,
    });

    return usersAndCount;
  }

  @Get('users')
  getUsers() {
    return this.userRepository.find({
      // select: {
      //   id: true,
      //   createdAt: true,
      //   updatedAt: true,
      //   version: true,
      //   profile: { id: true },
      // },
      where: {
        // id: Not(1),
        // id: LessThan(30),
        // id: LessThanOrEqual(30),
        // id: MoreThan(30),
        // id: MoreThanOrEqual(30),
        // id: Equal(30),
        // email: Like('%Google%'),
        // email: ILike('%GOOGLE%'),
        // id: Between(10, 15),
        // id: In([1, 3, 5, 7, 99]),
        // profile: IsNull(),
      },
      // relations: { profile: true },
      order: { id: 'ASC' },
      // skip: 0,
      // take: 2,
    });
  }

  @Patch('users/:id')
  async patchUser(@Param('id') id: string) {
    const user = await this.userRepository.findOne({
      where: { id: +id },
    });

    return this.userRepository.save({ ...user, email: user?.email + '0' });
  }

  @Delete('user/profile/:id')
  async deleteProfile(@Param('id') id: string) {
    await this.profileRepository.delete(+id);
  }

  @Post('user/profile')
  async createUserAndProfile() {
    const user = await this.userRepository.save({
      email: 'asdf@naver.com',
      profile: { profileImg: 'asdf.jpg' },
    });

    // const profile = await this.profileRepository.save({
    //   profileImg: 'asdf.jpg',
    //   user,
    // });

    return user;
  }

  @Post('user/post')
  async createUserAndPosts() {
    const user = await this.userRepository.save({
      email: 'postuser@naver.com',
    });

    await this.postRepository.save({
      author: user,
      title: 'post 1',
    });

    await this.postRepository.save({
      author: user,
      title: 'post 2',
    });

    return user;
  }

  @Post('posts/tag')
  async createPostsTags() {
    const post1 = await this.postRepository.save({ title: 'NestJS Lecture' });
    const post2 = await this.postRepository.save({
      title: 'Programming Lecture',
    });

    const tag1 = await this.tagRepository.save({
      name: 'Javascript',
      posts: [post1, post2],
    });
    const tag2 = await this.tagRepository.save({
      name: 'Typescript',
      posts: [post1],
    });

    const post3 = await this.postRepository.save({
      title: 'NextJS Lecture',
      tags: [tag1, tag2],
    });

    return true;
  }

  @Get('posts')
  getPosts() {
    return this.postRepository.find({ relations: { tags: true } });
  }

  @Get('tags')
  getTags() {
    return this.tagRepository.find({ relations: { posts: true } });
  }
}
