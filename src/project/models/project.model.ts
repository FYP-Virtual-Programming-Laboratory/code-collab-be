import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Project {
  @Field((type) => Int)
  id: number;

  @Field()
  sessionId: string;

  @Field()
  name: string;

  @Field()
  yDocUpdates: string;

  @Field((type) => Date)
  createdAt: Date;

  @Field()
  createdBy: string;

  @Field()
  members: string[];
}
