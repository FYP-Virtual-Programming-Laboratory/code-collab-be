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
import { Contributions } from './models/contributions';
import { Project } from './models/project.model';
import { ProjectService } from './project.service';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @ResolveField(() => Contributions)
  async contributions(@Parent() project: Project) {
    return this.projectService.getContributions(project.id);
  }

  @Query(() => Project, {
    nullable: true,
    description:
      'Find a project by its `id`. If `null` is returned, then the project could not be found.',
  })
  async getProject(
    @Args('id', { type: () => Int }) id: number,
    @Context('user') user: string,
  ) {
    this.projectService.assertAccess(user, id);
    return this.projectService.findProjectById(id);
  }

  @Query(() => Project, {
    nullable: true,
    description:
      'Find a project by its `sessionId`. If `null` is returned, then the project could not be found.',
  })
  async getProjectBySessionId(
    @Args('sessionId') sessionId: string,
    @Context('user') user: string,
  ) {
    this.projectService.assertAccess(user, sessionId);
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
  async updateProject(
    @Args() { id, sessionId, name }: UpdateProjectArgs,
    @Context('user') user: string,
  ) {
    if (!id && !sessionId) {
      throw new GraphQLError('Either `id` or `sessionId` must be provided.', {
        extensions: {
          code: 'BAD_USER_INPUT',
        },
      });
    }

    this.projectService.assertAccess(user, id || sessionId);
    this.projectService.assertOwner(user, id || sessionId);
    return this.projectService.updateProject(id || sessionId, { name });
  }

  @Mutation(() => Boolean)
  async addProjectMember(
    @Args('projectId', { type: () => Int }) projectId: number,
    @Args('user') user: string,
    @Context('user') currentUser: string,
  ) {
    this.projectService.assertAccess(currentUser, projectId);
    this.projectService.assertOwner(currentUser, projectId);
    return this.projectService.addMember(projectId, user);
  }

  @Mutation(() => Boolean)
  async removeProjectMember(
    @Args('projectId', { type: () => Int }) projectId: number,
    @Args('user') user: string,
    @Context('user') currentUser: string,
  ) {
    this.projectService.assertAccess(currentUser, projectId);
    this.projectService.assertOwner(currentUser, projectId);
    return this.projectService.removeMember(projectId, user);
  }

  @Mutation(() => Boolean)
  async updateProjectDoc(
    @Args('projectId', { type: () => Int }) projectId: number,
    @Args('doc', {
      description: 'A base64 encoded string of the project yjs document.',
    })
    doc: string,
    @Context('user') user: string,
  ) {
    try {
      this.projectService.assertAccess(user, projectId);
      await this.projectService.storeYDoc(projectId, doc);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
