import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class UpdateFileArgs {
  @Field(() => Int)
  fileId: number;

  @Field()
  newContent: string;
}
