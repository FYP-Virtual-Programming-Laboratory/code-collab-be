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
    let parentId: string | null = null;

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

  async renameDirectory(id: string, newName: string) {
    const existingDirectory = await this.prisma.directory.findUnique({
      where: { id },
    });

    if (!existingDirectory) {
      throw new Error('Directory not found');
    }

    const splitPath = existingDirectory.path.split('/');
    splitPath[splitPath.length - 1] = newName;
    const newPath = splitPath.join('/');

    return await this.prisma.directory.update({
      where: { id },
      data: { path: newPath },
    });
  }

  async deleteDirectory(id: string) {
    const directory = await this.prisma.directory.findUnique({
      where: { id },
    });

    if (!directory) {
      throw new Error('Directory not found');
    }

    // Delete all files and subdirectories within this directory
    await this.prisma.file.deleteMany({
      where: {
        path: {
          startsWith: directory.path,
        },
      },
    });
    await this.prisma.directory.deleteMany({
      where: {
        path: {
          startsWith: directory.path,
        },
      },
    });

    // Finally, delete the directory itself
    return await this.prisma.directory.delete({
      where: { id },
    });
  }

  async listDirectories(projectId: number) {
    return await this.prisma.directory.findMany({
      where: {
        projectId,
      },
    });
  }
}
