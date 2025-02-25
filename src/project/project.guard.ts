import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { Observable } from 'rxjs';
import { ProjectService } from './project.service';

@Injectable()
export class ProjectGuard implements CanActivate {
  constructor(private projectService: ProjectService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const execCtx = GqlExecutionContext.create(context);
    const ctx = execCtx.getContext();
    const { id, sessionId } = execCtx.getArgs();

    const hasAccess = (project?: { members: string[] }) => {
      const isAccessible = project?.members?.includes(ctx.user);

      if (!isAccessible) {
        throw new GraphQLError('Unauthorized to access project', {
          extensions: {
            description:
              'You do not have access to this project. Ask the project owner to add you as a member.',
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
