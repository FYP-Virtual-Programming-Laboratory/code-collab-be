import { Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';

@Resolver(() => User)
export class UserResolver {}
