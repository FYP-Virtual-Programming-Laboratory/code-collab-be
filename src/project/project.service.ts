import { Injectable } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { applyUpdateV2, Doc } from 'yjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async assertAccess(user: string, projectOrSessionId: number | string) {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [
          {
            id:
              typeof projectOrSessionId === 'string'
                ? parseInt(projectOrSessionId)
                : projectOrSessionId,
          },
          {
            sessionId:
              typeof projectOrSessionId === 'number'
                ? projectOrSessionId.toString()
                : projectOrSessionId,
          },
        ],
        projectMemberships: {
          some: {
            user,
          },
        },
      },
    });

    if (!project) {
      throw new GraphQLError('Unauthorized to access project', {
        extensions: {
          code: 'UNAUTHORIZED',
          description: 'You do not have access to this project.',
        },
      });
    }
  }

  async assertOwner(user: string, projectOrSessionId: number | string) {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [
          {
            id:
              typeof projectOrSessionId === 'string'
                ? parseInt(projectOrSessionId)
                : projectOrSessionId,
          },
          {
            sessionId:
              typeof projectOrSessionId === 'number'
                ? projectOrSessionId.toString()
                : projectOrSessionId,
          },
        ],
      },
    });

    if (!project || project.createdBy !== user) {
      throw new GraphQLError('Unauthorized to update project', {
        extensions: {
          code: 'UNAUTHORIZED',
          description: 'You do not have access to update this project.',
        },
      });
    }
  }

  async getProjectBySessionId(sessionId: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        sessionId,
      },
      include: {
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

  async getContributions(projectId: number) {
    const project = await this.findProjectById(projectId);

    if (!project) {
      return null;
    }

    const docUpdatesBytes = new Uint8Array(
      Buffer.from(project.yDocUpdates, 'base64'),
    );
    const doc = new Doc();
    applyUpdateV2(doc, docUpdatesBytes);
    const contributions = doc
      .getMap<number>('contributions')
      .toJSON() as Record<string, number>;

    return {
      contributors: Object.keys(contributions),
      contributionStats: Array.from(Object.entries(contributions)).map(
        ([contributor, contributions]) => ({ contributor, contributions }),
      ),
    };
  }

  async findProjectById(id: number) {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
      include: {
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
    createdBy: string,
    name: string,
    members: string[] = [],
  ) {
    members = Array.from(new Set([createdBy, ...members]));

    try {
      const project = await this.prisma.project.create({
        data: {
          sessionId,
          name,
          createdBy,
          projectMemberships: {
            create: members?.map((member) => ({
              user: member,
            })),
          },
        },
        include: {
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
   * @param user The user id to add to the project
   * @returns true, throws an error if the project or user cannot be found.
   */
  async addMember(idOrSessionId: number | string, user: string) {
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
          user_projectId: {
            user,
            projectId,
          },
        },
        update: {},
        create: {
          user,
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
   * @param user The user id to remove from the project
   * @returns true if the user was removed, false otherwise.
   */
  async removeMember(idOrSessionId: number | string, user: string) {
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

    if (user === project.createdBy) {
      throw new GraphQLError('Cannot remove the project creator.', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }

    let projectId = project.id;

    const membership = await this.prisma.projectMembership.delete({
      where: {
        user_projectId: {
          user,
          projectId,
        },
      },
    });

    return membership !== null;
  }

  /**
   * Store a Yjs document associated with the project in the database
   * @param projectId The project id
   * @param yDocUpdates The Yjs document in update format (v2) encoded as base64
   */
  async storeYDoc(projectId: number, yDocUpdates: string) {
    await this.prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        yDocUpdates,
      },
    });
  }
}
