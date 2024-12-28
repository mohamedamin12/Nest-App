import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/products.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/users.entity';
import { Review } from './reviews/reviews.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UploadModule } from './uploads/uploads.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ProductsModule,
    UsersModule,
    ReviewsModule,
    UploadModule,
    MailModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          host: 'localhost',
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          synchronize: process.env.NODE_ENV !== 'production',
          entities: [Product , User , Review],
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.development`,
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass:ClassSerializerInterceptor
    }
  ],
})
export class AppModule {}
