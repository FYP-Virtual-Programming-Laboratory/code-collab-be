import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { Observable } from 'rxjs';
import { ProjectService } from './project.service';

@Injectable()
export class ProjectUpdateGuard implements CanActivate {
  constructor(private projectService: ProjectService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const execCtx = GqlExecutionContext.create(context);
    const ctx = execCtx.getContext();
    const { id, sessionId } = execCtx.getArgs();

    const hasAccess = (project?: { createdBy: string }) => {
      const isAccessible = project?.createdBy === ctx.user;

      if (!isAccessible) {
        throw new GraphQLError('Unauthorized to update project', {
          extensions: {
            description: 'You do not have access to update this project.',
          },
        });
      }

      return isAccessible;
    };

    return !!id
      ? this.projectService.findProjectById(id).then(hasAccess)
      : this.projectService.getProjectBySessionId(sessionId).then(hasAccess);
  }
}
