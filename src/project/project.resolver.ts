import { Args, Int, Query, Resolver } from '@nestjs/graphql';
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
}
