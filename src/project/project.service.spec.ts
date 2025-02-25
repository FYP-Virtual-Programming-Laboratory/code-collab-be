import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLError } from 'graphql';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectService, PrismaService],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProjectBySessionId', () => {
    it('should return project with members', async () => {
      const sessionId = 'session-id';
      const project = {
        id: 1,
        sessionId,
        projectMemberships: [{ user: 'user1' }, { user: 'user2' }],
      };
      jest
        .spyOn(prisma.project, 'findUnique')
        .mockResolvedValue(project as any);

      const result = await service.getProjectBySessionId(sessionId);
      expect(result).toEqual({
        ...project,
        members: ['user1', 'user2'],
      });
    });

    it('should return null if project not found', async () => {
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

      const result = await service.getProjectBySessionId('invalid-session-id');
      expect(result).toBeNull();
    });
  });

  describe('getContributions', () => {
    it('should return null if project not found', async () => {
      jest.spyOn(service, 'findProjectById').mockResolvedValue(null);

      const result = await service.getContributions(999);
      expect(result).toBeNull();
    });
  });

  describe('createProject', () => {
    it('should create a project', async () => {
      const sessionId = 'session-id';
      const createdBy = 'creator';
      const name = 'project-name';
      const members = ['member1', 'member2'];
      const project = {
        id: 1,
        sessionId,
        name,
        createdBy,
        projectMemberships: [
          { user: 'creator' },
          { user: 'member1' },
          { user: 'member2' },
        ],
      };
      jest.spyOn(prisma.project, 'create').mockResolvedValue(project as any);

      const result = await service.createProject(
        sessionId,
        createdBy,
        name,
        members,
      );
      expect(result).toEqual({
        ...project,
        members: ['creator', 'member1', 'member2'],
      });
    });

    it('should throw error if member not found', async () => {
      jest.spyOn(prisma.project, 'create').mockRejectedValue({
        code: 'P2025',
        meta: { cause: 'ProjectMembership' },
      });

      await expect(
        service.createProject('session-id', 'creator', 'project-name', [
          'invalid-member',
        ]),
      ).rejects.toThrow(GraphQLError);
    });
  });

  // ...additional tests for other methods...
});
