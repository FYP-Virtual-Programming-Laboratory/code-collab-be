import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class UpdateProjectArgs {
  @Field(() => Int, {
    nullable: true,
    description:
      'The ID of the project to update. Must be present if `sessionId` is not.',
  })
  id?: number;

  @Field({
    nullable: true,
    description:
      'The session ID of the project to update. Must be present if `id` is not.',
  })
  sessionId?: string;

  @Field()
  name: string;
}
