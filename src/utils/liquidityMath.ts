import bn from 'bignumber.js';

const Q96 = new bn(2).pow(96);

function expandDecimals(n: number | string | bn, exp: number): bn {
  return new bn(n).multipliedBy(new bn(10).pow(exp));
}

const mulDiv = (a: bn, b: bn, multiplier: bn) => {
  return a.multipliedBy(b).div(multiplier);
};

// for calculation detail, please visit README.md (Section: Calculation Breakdown, No. 2)
const getLiquidityForAmount0 = (
  sqrtRatioAX96: bn,
  sqrtRatioBX96: bn,
  amount0: bn,
): bn => {
  // amount0 * (sqrt(upper) * sqrt(lower)) / (sqrt(upper) - sqrt(lower))
  const intermediate = mulDiv(sqrtRatioBX96, sqrtRatioAX96, Q96); // √
  return mulDiv(amount0, intermediate, sqrtRatioBX96.minus(sqrtRatioAX96));
};

const getLiquidityForAmount1 = (
  sqrtRatioAX96: bn,
  sqrtRatioBX96: bn,
  amount1: bn,
): bn => {
  // amount1 / (sqrt(upper) - sqrt(lower))
  return mulDiv(amount1, Q96, sqrtRatioBX96.minus(sqrtRatioAX96));
};

export const getSqrtPriceX96 = (
  price: number,
  token0Decimal: string,
  token1Decimal: string,
): bn => {
  const token0 = expandDecimals(price, Number(token0Decimal)); // 1000 * 10**6
  const token1 = expandDecimals(1, Number(token1Decimal)); // 1 * 10**18
  // return mulDiv(encodePriceSqrt(token1), Q96, encodePriceSqrt(token0)).div(
  //   new bn(2).pow(96)
  // );
  return token0.div(token1).sqrt().multipliedBy(new bn(2).pow(96));

  // √(token_0 / token_1) * 2^96
};

export const getLiquidityForAmounts = (
  sqrtRatioX96: bn,
  sqrtRatioAX96: bn,
  sqrtRatioBX96: bn,
  _amount0: number,
  amount0Decimal: number,
  _amount1: number,
  amount1Decimal: number,
): bn => {
  const amount0 = expandDecimals(_amount0, amount0Decimal);
  const amount1 = expandDecimals(_amount1, amount1Decimal);

  let liquidity: bn;
  if (sqrtRatioX96.lte(sqrtRatioAX96)) {
    liquidity = getLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0);
  } else if (sqrtRatioX96.lt(sqrtRatioBX96)) {
    const liquidity0 = getLiquidityForAmount0(
      sqrtRatioX96,
      sqrtRatioBX96,
      amount0,
    );
    const liquidity1 = getLiquidityForAmount1(
      sqrtRatioAX96,
      sqrtRatioX96,
      amount1,
    );

    liquidity = bn.min(liquidity0, liquidity1);
  } else {
    liquidity = getLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1);
  }

  return liquidity;
};
