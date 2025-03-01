import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Directory {
  @Field()
  id: string;

  @Field()
  path: string;

  @Field({ nullable: true })
  parentId: string;

  @Field((type) => Date)
  createdAt: Date;

  @Field((type) => Date)
  lastModified: Date;
}
