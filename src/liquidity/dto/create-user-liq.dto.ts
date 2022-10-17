export interface CreateUserLiquidity {
  user: string;
  amount0: number;
  amount1: number;
  poolAddress: string;
  vaultAddress: string;
  token0: string;
  token1: string;
}
