import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class CreateDirectoryArgs {
  @Field(() => Int)
  projectId: number;

  @Field()
  path: string;
}
