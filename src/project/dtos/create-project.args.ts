import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class CreateProjectArgs {
  @Field()
  sessionId: string;

  @Field(() => Int)
  creatorId: number;

  @Field()
  name: string;

  @Field(() => [Int], {
    nullable: true,
    description:
      'List of user IDs to add to the project. The creator id may not be added.',
  })
  memberIds?: number[];
}
