import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateProjectArgs } from './dtos/create-project.args';
import { Project } from './models/project.model';
import { ProjectService } from './project.service';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

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
    @Args() { sessionId, creatorId, name, memberIds }: CreateProjectArgs,
  ) {
    return this.projectService.createProject(
      sessionId,
      creatorId,
      name,
      memberIds,
    );
  }
}
