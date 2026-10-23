import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Option } from './option.entity'
import { OptionsController } from './options.controller'
import { OptionsService } from './options.service'

@Module({
  imports: [TypeOrmModule.forFeature([Option])],
  controllers: [OptionsController],
  providers: [OptionsService]
})
export class OptionsModule {}
