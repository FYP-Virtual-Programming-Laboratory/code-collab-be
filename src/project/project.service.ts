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

  /**
   * Update a project using it id or session id.
   * @param idOrSessionId Project id or the session id of the project
   * @param data Project fields to update
   * @returns true if update occurred, false otherwise.
   */
  async updateProject(
    idOrSessionId: number | string,
    {
      name,
    }: {
      name?: string;
    },
  ) {
    const project = await this.prisma.project.updateMany({
      where: {
        OR: [
          {
            id:
              typeof idOrSessionId === 'string'
                ? parseInt(idOrSessionId)
                : idOrSessionId,
          },
          {
            sessionId:
              typeof idOrSessionId === 'number'
                ? idOrSessionId.toString()
                : idOrSessionId,
          },
        ] as const,
      },
      data: {
        name,
      },
    });

    return project.count == 1;
  }

  /**
   *
   * @param idOrSessionId A project id or its associated session id
   * @param userId The user id to add to the project
   * @returns true, throws an error if the project or user cannot be found.
   */
  async addMember(idOrSessionId: number | string, userId: number) {
    let projectId =
      typeof idOrSessionId === 'string'
        ? (
            await this.prisma.project.findUnique({
              where: { sessionId: idOrSessionId },
            })
          ).id
        : idOrSessionId;

    try {
      await this.prisma.projectMembership.upsert({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
        update: {},
        create: {
          user: {
            connect: {
              id: userId,
            },
          },
          project: {
            connect: {
              id: projectId,
            },
          },
        },
      });

      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new GraphQLError('Project or user cannot be found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      throw error;
    }
  }

  /**
   * @param idOrSessionId A project id or its associated session id
   * @param userId The user id to remove from the project
   * @returns true if the user was removed, false otherwise.
   */
  async removeMember(idOrSessionId: number | string, userId: number) {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [
          {
            id:
              typeof idOrSessionId === 'string'
                ? parseInt(idOrSessionId)
                : idOrSessionId,
          },
          {
            sessionId:
              typeof idOrSessionId === 'number'
                ? idOrSessionId.toString()
                : idOrSessionId,
          },
        ],
      },
    });

    if (!project) return false;

    if (userId === project.createdById) {
      throw new GraphQLError('Cannot remove the project creator.', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }

    let projectId = project.id;

    const membership = await this.prisma.projectMembership.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return membership !== null;
  }
}
