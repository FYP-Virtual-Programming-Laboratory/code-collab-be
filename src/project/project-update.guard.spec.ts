import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectUpdateGuard } from './project-update.guard';
import { ProjectService } from './project.service';

describe('ProjectUpdateGuard', () => {
  let projectUpdateGuard: ProjectUpdateGuard;
  let projectService: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectUpdateGuard,
        {
          provide: ProjectService,
          useValue: {
            findProjectById: jest.fn(),
            getProjectBySessionId: jest.fn(),
          },
        },
      ],
    }).compile();

    projectUpdateGuard = module.get<ProjectUpdateGuard>(ProjectUpdateGuard);
    projectService = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(projectUpdateGuard).toBeDefined();
  });

  it('should allow update if user is a owner of the project by id', async () => {
    const mockContext = {
      user: 'testUser',
    };
    const mockProject = {
      createdBy: 'testUser',
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

    const result = await projectUpdateGuard.canActivate(execCtx);
    expect(result).toBe(true);
  });

  it('should deny access if user is not the owner of the project by id', async () => {
    const mockContext = {
      user: 'testUser',
    };
    const mockProject = {
      createdBy: 'otherUser',
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

    await expect(projectUpdateGuard.canActivate(execCtx)).rejects.toThrow(
      'Unauthorized to update project',
    );
  });

  it('should allow access if user is a member of the project by sessionId', async () => {
    const mockContext = {
      user: 'testUser',
    };
    const mockProject = {
      createdBy: 'testUser',
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

    const result = await projectUpdateGuard.canActivate(execCtx);
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

    await expect(projectUpdateGuard.canActivate(execCtx)).rejects.toThrow(
      'Unauthorized to update project',
    );
  });
});
