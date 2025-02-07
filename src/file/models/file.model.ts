import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Contributions } from './contributions';

@ObjectType()
export class File {
  @Field(() => Int)
  id: number;

  @Field()
  path: string;

  @Field()
  content: string;

  @Field(() => Int, {
    description: 'File size in bytes',
    nullable: true,
  })
  size: number;

  @Field((type) => Date)
  createdAt: Date;

  @Field((type) => Date)
  lastModified: Date;

  @Field(() => Contributions)
  contributions: Contributions;
}
