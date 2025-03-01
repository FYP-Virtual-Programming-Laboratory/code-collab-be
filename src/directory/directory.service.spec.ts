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
            file: {},
          },
        },
      ],
    }).compile();

    service = module.get<DirectoryService>(DirectoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a directory', async () => {
    const directoryData = {
      id: '1',
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
      id: '1',
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
      id: '1',
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
        parent: { connect: { id: '1' } },
      },
    });
  });

  it('should rename a directory', async () => {
    const existingDirectory = {
      id: '1',
      path: 'test/oldName',
      projectId: 1,
    };
    const updatedDirectory = {
      ...existingDirectory,
      path: 'test/newName',
    };
    prisma.directory.findUnique = jest
      .fn()
      .mockResolvedValue(existingDirectory);
    prisma.directory.update = jest.fn().mockResolvedValue(updatedDirectory);

    const result = await service.renameDirectory('1', 'newName');
    expect(result).toEqual(updatedDirectory);
    expect(prisma.directory.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(prisma.directory.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { path: 'test/newName' },
    });
  });

  it('should delete a directory and its contents', async () => {
    const directory = {
      id: '1',
      path: 'test/path',
      projectId: 1,
    };
    prisma.directory.findUnique = jest.fn().mockResolvedValue(directory);
    prisma.file.deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    prisma.directory.deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    prisma.directory.delete = jest.fn().mockResolvedValue(directory);

    const result = await service.deleteDirectory('1');
    expect(result).toEqual(directory);
    expect(prisma.directory.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(prisma.file.deleteMany).toHaveBeenCalledWith({
      where: {
        path: {
          startsWith: 'test/path',
        },
      },
    });
    expect(prisma.directory.deleteMany).toHaveBeenCalledWith({
      where: {
        path: {
          startsWith: 'test/path',
        },
      },
    });
    expect(prisma.directory.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });

  it('should throw an error if directory does not exist', async () => {
    prisma.directory.findUnique = jest.fn().mockResolvedValue(null);
    prisma.file.deleteMany = jest.fn();
    prisma.directory.deleteMany = jest.fn();
    prisma.directory.delete = jest.fn();

    await expect(service.deleteDirectory('1')).rejects.toThrow(
      'Directory not found',
    );
    expect(prisma.directory.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(prisma.file.deleteMany).not.toHaveBeenCalled();
    expect(prisma.directory.deleteMany).not.toHaveBeenCalled();
    expect(prisma.directory.delete).not.toHaveBeenCalled();
  });
});
