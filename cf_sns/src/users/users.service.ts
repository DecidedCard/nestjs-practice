import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepository: Repository<UsersModel>,
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
    const user = await this.userRepository.findOne({
      where: { id: followerId },
      relations: { followees: true },
    });

    if (!user) {
      throw new BadRequestException('존재하지 않는 팔로워 입니다.');
    }

    await this.userRepository.save({
      ...user,
      followees: [...user.followees, { id: followeeId }],
    });
  }

  async getFollowers(userId: number): Promise<UsersModel[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { followers: true },
    });

    if (!user) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    return user.followers;
  }
}
