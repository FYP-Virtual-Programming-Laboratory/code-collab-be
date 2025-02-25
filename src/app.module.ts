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

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      context: async ({ req }) => {
        const user = req.headers.user as string;

        if (!user) {
          throw new GraphQLError('No user specified', {
            extensions: {
              code: 'UNAUTHENTICATED',
              http: {
                statusCode: 401,
              },
            },
          });
        }

        return { user };
      },
    }),
    FileModule,
    PrismaModule,
    ProjectModule,
  ],
  providers: [AppService],
})
export class AppModule {}
