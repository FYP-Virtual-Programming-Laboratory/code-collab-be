import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Directory {
  @Field(() => Int)
  id: number;

  @Field()
  path: string;

  @Field(() => Int, { nullable: true })
  parentId: number;

  @Field((type) => Date)
  createdAt: Date;

  @Field((type) => Date)
  lastModified: Date;
}
