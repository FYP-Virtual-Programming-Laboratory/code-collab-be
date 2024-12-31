import { Injectable } from '@nestjs/common';
import { Buffer } from 'buffer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FileService {
  constructor(private prisma: PrismaService) {}

  async listFiles(projectId: number) {
    const files = await this.prisma.file.findMany({
      where: {
        projectId,
      },
    });

    return files.map((file) => ({
      ...file,
      size: Buffer.byteLength(file.content, 'utf8'),
    }));
  }

  async getFileMeta(fileId: number) {
    const file = await this.prisma.file.findUnique({
      where: {
        id: fileId,
      },
      include: {
        versions: {
          include: {
            changes: {
              include: {
                madeBy: true,
              },
            },
          },
        },
      },
    });

    if (!file) {
      return null;
    }

    const contributorMap = new Map<number, number>();

    file.versions.forEach((version) => {
      version.changes.forEach((change) => {
        if (!contributorMap.has(change.madeById))
          contributorMap.set(change.madeById, 1);
        else
          contributorMap.set(
            change.madeById,
            contributorMap.get(change.madeById) + 1,
          );
      });
    });

    return {
      ...file,
      size: Buffer.byteLength(file.content, 'utf8'),
      contributorIds: Array.from(contributorMap.keys()),
      contributionStats: Array.from(contributorMap.entries()).map(
        ([contributorId, contributions]) => ({
          contributorId,
          contributions,
        }),
      ),
    };
  }

  async getFileContent(fileId: number) {
    const file = await this.prisma.file.findUnique({
      where: {
        id: fileId,
      },
      select: {
        content: true,
      },
    });

    if (!file) {
      return null;
    }

    return file.content;
  }

  async getFileHistory(fileId: number) {
    const versions = await this.prisma.version.findMany({
      where: {
        fileId,
      },
      include: {
        committedBy: true,
        changes: {
          include: {
            madeBy: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return versions;
  }
}
