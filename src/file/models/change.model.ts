import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/models/user.model';

@ObjectType()
export class Change {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  versionId: number;

  @Field(() => User)
  madeBy: User;

  @Field(() => String)
  content: string;

  @Field(() => Int)
  lineNumber: number;

  @Field(() => Int)
  position: number;

  @Field(() => String)
  operation: string;
}
