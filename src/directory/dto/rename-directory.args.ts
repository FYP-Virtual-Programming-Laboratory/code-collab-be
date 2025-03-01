import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class RenameDirectoryArgs {
  @Field()
  id: string;

  @Field()
  newName: string;
}
