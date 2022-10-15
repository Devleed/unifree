import mongoose from 'mongoose';

export const LiquiditySchema = new mongoose.Schema({
  user: String,
  amount0: Number,
  amount1: Number,
  poolAddress: String,
  vaultAddress: String,
  liquidityBlock: Number,
  earningBlock: Number,
  lpTokens: Number,
  feeEarning: {
    amount0: { type: Number, default: 0 },
    amount1: { type: Number, default: 0 },
  },
  feesPerUnitLiquidity: {
    fees0: { type: Number, default: 0 },
    fees1: { type: Number, default: 0 },
  },
  liquidity: Number,
});

export interface UserLiquidity {
  user: string;
  amount0: number;
  amount1: number;
  amount0Real: number;
  amount1Real: number;
  poolAddress: string;
  vaultAddress: string;
  liquidityBlock: number;
  earningBlock: number;
  feeEarning: FeeEarning;
  feesPerUnitLiquidity: FeePerEarningLiquidity;
  liquidity: number;
}

type FeeEarning = {
  amount0: number;
  amount1: number;
};

type FeePerEarningLiquidity = {
  fees0: number;
  fees1: number;
};

export interface CalculateEarning {
  userAddress: string;
  poolAddress: string;
  vaultAddress: string;
}
