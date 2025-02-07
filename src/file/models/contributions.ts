import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ContributionStats } from './contribution-stat.model';

@ObjectType()
export class Contributions {
  @Field(() => [Int])
  contributorIds: number[];

  @Field(() => [ContributionStats])
  contributionStats: ContributionStats[];
}
