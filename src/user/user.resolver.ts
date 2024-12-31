import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User, {
    nullable: true,
    description:
      'Find a user by `id`. Returns null if user with specified `id` cannot be found.',
  })
  async getUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findUserById(id);
  }

  @Query(() => [User], {
    description:
      'Find multiple users by their `id`s. Returns only the users it finds.',
  })
  async getUsers(@Args('ids', { type: () => [Int] }) ids: number[]) {
    return this.userService.getUsers(ids);
  }
}
