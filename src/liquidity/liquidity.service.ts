import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { throwError } from 'src/utils';
import { UserLiquidity } from './liquidity.model';
import {
  getSqrtPriceX96,
  getLiquidityForAmounts,
} from '../utils/liquidityMath';
import axios from 'axios';
import bn from 'bignumber.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

const web3 = new Web3(
  'https://mainnet.infura.io/v3/6851b33c159a414894e722bfb82e916f',
);
const poolABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
    ],
    name: 'Burn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount0',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount1',
        type: 'uint128',
      },
    ],
    name: 'Collect',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount0',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount1',
        type: 'uint128',
      },
    ],
    name: 'CollectProtocol',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'paid0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'paid1',
        type: 'uint256',
      },
    ],
    name: 'Flash',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint16',
        name: 'observationCardinalityNextOld',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'uint16',
        name: 'observationCardinalityNextNew',
        type: 'uint16',
      },
    ],
    name: 'IncreaseObservationCardinalityNext',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160',
      },
      {
        indexed: false,
        internalType: 'int24',
        name: 'tick',
        type: 'int24',
      },
    ],
    name: 'Initialize',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24',
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
    ],
    name: 'Mint',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'feeProtocol0Old',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'feeProtocol1Old',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'feeProtocol0New',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'feeProtocol1New',
        type: 'uint8',
      },
    ],
    name: 'SetFeeProtocol',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amount0',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amount1',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'int24',
        name: 'tick',
        type: 'int24',
      },
    ],
    name: 'Swap',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'int24', name: 'tickLower', type: 'int24' },
      { internalType: 'int24', name: 'tickUpper', type: 'int24' },
      { internalType: 'uint128', name: 'amount', type: 'uint128' },
    ],
    name: 'burn',
    outputs: [
      { internalType: 'uint256', name: 'amount0', type: 'uint256' },
      { internalType: 'uint256', name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'int24', name: 'tickLower', type: 'int24' },
      { internalType: 'int24', name: 'tickUpper', type: 'int24' },
      {
        internalType: 'uint128',
        name: 'amount0Requested',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'amount1Requested',
        type: 'uint128',
      },
    ],
    name: 'collect',
    outputs: [
      { internalType: 'uint128', name: 'amount0', type: 'uint128' },
      { internalType: 'uint128', name: 'amount1', type: 'uint128' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      {
        internalType: 'uint128',
        name: 'amount0Requested',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'amount1Requested',
        type: 'uint128',
      },
    ],
    name: 'collectProtocol',
    outputs: [
      { internalType: 'uint128', name: 'amount0', type: 'uint128' },
      { internalType: 'uint128', name: 'amount1', type: 'uint128' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'factory',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fee',
    outputs: [{ internalType: 'uint24', name: '', type: 'uint24' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feeGrowthGlobal0X128',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feeGrowthGlobal1X128',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount0', type: 'uint256' },
      { internalType: 'uint256', name: 'amount1', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'flash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'observationCardinalityNext',
        type: 'uint16',
      },
    ],
    name: 'increaseObservationCardinalityNext',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint160', name: 'sqrtPriceX96', type: 'uint160' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'liquidity',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxLiquidityPerTick',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'int24', name: 'tickLower', type: 'int24' },
      { internalType: 'int24', name: 'tickUpper', type: 'int24' },
      { internalType: 'uint128', name: 'amount', type: 'uint128' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'mint',
    outputs: [
      { internalType: 'uint256', name: 'amount0', type: 'uint256' },
      { internalType: 'uint256', name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'observations',
    outputs: [
      { internalType: 'uint32', name: 'blockTimestamp', type: 'uint32' },
      { internalType: 'int56', name: 'tickCumulative', type: 'int56' },
      {
        internalType: 'uint160',
        name: 'secondsPerLiquidityCumulativeX128',
        type: 'uint160',
      },
      { internalType: 'bool', name: 'initialized', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint32[]', name: 'secondsAgos', type: 'uint32[]' },
    ],
    name: 'observe',
    outputs: [
      {
        internalType: 'int56[]',
        name: 'tickCumulatives',
        type: 'int56[]',
      },
      {
        internalType: 'uint160[]',
        name: 'secondsPerLiquidityCumulativeX128s',
        type: 'uint160[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'positions',
    outputs: [
      { internalType: 'uint128', name: 'liquidity', type: 'uint128' },
      {
        internalType: 'uint256',
        name: 'feeGrowthInside0LastX128',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthInside1LastX128',
        type: 'uint256',
      },
      { internalType: 'uint128', name: 'tokensOwed0', type: 'uint128' },
      { internalType: 'uint128', name: 'tokensOwed1', type: 'uint128' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'protocolFees',
    outputs: [
      { internalType: 'uint128', name: 'token0', type: 'uint128' },
      { internalType: 'uint128', name: 'token1', type: 'uint128' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'feeProtocol0', type: 'uint8' },
      { internalType: 'uint8', name: 'feeProtocol1', type: 'uint8' },
    ],
    name: 'setFeeProtocol',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'slot0',
    outputs: [
      { internalType: 'uint160', name: 'sqrtPriceX96', type: 'uint160' },
      { internalType: 'int24', name: 'tick', type: 'int24' },
      {
        internalType: 'uint16',
        name: 'observationIndex',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'observationCardinality',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'observationCardinalityNext',
        type: 'uint16',
      },
      { internalType: 'uint8', name: 'feeProtocol', type: 'uint8' },
      { internalType: 'bool', name: 'unlocked', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'int24', name: 'tickLower', type: 'int24' },
      { internalType: 'int24', name: 'tickUpper', type: 'int24' },
    ],
    name: 'snapshotCumulativesInside',
    outputs: [
      {
        internalType: 'int56',
        name: 'tickCumulativeInside',
        type: 'int56',
      },
      {
        internalType: 'uint160',
        name: 'secondsPerLiquidityInsideX128',
        type: 'uint160',
      },
      { internalType: 'uint32', name: 'secondsInside', type: 'uint32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'bool', name: 'zeroForOne', type: 'bool' },
      { internalType: 'int256', name: 'amountSpecified', type: 'int256' },
      {
        internalType: 'uint160',
        name: 'sqrtPriceLimitX96',
        type: 'uint160',
      },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'swap',
    outputs: [
      { internalType: 'int256', name: 'amount0', type: 'int256' },
      { internalType: 'int256', name: 'amount1', type: 'int256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'int16', name: '', type: 'int16' }],
    name: 'tickBitmap',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tickSpacing',
    outputs: [{ internalType: 'int24', name: '', type: 'int24' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'int24', name: '', type: 'int24' }],
    name: 'ticks',
    outputs: [
      {
        internalType: 'uint128',
        name: 'liquidityGross',
        type: 'uint128',
      },
      { internalType: 'int128', name: 'liquidityNet', type: 'int128' },
      {
        internalType: 'uint256',
        name: 'feeGrowthOutside0X128',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthOutside1X128',
        type: 'uint256',
      },
      {
        internalType: 'int56',
        name: 'tickCumulativeOutside',
        type: 'int56',
      },
      {
        internalType: 'uint160',
        name: 'secondsPerLiquidityOutsideX128',
        type: 'uint160',
      },
      { internalType: 'uint32', name: 'secondsOutside', type: 'uint32' },
      { internalType: 'bool', name: 'initialized', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token0',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token1',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const vaultABI = [
  {
    inputs: [
      { internalType: 'address', name: '_pool', type: 'address' },
      { internalType: 'address', name: '_unipilotFactory', type: 'address' },
      { internalType: 'address', name: '_WETH', type: 'address' },
      { internalType: 'address', name: 'governance', type: 'address' },
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'string', name: '_symbol', type: 'string' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
    ],
    name: 'CompoundFees',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'depositor',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'lpShares',
        type: 'uint256',
      },
    ],
    name: 'Deposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bool',
        name: 'isReadjustLiquidity',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fees0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fees1',
        type: 'uint256',
      },
    ],
    name: 'FeesSnapshot',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reserves0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reserves1',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fees0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fees1',
        type: 'uint256',
      },
    ],
    name: 'PullLiquidity',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
    ],
    name: 'Withdraw',
    type: 'event',
  },
  { stateMutability: 'payable', type: 'fallback' },
  {
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amount0Desired', type: 'uint256' },
      { internalType: 'uint256', name: 'amount1Desired', type: 'uint256' },
      { internalType: 'address', name: 'recipient', type: 'address' },
    ],
    name: 'deposit',
    outputs: [
      { internalType: 'uint256', name: 'lpShares', type: 'uint256' },
      { internalType: 'uint256', name: 'amount0', type: 'uint256' },
      { internalType: 'uint256', name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPositionDetails',
    outputs: [
      { internalType: 'uint256', name: 'amount0', type: 'uint256' },
      { internalType: 'uint256', name: 'amount1', type: 'uint256' },
      { internalType: 'uint256', name: 'fees0', type: 'uint256' },
      { internalType: 'uint256', name: 'fees1', type: 'uint256' },
      { internalType: 'uint128', name: 'baseLiquidity', type: 'uint128' },
      { internalType: 'uint128', name: 'rangeLiquidity', type: 'uint128' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVaultInfo',
    outputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint24', name: '', type: 'uint24' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'addedValue', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'init',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_operator', type: 'address' }],
    name: 'isOperator',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'nonces',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'uint8', name: 'v', type: 'uint8' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 's', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'recipient', type: 'address' }],
    name: 'pullLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'readjustLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rerange',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ticksData',
    outputs: [
      { internalType: 'int24', name: 'baseTickLower', type: 'int24' },
      { internalType: 'int24', name: 'baseTickUpper', type: 'int24' },
      { internalType: 'int24', name: 'rangeTickLower', type: 'int24' },
      { internalType: 'int24', name: 'rangeTickUpper', type: 'int24' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_operator', type: 'address' }],
    name: 'toggleOperator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amount0Owed', type: 'uint256' },
      { internalType: 'uint256', name: 'amount1Owed', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'uniswapV3MintCallback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'int256', name: 'amount0', type: 'int256' },
      { internalType: 'int256', name: 'amount1', type: 'int256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'uniswapV3SwapCallback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'liquidity', type: 'uint256' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'bool', name: 'refundAsETH', type: 'bool' },
    ],
    name: 'withdraw',
    outputs: [
      { internalType: 'uint256', name: 'amount0', type: 'uint256' },
      { internalType: 'uint256', name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
];

const erc20ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
];

@Injectable()
export class UserLiquidityService {
  constructor(
    @InjectModel('liquidity') private liquidityModel: Model<UserLiquidity>,
  ) {}

  async getUserLiquidity(userAddress: string) {
    return this.liquidityModel.find({ user: userAddress });
  }

  async addLiquidity(reqBody: UserLiquidity) {
    const body = {
      user: '0x2c73d3d4454DB9C0Dd4d81804212982b838E100A',
      poolAddress: '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
      vaultAddress: '0x1ae1df64bf695ea1f1a7ebdc280af712340f09a9',
      amount0: 1000,
      amount1: 1,
    };

    const poolContract = new web3.eth.Contract(poolABI, reqBody.poolAddress);
    const vaultContract = new web3.eth.Contract(vaultABI, reqBody.vaultAddress);

    const [
      { tick },
      { baseTickLower, baseTickUpper },
      token0,
      token1,
      blockNumber,
    ] = await Promise.all([
      poolContract.methods.slot0().call(),
      vaultContract.methods.ticksData().call(),
      poolContract.methods.token0().call(),
      poolContract.methods.token1().call(),
      web3.eth.getBlockNumber(),
    ]);

    // get tokens data
    const token0Data = new web3.eth.Contract(erc20ABI, token0);
    const token1Data = new web3.eth.Contract(erc20ABI, token1);

    // get tokens decimals
    const [token0Decimals, token1Decimals]: [string, string] =
      await Promise.all([
        token0Data.methods.decimals().call(),
        token1Data.methods.decimals().call(),
      ]);

    const sqrtPriceX96 = getSqrtPriceX96(tick, token0Decimals, token1Decimals);
    const sqrtPriceAX96 = getSqrtPriceX96(
      baseTickLower,
      token0Decimals,
      token1Decimals,
    );
    const sqrtPriceBX96 = getSqrtPriceX96(
      baseTickUpper,
      token0Decimals,
      token1Decimals,
    );

    const liquidity = getLiquidityForAmounts(
      sqrtPriceX96,
      sqrtPriceAX96,
      sqrtPriceBX96,
      reqBody.amount0,
      Number(token1Decimals),
      reqBody.amount1,
      Number(token0Decimals),
    );

    const { feesPerUnitLiq0, feesPerUnitLiq1 } =
      await this.calculateFeesPerUnitLiquidity(
        reqBody.poolAddress,
        reqBody.vaultAddress,
      );

    const userLiquidityExists = await this.liquidityModel.findOne({
      user: reqBody.user,
      poolAddress: reqBody.poolAddress,
      vaultAddress: reqBody.vaultAddress,
    });

    if (userLiquidityExists) {
      console.log('fees pr unit liq -', feesPerUnitLiq0);
      console.log(
        'fees pr unit liq old -',
        userLiquidityExists.feesPerUnitLiquidity.fees0,
      );

      const feesEarnedTillNow: [number, number] = [
        userLiquidityExists.liquidity *
          (feesPerUnitLiq0 - userLiquidityExists.feesPerUnitLiquidity.fees0),
        userLiquidityExists.liquidity *
          (feesPerUnitLiq1 - userLiquidityExists.feesPerUnitLiquidity.fees1),
      ];

      console.log('fees eearnned -', feesEarnedTillNow);

      userLiquidityExists.liquidity += liquidity.toNumber();

      userLiquidityExists.feesPerUnitLiquidity.fees0 = feesPerUnitLiq0;
      userLiquidityExists.feesPerUnitLiquidity.fees1 = feesPerUnitLiq1;

      userLiquidityExists.amount0 += reqBody.amount0;
      userLiquidityExists.amount1 += reqBody.amount1;

      userLiquidityExists.feeEarning.amount0 += feesEarnedTillNow[0];
      userLiquidityExists.feeEarning.amount1 += feesEarnedTillNow[1];

      userLiquidityExists.liquidityBlock = blockNumber;

      return await userLiquidityExists.save();
    }

    reqBody['liquidity'] = Number(liquidity.toString());
    reqBody['liquidityBlock'] = blockNumber;
    reqBody['feesPerUnitLiquidity'] = {
      fees0: feesPerUnitLiq0,
      fees1: feesPerUnitLiq1,
    };
    reqBody['lpTokens'] = Math.sqrt(reqBody.amount0 * reqBody.amount1);

    const userLiquidity = new this.liquidityModel(reqBody);
    return await userLiquidity.save();
  }

  async calculateEarning({ userAddress, poolAddress, vaultAddress }) {
    const User = await this.liquidityModel.findOne({
      User: userAddress,
      poolAddress,
      vaultAddress,
    });

    const { fees0, fees1 } = User.feesPerUnitLiquidity;

    const { feesPerUnitLiq0, feesPerUnitLiq1 } =
      await this.calculateFeesPerUnitLiquidity(
        User.poolAddress,
        User.vaultAddress,
      );

    console.log('old -', fees0, fees1);
    console.log('new -', feesPerUnitLiq0, feesPerUnitLiq1);

    User.feeEarning = {
      amount0: User.liquidity * (feesPerUnitLiq0 - fees0),
      amount1: User.liquidity * (feesPerUnitLiq1 - fees1),
    };

    User.feesPerUnitLiquidity = {
      fees0: feesPerUnitLiq0,
      fees1: feesPerUnitLiq1,
    };

    User['earningBlock'] = await web3.eth.getBlockNumber();

    return await User.save();
  }

  async calculateFeesPerUnitLiquidity(
    poolAddress: string,
    vaultAddress: string,
  ) {
    const poolContract = new web3.eth.Contract(poolABI, poolAddress);
    const vaultContract = new web3.eth.Contract(vaultABI, vaultAddress);

    // get calculation data
    const [
      token0GlobalFees,
      token1GlobalFees,
      { tick },
      { baseTickLower, baseTickUpper },
      token0,
      token1,
    ] = await Promise.all([
      poolContract.methods.feeGrowthGlobal0X128().call(),
      poolContract.methods.feeGrowthGlobal1X128().call(),
      poolContract.methods.slot0().call(),
      vaultContract.methods.ticksData().call(),
      poolContract.methods.token0().call(),
      poolContract.methods.token1().call(),
    ]);

    // get tokens data
    const token0Data = new web3.eth.Contract(erc20ABI, token0);
    const token1Data = new web3.eth.Contract(erc20ABI, token1);

    // get tokens decimals
    const [token0Decimals, token1Decimals]: [string, string] =
      await Promise.all([
        token0Data.methods.decimals().call(),
        token1Data.methods.decimals().call(),
      ]);

    // get lower and upper ticks
    let [lowerTick, upperTick] = await Promise.all([
      poolContract.methods.ticks(baseTickLower).call(),
      poolContract.methods.ticks(baseTickUpper).call(),
    ]);

    // check if ticks are initialized
    if (!lowerTick.initialized) {
      // if not get closest initialized tick id
      const newLowerTickIdx = await this.returnValidatedTick(
        baseTickLower,
        'lower',
        poolAddress,
      );

      // fetch tick data for validated tick id
      lowerTick = await poolContract.methods.ticks(newLowerTickIdx).call();
    }
    // repeat same process for upper tick
    if (!upperTick.initialized) {
      const newUpperTickIdx = await this.returnValidatedTick(
        baseTickUpper,
        'upper',
        poolAddress,
      );

      upperTick = await poolContract.methods.ticks(newUpperTickIdx).call();
    }

    // extract fee growth values from tick data
    const {
      feeGrowthOutside0X128: feesGrowthOutsideLower0,
      feeGrowthOutside1X128: feesGrowthOutsideLower1,
    } = lowerTick;

    const {
      feeGrowthOutside0X128: feesGrowthOutsideUpper0,
      feeGrowthOutside1X128: feesGrowthOutsideUpper1,
    } = upperTick;

    // calculate fees between ticks
    /**
     * fr = fg - fa(il) - fb(iu)
     * il = lower tick
     * iu = upper tick
     * fg = global fees
     * fa = fees above
     * fb = fees below
     */
    const feesPerUnitLiq0 = new bn(token0GlobalFees)
      .minus(
        this.calculateFeesBelow(
          tick,
          baseTickLower,
          feesGrowthOutsideLower0,
          token0GlobalFees,
        ).plus(
          this.calculateFeesAbove(
            tick,
            baseTickUpper,
            feesGrowthOutsideUpper0,
            token0GlobalFees,
          ),
        ),
      )
      .div(new bn(2).pow(128));

    const feesPerUnitLiq1 = new bn(token1GlobalFees)
      .minus(
        this.calculateFeesBelow(
          tick,
          baseTickLower,
          feesGrowthOutsideLower1,
          token1GlobalFees,
        ).plus(
          this.calculateFeesAbove(
            tick,
            baseTickUpper,
            feesGrowthOutsideUpper1,
            token1GlobalFees,
          ),
        ),
      )
      .div(new bn(2).pow(128));

    return {
      feesPerUnitLiq0: Number(
        feesPerUnitLiq0.div(new bn(10).pow(token0Decimals)).toString(),
      ),
      feesPerUnitLiq1: Number(
        feesPerUnitLiq1.div(new bn(10).pow(token1Decimals)).toString(),
      ),
    };
  }

  calculateFeesAbove(
    currentTick: string,
    upperTick: string,
    feesGrowthOutside: bn,
    feesGrowthGlobal: bn,
  ) {
    return new bn(
      Number(currentTick) >= Number(upperTick)
        ? feesGrowthGlobal.minus(feesGrowthOutside)
        : feesGrowthOutside,
    );
  }

  calculateFeesBelow(
    currentTick: string,
    lowerTick: string,
    feesGrowthOutside: bn,
    feesGrowthGlobal: bn,
  ) {
    return new bn(
      Number(currentTick) >= Number(lowerTick)
        ? feesGrowthOutside
        : feesGrowthGlobal.minus(feesGrowthOutside),
    );
  }

  async returnValidatedTick(tick: string, type: string, poolAddress: string) {
    try {
      const query = `{
        ticks(
          where:{
            poolAddress: "${poolAddress.toLowerCase()}",
            liquidityNet_not: 0,
            tickIdx_${type === 'lower' ? 'g' : 'l'}t: ${tick}
          }
          orderBy: tickIdx
          orderDirection: ${type === 'lower' ? 'asc' : 'desc'}) {
            tickIdx
          }
        }`;

      const { data } = await axios.post(
        'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
        { query },
      );

      return data.data.ticks[0].tickIdx;
    } catch (error) {
      return tick;
    }
  }

  getEvents(eventName: string, contractInstance: any, liquidityBlock: number) {
    return contractInstance.getPastEvents(eventName, {
      fromBlock: liquidityBlock,
      toBlock: 'latest',
    });
  }

  validateFeePerUnitLiquidatePast() {
    const feesPerUnitLiq0 = new bn('908482733654628266673472628918031').minus(
      new bn(
        Number(197959) >= Number(197640)
          ? new bn('429596515394247903975740295448039')
          : new bn('908482733654628266673472628918031').minus(
              new bn('429596515394247903975740295448039'),
            ),
      ).plus(
        new bn(
          Number(197959) >= Number(198960)
            ? new bn('908482733654628266673472628918031').minus(
                new bn('301168967743049198297982222314425'),
              )
            : new bn('301168967743049198297982222314425'),
        ),
      ),
    );
    // .div(new bn(2).pow(128));

    console.log('fee -', feesPerUnitLiq0.toString());

    return feesPerUnitLiq0.toString();
  }

  validateFeePerUnitLiquidatePresent() {
    const feesPerUnitLiq0 = new bn('2741121578289278401784866037683222').minus(
      new bn(
        Number(204394) >= Number(197640)
          ? new bn('1383717631670994827413360514879678')
          : new bn('2741121578289278401784866037683222').minus(
              new bn('1383717631670994827413360514879678'),
            ),
      ).plus(
        new bn(
          Number(204394) >= Number(198960)
            ? new bn('2741121578289278401784866037683222').minus(
                new bn('1734368711749661705640501362416568'),
              )
            : new bn('1734368711749661705640501362416568'),
        ),
      ),
    );
    // .div(new bn(2).pow(128));

    console.log('fee -', feesPerUnitLiq0.toString());

    return feesPerUnitLiq0.toString();
  }
}
