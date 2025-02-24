import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { join } from 'path';
import { AppService } from './app.service';
import { FileModule } from './file/file.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [UserModule],
      inject: [UserService],
      useFactory: async (userService: UserService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        playground: false,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        context: async ({ req }) => {
          const userId = parseInt(req.headers.userId);

          if (userId && (await userService.findUserById(userId))) {
            return { userId };
          }

          throw new GraphQLError('User does not exist', {
            extensions: {
              code: 'UNAUTHENTICATED',
              http: {
                statusCode: 401,
              },
            },
          });
        },
      }),
    }),
    FileModule,
    PrismaModule,
    ProjectModule,
    UserModule,
  ],
  providers: [AppService],
})
export class AppModule {}
