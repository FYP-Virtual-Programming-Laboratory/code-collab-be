import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/models/user.model';

@ObjectType()
export class Project {
  @Field((type) => Int)
  id: number;

  @Field()
  name: string;

  @Field((type) => Date)
  createdAt: Date;

  @Field((type) => User)
  createdBy: User;

  @Field((type) => [User])
  members: User[];
}
