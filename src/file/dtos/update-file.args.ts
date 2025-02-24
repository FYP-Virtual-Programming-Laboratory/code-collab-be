import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class UpdateFileArgs {
  @Field(() => Int)
  fileId: number;

  @Field()
  newContent: string;

  @Field(() => Int)
  projectId: number;

  @Field({
    description: 'Yjs document updates in base64 format',
  })
  yDocUpdates: string;

  @Field({
    description: 'Yjs snapshot in base64 format',
  })
  snapshot: string;
}
