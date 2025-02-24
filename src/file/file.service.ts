import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FileService {
  constructor(private prisma: PrismaService) {}

  async createFile(
    projectId: number,
    path: string,
    initialContent: string | null,
  ) {
    return await this.prisma.file.create({
      data: {
        path,
        content: initialContent ?? '',
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    });
  }

  async updateFile(fileId: number, newContent: string) {
    // Todo: update file version and create snapshot
    return await this.prisma.file.update({
      where: {
        id: fileId,
      },
      data: {
        content: newContent,
      },
    });
  }

  async listFiles(projectId: number) {
    const files = await this.prisma.file.findMany({
      where: {
        projectId,
      },
    });

    return files;
  }

  async getFileContributions(fileId: number) {
    const file = await this.prisma.file.findUnique({
      where: {
        id: fileId,
      },
      select: {
        versions: true,
      },
    });

    if (!file) {
      return null;
    }

    const contributorMap = new Map<number, number>();

    return {
      contributorIds: Array.from(contributorMap.keys()),
      contributionStats: Array.from(contributorMap.entries()).map(
        ([contributorId, contributions]) => ({
          contributorId,
          contributions,
        }),
      ),
    };
  }

  async getFileHistory(fileId: number) {
    const versions = await this.prisma.version.findMany({
      where: {
        fileId,
      },
      include: {
        committedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return versions;
  }

  async getFile(fileId: number) {
    try {
      const file = await this.prisma.file.findUnique({
        where: {
          id: fileId,
        },
      });

      return file;
    } catch (error) {
      return null;
    }
  }
}
