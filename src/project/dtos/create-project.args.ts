import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class CreateProjectArgs {
  @Field()
  sessionId: string;

  @Field()
  name: string;

  @Field(() => [String], {
    nullable: true,
    description:
      'List of users to add to the project. The creator id may not be added.',
  })
  members?: string[];
}
