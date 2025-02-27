import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class DeleteFileArgs {
  @Field(() => Int)
  fileId: number;
}
