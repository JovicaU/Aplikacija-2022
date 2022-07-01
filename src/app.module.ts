import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfiguration } from 'config/database.configuration';
import { Entity } from 'typeorm';
import { Administrator } from './entities/administrator.entity';
import { AdministratorService } from './services/administrator/administrator.service';
import { ArticleFeature } from './entities/article-feature.entity';
import { ArticlePrice } from './entities/article-price.entity';
import { Article } from './entities/article.entity';
import { CartArticle } from './entities/cart-article.entity';
import { Cart } from './entities/cart.entity';
import { Category } from './entities/category.entity';
import { Feature } from './entities/feature.entity';
import { Order } from './entities/order.entity';
import { Photo } from './entities/photo.entity';
import { User } from './entities/user.entity';
import { AdministratorController } from './controllers/api/administrator.controler';
import { CategoryController } from './controllers/api/category.controller';
import { CategoryService } from './services/category/category.service';
import { ArticleService } from './services/article/article.service';
import { ArticleController } from './controllers/api/article.controller';
import { AuthController } from './controllers/api/auth.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { PhotoService } from './services/photo/photo.service';
import { FeatureService } from './services/feature/feature.service';
import { FeatureController } from './controllers/api/feature.controller';
import { UserService } from './services/user/user.service';
import { CartService } from './services/cart/cart.service';
import { UserCartController } from './controllers/api/user.cart.controler';
import { OrderService } from './services/order/order.service';
import {MailerModule} from '@nestjs-modules/mailer';
import { MailConfig } from 'config/mail.config';
import { OrderMailer } from './services/order/order.mailer.service';
import { AdminOrderController } from './controllers/api/administrator.order.controller';
import { UserToken } from './entities/user-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DatabaseConfiguration.hostname,
      port: 3306,
      username: DatabaseConfiguration.username,
      password: DatabaseConfiguration.password,
      database: DatabaseConfiguration.database,
      entities: [
        Administrator,
        ArticleFeature,
        ArticlePrice,
        Article,
        CartArticle,
        Cart,
        Category,
        Feature,
        Order,
        Photo,
        User,
        UserToken,
      ]
    }),
    TypeOrmModule.forFeature([
      Administrator,
      ArticleFeature,
      ArticlePrice,
      Article,
      CartArticle,
      Cart,
      Category,
      Feature,
      Order,
      Photo,
      User,
      UserToken,       
      
    ]),
    MailerModule.forRoot({
      transport: {
        host: MailConfig.hostname,
        port: 587,
        secure: false,
        auth: {
          user: MailConfig.username,
          pass: MailConfig.password,
        },
        tls:{
          rejectUnauthorized:false
        }
      },
      defaults: {
        from: MailConfig.senderEmail,
      },
    }),
  ],
  controllers: [
    AdministratorController,
    AppController,
    CategoryController,
    ArticleController,
    AuthController,
    FeatureController,
    UserCartController,
    AdminOrderController,
  ],
  providers: [
    AdministratorService,
    CategoryService,
    ArticleService,
    PhotoService,
    FeatureService,
    UserService,
    CartService,
    OrderService,
    OrderMailer,
  ],
  exports:[
    AdministratorService,
    UserService,
    CartService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
consumer
.apply(AuthMiddleware)
.exclude('auth/*')
.forRoutes('api/*');
  }
}
