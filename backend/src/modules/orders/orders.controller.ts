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
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { Order } from './order.entity'
import { OrdersService } from './orders.service'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /** 分页查询：GET /api/orders?pageNum=1&pageSize=15 */
  @Get()
  findPage(
    @Query('pageNum') pageNum = '1',
    @Query('pageSize') pageSize = '15'
  ): Promise<{ list: Order[]; total: number }> {
    const page = Math.max(1, Number(pageNum) || 1)
    const size = Math.min(100, Math.max(1, Number(pageSize) || 15))
    return this.ordersService.findPage(page, size)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(dto)
  }

  @Put(':id')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto
  ): Promise<Order> {
    return this.ordersService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ id: number }> {
    return this.ordersService.remove(id)
  }
}
