import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { CreateStockDto } from './dto/create-stock.dto'
import { UpdateStockDto } from './dto/update-stock.dto'
import { Stock } from './stock.entity'
import { StocksService } from './stocks.service'

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  /** 分页查询：GET /api/stocks?pageNum=1&pageSize=15 */
  @Get()
  findPage(
    @Query('pageNum') pageNum = '1',
    @Query('pageSize') pageSize = '15'
  ): Promise<{ list: Stock[]; total: number }> {
    const page = Math.max(1, Number(pageNum) || 1)
    const size = Math.min(100, Math.max(1, Number(pageSize) || 15))
    return this.stocksService.findPage(page, size)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Stock> {
    return this.stocksService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateStockDto): Promise<Stock> {
    return this.stocksService.create(dto)
  }

  @Put(':id')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockDto
  ): Promise<Stock> {
    return this.stocksService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ id: number }> {
    return this.stocksService.remove(id)
  }
}
