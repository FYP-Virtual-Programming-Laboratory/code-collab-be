import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class DeleteFileArgs {
  @Field()
  fileId: string;
}
