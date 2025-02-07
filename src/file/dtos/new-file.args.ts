import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class NewFileArgs {
  @Field(() => Int)
  projectId: number;

  @Field()
  filePath: string;

  @Field({
    nullable: true,
  })
  initialContent: string | null;
}
