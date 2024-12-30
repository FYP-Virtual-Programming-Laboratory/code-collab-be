import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ContributionStats } from './contribution-stat.model';
import { File } from './file.model';

@ObjectType()
export class FileMeta extends File {
  @Field(() => [Int])
  contributorIds: number[];

  @Field(() => [ContributionStats])
  contributionStats: ContributionStats[];
}
