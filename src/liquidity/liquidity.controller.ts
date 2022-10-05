import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserLiquidity, CalculateEarning } from './liquidity.model';
import { UserLiquidityService } from './liquidity.service';

@Controller('liquidity')
export class UserLiquidityController {
  constructor(private readonly liquidityService: UserLiquidityService) {}

  @Get('/')
  getUsersLiquidity() {
    return this.liquidityService.getUsersLiquidity();
  }

  @Post('/add')
  addLiquidity(@Body() body: UserLiquidity) {
    return this.liquidityService.addLiquidity(body);
  }

  @Post('/calculateEarnings')
  calculateEarnings(@Body() body: CalculateEarning) {
    return this.liquidityService.calculateEarning(body);
  }
}
