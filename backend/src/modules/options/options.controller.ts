import { Controller, Get, Param } from '@nestjs/common'
import { Option } from './option.entity'
import { OptionsService } from './options.service'

@Controller('options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  /** GET /api/options/material | supplier | staff */
  @Get(':type')
  findByType(@Param('type') type: string): Promise<Option[]> {
    return this.optionsService.findByType(type)
  }
}
