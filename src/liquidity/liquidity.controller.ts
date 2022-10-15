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

  @Get('/add')
  addLiquidity(@Body() body: UserLiquidity) {
    return this.liquidityService.addLiquidity(body);
  }

  @Get('/calculateEarnings')
  calculateEarnings(@Body() body: CalculateEarning) {
    return this.liquidityService.calculateEarning(body);
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
