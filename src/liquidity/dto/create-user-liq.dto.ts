export interface CreateUserLiquidity {
  user: string;
  amount0: number;
  amount1: number;
  poolAddress: string;
  token0: string;
  token1: string;
  tickLower: number;
  tickUpper: number;
  timeAdded: number;
}
