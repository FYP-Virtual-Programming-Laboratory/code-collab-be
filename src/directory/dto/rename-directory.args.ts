import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class RenameDirectoryArgs {
  @Field(() => Int)
  id: number;

  @Field()
  newName: string;
}
