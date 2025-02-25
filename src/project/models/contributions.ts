import { Field, ObjectType } from '@nestjs/graphql';
import { ContributionStats } from './contribution-stat.model';

@ObjectType()
export class Contributions {
  @Field(() => [String])
  contributors: string[];

  @Field(() => [ContributionStats])
  contributionStats: ContributionStats[];
}
