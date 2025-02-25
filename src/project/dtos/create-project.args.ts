import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class CreateProjectArgs {
  @Field()
  sessionId: string;

  @Field()
  createdBy: string;

  @Field()
  name: string;

  @Field({
    nullable: true,
    description:
      'List of user IDs to add to the project. The creator id may not be added.',
  })
  members?: string[];
}
