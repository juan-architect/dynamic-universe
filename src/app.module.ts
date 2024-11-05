import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { PlanetsModule } from './planets/planets.module';
import { CharactersModule } from './characters/characters.module';
import { StarshipsModule } from './starships/starships.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'postgres'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Don't use in production
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 5000, // Cache expiration -> If using cache-manager v4, provide ttl in seconds v5, provide ttl in milliseconds
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      // The <ApolloDriverConfig> generic ensures that TypeScript knows about the specific configuration options available for the Apollo driver.
      autoSchemaFile: 'schema.gql',
      playground: true, // Enables GraphQL Playground so we don't need to use Swagger for this case
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
    }),
    PlanetsModule,
    CharactersModule,
    StarshipsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
