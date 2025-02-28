import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DirectoryService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateDirectory(projectId: number, path: string) {
    const existingDirectory = await this.prisma.directory.findUnique({
      where: {
        path,
        projectId,
      },
    });

    if (existingDirectory) {
      return existingDirectory;
    }

    const splitPath = path.split('/');
    let parentId: number | null = null;

    if (splitPath.length > 1) {
      // Create parent directory if it doesn't exist
      const parentPath = splitPath.slice(0, -1).join('/');
      const parentDirectory = await this.getOrCreateDirectory(
        projectId,
        parentPath,
      );
      parentId = parentDirectory.id;
    }

    return await this.prisma.directory.create({
      data: {
        path,
        project: {
          connect: {
            id: projectId,
          },
        },
        parent: parentId ? { connect: { id: parentId } } : undefined,
      },
    });
  }
}
