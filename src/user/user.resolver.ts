import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  async getUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findUserById(id);
  }

  @Query(() => [User])
  async getUsers(@Args('ids', { type: () => [Int] }) ids: number[]) {
    return this.userService.getUsers(ids);
  }
}
