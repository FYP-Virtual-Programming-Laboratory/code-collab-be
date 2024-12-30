import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async findProjectById(id: number) {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        createdBy: true,
        projectMemberships: {
          select: {
            user: true,
          },
        },
      },
    });

    return {
      ...project,
      members: project.projectMemberships.map((membership) => membership.user),
    };
  }
}
