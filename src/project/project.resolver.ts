import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { Project } from './models/project.model';
import { ProjectService } from './project.service';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @Query(() => Project)
  async getProject(@Args('id', { type: () => Int }) id: number) {
    return this.projectService.findProjectById(id);
  }
}
