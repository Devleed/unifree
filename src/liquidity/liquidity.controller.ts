import { Body, Controller, Get, Post, Param, Query } from '@nestjs/common';
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

  @Get('/calculateEarnings')
  calculateEarnings(@Query() query: CalculateEarning) {
    return this.liquidityService.calculateEarning(query);
  }

  @Get('/validate')
  validateFeesPast() {
    return {
      past: this.liquidityService.validateFeePerUnitLiquidatePast(),
      present: this.liquidityService.validateFeePerUnitLiquidatePresent(),
    };
  }

  // @Get('/validatePresent')
  // validateFeesPresent() {
  //   return this.liquidityService.validateFeePerUnitLiquidatePresent();
  // }
}
