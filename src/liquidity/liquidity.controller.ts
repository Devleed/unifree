import { Body, Controller, Get, Post, Param, Query } from '@nestjs/common';
import { CreateUserLiquidity } from './dto/create-user-liq.dto';
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
  addLiquidity(@Body() body: CreateUserLiquidity) {
    return this.liquidityService.addLiquidity(body);
  }

  @Get('/calculateEarnings')
  calculateEarnings(@Query() query: CalculateEarning) {
    return this.liquidityService.calculateEarning(query);
  }

  @Get('/remove')
  removeLiquidity(@Query() query: CalculateEarning) {
    return this.liquidityService.removeLiquidity(query);
  }

  @Get('/validate')
  async validateFeesPast() {
    return await this.liquidityService._checkLiq();
  }

  // @Get('/validatePresent')
  // validateFeesPresent() {
  //   return this.liquidityService.validateFeePerUnitLiquidatePresent();
  // }
}
