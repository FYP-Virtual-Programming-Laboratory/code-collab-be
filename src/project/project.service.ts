import { Injectable } from '@nestjs/common';
import { GraphQLError } from 'graphql';
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

  async createProject(
    sessionId: string,
    creatorId: number,
    name: string,
    memberIds: number[] = [],
  ) {
    memberIds = Array.from(new Set([creatorId, ...memberIds]));

    try {
      const project = await this.prisma.project.create({
        data: {
          sessionId,
          name,
          createdBy: {
            connect: {
              id: creatorId,
            },
          },
          projectMemberships: {
            create: memberIds?.map((id) => ({
              user: {
                connect: {
                  id,
                },
              },
            })),
          },
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
        members: project.projectMemberships.map(
          (membership) => membership.user,
        ),
      };
    } catch (error) {
      if (error.code === 'P2025') {
        if (error.meta.cause.includes('ProjectMembership'))
          throw new GraphQLError('One or more members cannot be found.', {
            extensions: { code: 'NOT_FOUND' },
          });

        throw new GraphQLError('Creator cannot be found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      throw error;
    }
  }
}
