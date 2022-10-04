import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LiquiditySchema } from './liquidity.model';
import { UserLiquidityController } from './liquidity.controller';
import { UserLiquidityService } from './liquidity.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'liquidity', schema: LiquiditySchema }]),
  ],
  controllers: [UserLiquidityController],
  providers: [UserLiquidityService],
  exports: [UserLiquidityService],
})
export class LiquidityModule {}
