import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }

  async getUsers(ids: number[]) {
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return users;
  }
}
