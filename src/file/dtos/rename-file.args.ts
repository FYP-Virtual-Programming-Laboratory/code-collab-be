import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class RenameFileArgs {
  @Field()
  fileId: string;

  @Field()
  newName: string;
}
