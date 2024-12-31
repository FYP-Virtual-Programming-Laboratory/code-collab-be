import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async getProjectBySessionId(sessionId: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        sessionId,
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

    if (!project) {
      return null;
    }

    return {
      ...project,
      members: project.projectMemberships.map((membership) => membership.user),
    };
  }

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

    if (!project) {
      return null;
    }

    return {
      ...project,
      members: project.projectMemberships.map((membership) => membership.user),
    };
  }
}
