import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserLiquidity } from './liquidity.model';
import { UserLiquidityService } from './liquidity.service';

@Controller('liquidity')
export class UserLiquidityController {
  constructor(private readonly liquidityService: UserLiquidityService) {}

  @Get('/test')
  test() {
    return 'good';
  }

  @Get('/')
  getUsersLiquidity() {
    return this.liquidityService.getUsersLiquidity();
  }

  @Post('/add')
  addLiquidity(@Body() body: UserLiquidity) {
    return this.liquidityService.addLiquidity(body);
  }
}
