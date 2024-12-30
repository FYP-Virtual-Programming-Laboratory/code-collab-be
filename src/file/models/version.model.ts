import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/models/user.model';
import { Change } from './change.model';

@ObjectType()
export class Version {
  @Field(() => Int)
  id: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => User)
  committedBy: User;

  @Field(() => [Change])
  changes: Change[];
}
