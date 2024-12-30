import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ContributionStats {
  @Field(() => Int)
  contributorId: number;

  @Field(() => Int)
  contributions: number;
}
