import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Version {
  @Field(() => Int)
  id: number;

  @Field()
  snapshot: string;

  @Field(() => Date)
  createdAt: Date;

  @Field()
  committedBy: string;
}
