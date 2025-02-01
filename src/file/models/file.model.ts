import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Version } from './version.model';

@ObjectType()
export class File {
  @Field((type) => Int)
  id: number;

  @Field()
  path: string;

  @Field()
  content: string;

  @Field((type) => Int, {
    description: 'File size in bytes',
    nullable: true,
  })
  size: number;

  @Field((type) => Date)
  createdAt: Date;

  @Field((type) => Date)
  lastModified: Date;

  @Field((type) => [Version])
  versions: Version[];
}
