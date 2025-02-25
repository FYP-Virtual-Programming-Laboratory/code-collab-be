import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectGuard } from './project.guard';
import { ProjectService } from './project.service';

describe('ProjectGuard', () => {
  let projectGuard: ProjectGuard;
  let projectService: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectGuard,
        {
          provide: ProjectService,
          useValue: {
            findProjectById: jest.fn(),
            getProjectBySessionId: jest.fn(),
          },
        },
      ],
    }).compile();

    projectGuard = module.get<ProjectGuard>(ProjectGuard);
    projectService = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(projectGuard).toBeDefined();
  });

  it('should allow access if user is a member of the project by id', async () => {
    const mockContext = {
      user: 'testUser',
    };
    const mockProject = {
      members: ['testUser'],
    };
    jest
      .spyOn(projectService, 'findProjectById')
      .mockResolvedValue(mockProject as any);

    const execCtx = {
      getContext: () => mockContext,
      getArgs: () => ({ id: 1 }),
    } as any as ExecutionContext;

    const gqlExecCtx = {
      getContext: () => mockContext,
      getArgs: () => ({ id: 1 }),
    } as any as GqlExecutionContext;
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(gqlExecCtx);

    const result = await projectGuard.canActivate(execCtx);
    expect(result).toBe(true);
  });

  it('should deny access if user is not a member of the project by id', async () => {
    const mockContext = {
      user: 'testUser',
    };
    const mockProject = {
      members: ['otherUser'],
    };
    jest
      .spyOn(projectService, 'findProjectById')
      .mockResolvedValue(mockProject as any);

    const execCtx = {
      getContext: () => mockContext,
      getArgs: () => ({ id: 1 }),
    } as any as ExecutionContext;

    const gqlExecCtx = {
      getContext: () => mockContext,
      getArgs: () => ({ id: 1 }),
    } as any as GqlExecutionContext;
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(gqlExecCtx);

    await expect(projectGuard.canActivate(execCtx)).rejects.toThrow(
      'Unauthorized to access project',
    );
  });

  it('should allow access if user is a member of the project by sessionId', async () => {
    const mockContext = {
      user: 'testUser',
    };
    const mockProject = {
      members: ['testUser'],
    };
    jest
      .spyOn(projectService, 'getProjectBySessionId')
      .mockResolvedValue(mockProject as any);

    const execCtx = {
      getContext: () => mockContext,
      getArgs: () => ({ sessionId: 'session123' }),
    } as any as ExecutionContext;

    const gqlExecCtx = {
      getContext: () => mockContext,
      getArgs: () => ({ sessionId: 'session123' }),
    } as any as GqlExecutionContext;
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(gqlExecCtx);

    const result = await projectGuard.canActivate(execCtx);
    expect(result).toBe(true);
  });

  it('should deny access if user is not a member of the project by sessionId', async () => {
    const mockContext = {
      user: 'testUser',
    };
    const mockProject = {
      members: ['otherUser'],
    };
    jest
      .spyOn(projectService, 'getProjectBySessionId')
      .mockResolvedValue(mockProject as any);

    const execCtx = {
      getContext: () => mockContext,
      getArgs: () => ({ sessionId: 'session123' }),
    } as any as ExecutionContext;

    const gqlExecCtx = {
      getContext: () => mockContext,
      getArgs: () => ({ sessionId: 'session123' }),
    } as any as GqlExecutionContext;
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(gqlExecCtx);

    await expect(projectGuard.canActivate(execCtx)).rejects.toThrow(
      'Unauthorized to access project',
    );
  });
});
