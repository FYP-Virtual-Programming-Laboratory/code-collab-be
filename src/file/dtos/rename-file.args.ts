import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class RenameFileArgs {
  @Field(() => Int)
  fileId: number;

  @Field()
  newName: string;
}
