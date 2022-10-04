import mongoose from 'mongoose';

export const LiquiditySchema = new mongoose.Schema({
  user: String,
  amount0: Number,
  amount1: Number,
  poolAddress: String,
  vaultAddress: String,
  liquidityBlock: Number,
});

export interface UserLiquidity {
  user: string;
  amount0: number;
  amount1: number;
  poolAddress: string;
  vaultAddress: string;
  liquidityBlock: number;
}
