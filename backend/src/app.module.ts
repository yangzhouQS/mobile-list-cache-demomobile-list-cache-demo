import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SeedService } from './database/seed.service'
import { Option } from './modules/options/option.entity'
import { OptionsModule } from './modules/options/options.module'
import { Order } from './modules/orders/order.entity'
import { OrdersModule } from './modules/orders/orders.module'
import { Stock } from './modules/stocks/stock.entity'
import { StocksModule } from './modules/stocks/stocks.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH ?? 'data/app.db',
      entities: [Order, Stock, Option],
      // 演示项目：由实体自动同步表结构
      synchronize: true
    }),
    // SeedService 位于根模块：在此注册它需要的仓库（各业务模块内已有各自的 forFeature）
    TypeOrmModule.forFeature([Order, Stock, Option]),
    OrdersModule,
    StocksModule,
    OptionsModule
  ],
  providers: [SeedService]
})
export class AppModule {}
