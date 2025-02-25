import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ContributionStats {
  @Field()
  contributor: string;

  @Field(() => Int)
  contributions: number;
}
