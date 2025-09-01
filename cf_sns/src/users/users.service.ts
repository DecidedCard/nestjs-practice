import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';
import { Repository } from 'typeorm';
import { UserFollowersModel } from './entity/user-followers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  async getAllUsers() {
    return this.userRepository.find();
  }

  async createUser(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>) {
    // 1) nickname 중복이 없는지 확인
    // exist() -> 만약에 조건에 해당되는 값이 있으면 true 반환
    const nickNameExists = await this.userRepository.exists({
      where: {
        nickname: user.nickname,
      },
    });

    if (nickNameExists) {
      throw new BadRequestException('이미 존재하는 nickname 입니다!');
    }

    const emailExists = await this.userRepository.exists({
      where: {
        email: user.email,
      },
    });

    if (emailExists) {
      throw new BadRequestException('이미 가입한 이메일 입니다.');
    }
    const userObject = this.userRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    const newUser = await this.userRepository.save(userObject);

    return newUser;
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async followUser(followerId: number, followeeId: number) {
    await this.userFollowersRepository.save({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });

    return true;
  }

  async getFollowers(userId: number): Promise<UsersModel[]> {
    /**
     * [
     * {
     *    id: number,
     *    follower: UsersModel;
     *    followee: UsersModel;
     *    isConfirmed: boolean;
     *    createdAt: Date;
     *    updatedAt: Date:
     * }
     * ]
     */
    const result = await this.userFollowersRepository.find({
      where: {
        followee: { id: userId },
      },
      relations: { follower: true, followee: true },
    });

    if (!result) {
      throw new BadRequestException('존재하지 않는 팔로워입니다.');
    }

    return result.map((x) => x.follower);
  }
}
