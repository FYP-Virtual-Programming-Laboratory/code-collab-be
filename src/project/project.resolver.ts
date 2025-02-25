import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { CreateProjectArgs } from './dtos/create-project.args';
import { UpdateProjectArgs } from './dtos/update-project.args';
import { Project } from './models/project.model';
import { ProjectUpdateGuard } from './project-update.guard';
import { ProjectGuard } from './project.guard';
import { ProjectService } from './project.service';

@Resolver(() => Project)
@UseGuards(ProjectGuard)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @ResolveField()
  async contributions(@Parent() project: Project) {
    return this.projectService.getContributions(project.id);
  }

  @Query(() => Project, {
    nullable: true,
    description:
      'Find a project by its `id`. If `null` is returned, then the project could not be found.',
  })
  async getProject(@Args('id', { type: () => Int }) id: number) {
    return this.projectService.findProjectById(id);
  }

  @Query(() => Project, {
    nullable: true,
    description:
      'Find a project by its `sessionId`. If `null` is returned, then the project could not be found.',
  })
  async getProjectBySessionId(@Args('sessionId') sessionId: string) {
    return this.projectService.getProjectBySessionId(sessionId);
  }

  @Mutation(() => Project, {
    description: 'Create a new project.',
  })
  async createProject(
    @Args() { sessionId, name, members }: CreateProjectArgs,
    @Context('user') user: string,
  ) {
    return this.projectService.createProject(sessionId, user, name, members);
  }

  @Mutation(() => Boolean)
  @UseGuards(ProjectUpdateGuard)
  async updateProject(@Args() { id, sessionId, name }: UpdateProjectArgs) {
    if (!id && !sessionId) {
      throw new GraphQLError('Either `id` or `sessionId` must be provided.', {
        extensions: {
          code: 'BAD_USER_INPUT',
        },
      });
    }

    return this.projectService.updateProject(id || sessionId, { name });
  }

  @Mutation(() => Boolean)
  async addProjectMember(
    @Args('projectId', { type: () => Int }) projectId: number,
    @Args('user') user: string,
  ) {
    return this.projectService.addMember(projectId, user);
  }

  @Mutation(() => Boolean)
  async removeProjectMember(
    @Args('projectId', { type: () => Int }) projectId: number,
    @Args('user', { type: () => Int }) user: string,
  ) {
    return this.projectService.removeMember(projectId, user);
  }
}
