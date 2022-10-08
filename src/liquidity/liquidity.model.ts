import mongoose from 'mongoose';

export const LiquiditySchema = new mongoose.Schema({
  user: String,
  amount0: Number,
  amount1: Number,
  poolAddress: String,
  vaultAddress: String,
  liquidityBlock: Number,
  lpTokens: Number,
  feeEarning: {
    amount0: { type: Number, default: 0 },
    amount1: { type: Number, default: 0 },
  },
});

export interface UserLiquidity {
  user: string;
  amount0: number;
  amount1: number;
  poolAddress: string;
  vaultAddress: string;
  liquidityBlock: number;
  feeEarning: FeeEarning;
  lpTokens: number;
}

type FeeEarning = {
  amount0: number;
  amount1: number;
};

export interface CalculateEarning {
  userAddress: string;
  poolAddress: string;
  vaultAddress: string;
}
