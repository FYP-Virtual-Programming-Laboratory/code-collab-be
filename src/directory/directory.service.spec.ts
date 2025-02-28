import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DirectoryService } from './directory.service';

describe('DirectoryService', () => {
  let service: DirectoryService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DirectoryService,
        {
          provide: PrismaService,
          useValue: {
            directory: {},
            version: {},
          },
        },
      ],
    }).compile();

    service = module.get<DirectoryService>(DirectoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a directory', async () => {
    const directoryData = {
      id: 1,
      path: 'test',
      projectId: 1,
    };
    prisma.directory.findUnique = jest.fn().mockResolvedValue(null);
    prisma.directory.create = jest.fn().mockResolvedValue(directoryData as any);

    const result = await service.getOrCreateDirectory(1, 'test');
    expect(result).toEqual(directoryData);
    expect(prisma.directory.findUnique).toHaveBeenCalledWith({
      where: {
        path: 'test',
        projectId: 1,
      },
    });
    expect(prisma.directory.create).toHaveBeenCalledWith({
      data: {
        path: 'test',
        project: {
          connect: {
            id: 1,
          },
        },
        parent: undefined,
      },
    });
  });

  it('should return existing directory if it exists', async () => {
    const existingDirectory = {
      id: 1,
      path: 'test/path',
      projectId: 1,
    };
    prisma.directory.findUnique = jest
      .fn()
      .mockResolvedValue(existingDirectory);
    prisma.directory.create = jest.fn();

    const result = await service.getOrCreateDirectory(1, 'test/path');
    expect(result).toEqual(existingDirectory);
    expect(prisma.directory.findUnique).toHaveBeenCalledWith({
      where: {
        path: 'test/path',
        projectId: 1,
      },
    });
    expect(prisma.directory.create).not.toHaveBeenCalled();
  });

  it('should create parent directories if they do not exist', async () => {
    const parentDirectoryData = {
      id: 1,
      path: 'test',
      projectId: 1,
    };
    const directoryData = {
      id: 2,
      path: 'test/path',
      projectId: 1,
      parentId: 1,
    };
    prisma.directory.findUnique = jest
      .fn()
      .mockResolvedValueOnce(null) // Parent directory does not exist
      .mockResolvedValueOnce(null); // Current directory does not exist
    prisma.directory.create = jest
      .fn()
      .mockResolvedValueOnce(parentDirectoryData as any) // Create parent directory
      .mockResolvedValueOnce(directoryData as any); // Create current directory

    const result = await service.getOrCreateDirectory(1, 'test/path');
    expect(result).toEqual(directoryData);
    expect(prisma.directory.findUnique).toHaveBeenCalledWith({
      where: {
        path: 'test/path',
        projectId: 1,
      },
    });
    expect(prisma.directory.create).toHaveBeenCalledWith({
      data: {
        path: 'test',
        project: {
          connect: {
            id: 1,
          },
        },
        parent: undefined,
      },
    });
    expect(prisma.directory.create).toHaveBeenCalledWith({
      data: {
        path: 'test/path',
        project: {
          connect: {
            id: 1,
          },
        },
        parent: { connect: { id: 1 } },
      },
    });
  });
});
