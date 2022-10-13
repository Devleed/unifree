import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { UserLiquidity, CalculateEarning } from './liquidity.model';
import { UserLiquidityService } from './liquidity.service';

@Controller('liquidity')
export class UserLiquidityController {
  constructor(private readonly liquidityService: UserLiquidityService) {}

  @Get('/getUserLiquidity/:userAddress')
  async getUserLiquidity(@Param('userAddress') userAddress: string) {
    return this.liquidityService.getUserLiquidity(userAddress);
  }

  @Post('/add')
  addLiquidity(@Body() body: UserLiquidity) {
    return this.liquidityService.addLiquidity(body);
  }

  @Post('/calculateEarnings')
  calculateEarnings(@Body() body: CalculateEarning) {
    return this.liquidityService.calculateEarning(body);
  }

  @Get('/fees')
  feeMath() {
    return this.liquidityService.feesMath();
  }
}
