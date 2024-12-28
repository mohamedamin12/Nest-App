import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersServices } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthProvider } from "./auth.provider";
import { MailModule } from "src/mail/mail.module";


@Module({
  controllers: [UsersController],
  providers:[UsersServices  , AuthProvider],
  exports: [UsersServices],
  imports:[
    MailModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config : ConfigService) => {
        return {
          global: true,
          secret: config.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') },
        };
      }
    })
]
})
export class UsersModule{}