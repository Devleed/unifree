import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { throwError } from 'src/utils';
import { UserLiquidity } from './liquidity.model';
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
    console.log(userAddress);
    return this.liquidityModel.find({ user: userAddress });
  }

  async addLiquidity(body: UserLiquidity) {
    const vaultQuery = `{
          vault(id:"${body.vaultAddress.toLowerCase()}") {
            baseTickLower
            baseTickUpper
          }
        }`;

    try {
      const {
        data: { data },
      } = await axios.post(
        'https://api.thegraph.com/subgraphs/name/unipilotvoirstudio/unipilot-v2-stats',
        {
          query: vaultQuery,
        },
      );

      console.log('vault -', data);

      const tickQuery = `
        {
          ticks(where:{poolAddress:"${body.poolAddress.toLowerCase()}", tickIdx_gt:${
        data.vault.baseTickLower
      }, tickIdx_lt:${data.vault.baseTickUpper}, liquidityNet_gt:0}) {
            tickIdx
            feeGrowthOutside0X128
            feeGrowthOutside1X128
          }
        }
    `;

      const {
        data: {
          data: { ticks },
        },
      } = await axios.post(
        'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
        {
          query: tickQuery,
        },
      );

      console.log('ticks -', ticks);

      // const userLiquidity = await this.liquidityModel.findOne({
      //   user: body.user,
      //   vaultAddress: body.vaultAddress,
      //   poolAddress: body.poolAddress,
      // });

      // // adding liquidity in new pool
      // const currentBlock = await web3.eth.getBlockNumber();

      // if (userLiquidity) {
      //   // adding liquidity in same pool

      //   // calculate the fees earning till yet
      //   const fees = await this.calculateEarning({
      //     userAddress: userLiquidity.user,
      //     poolAddress: userLiquidity.poolAddress,
      //     vaultAddress: userLiquidity.vaultAddress,
      //   });

      //   // add the earned fees and added liquidity in user's current liquidity
      //   userLiquidity.amount0 += fees.fees0 + body.amount0;
      //   userLiquidity.amount1 += fees.fees1 + body.amount1;

      //   // update the block
      //   userLiquidity.liquidityBlock = currentBlock;

      //   userLiquidity.lpTokens = Math.sqrt(
      //     userLiquidity.amount0 * userLiquidity.amount1,
      //   );

      //   // save updated liquidity
      //   return await userLiquidity.save();
      // }

      // body.liquidityBlock = currentBlock;
      // body.lpTokens = Math.sqrt(body.amount0 * body.amount1);

      // const newData = await new this.liquidityModel(body).save();
      // return newData;
    } catch (error) {
      throwError(error, 'addLiquidity');
    }
  }

  async calculateEarning({ userAddress, poolAddress, vaultAddress }) {
    const User = await this.liquidityModel.findOne({
      user: userAddress,
      poolAddress,
      vaultAddress,
    });

    const Contract = new web3.eth.Contract(poolABI, User.poolAddress);

    let blockRanges = [];
    blockRanges.push(User.liquidityBlock);

    //fetching add and remove liquidty events
    const [mintEvents, burnEvents] = await Promise.all([
      this.getEvents('Mint', Contract, User.liquidityBlock),
      this.getEvents('Burn', Contract, User.liquidityBlock),
    ]);

    [...mintEvents, ...burnEvents].forEach(({ blockNumber }) =>
      blockRanges.push(blockNumber),
    );

    blockRanges = [...new Set([...blockRanges])];

    blockRanges.sort();
    //[1,4,9,15]

    const poolDataPromises = [];
    const vaultDataPromises = [];

    blockRanges.forEach((block) => {
      poolDataPromises.push(
        axios.post(
          'https://api.thegraph.com/subgraphs/name/devleed/uniswappools',
          {
            query: `
      {
        pools(block:{number: ${block}}, where:{id : "${User.poolAddress}"}) {
          id
          reserves0
          reserves1
          feeTier
          collectedFees0
          collectedFees1
        }
      }
      `,
          },
        ),
      );

      vaultDataPromises.push(
        axios.post(
          'https://api.thegraph.com/subgraphs/name/unipilotvoirstudio/unipilot-v2-stats',
          {
            query: `
        {
          vaults(block:{number: ${block}} where:{id:"${User.vaultAddress}"}) {
            fee0invested
            fee1invested
            fee0Uninvested
            fee1Uninvested
            rangeLiquidity
            baseLiquidity
            totalLiquidity
            totalLockedToken0
            totalLockedToken1
          }
        }
        `,
          },
        ),
      );
    });

    const poolDataResolve: any = await Promise.all(poolDataPromises);
    const vaultDataResolve: any = await Promise.all(vaultDataPromises);

    let userEarnedFeesA = 0;
    let userEarnedFeesB = 0;

    for (let i = 0; i < poolDataResolve.length; i++) {
      if (i !== poolDataResolve.length - 1) {
        // current pool and vault data
        const poolData = poolDataResolve[i].data.data.pools[0];
        const vaultData = vaultDataResolve[i].data.data.vaults[0];

        // next pools data
        const poolDataForward = poolDataResolve[i + 1].data.data.pools[0];

        // user, pool and vault liauidity in ETH
        const poolLiquidity = poolData.reserves0 * poolData.reserves1;
        const vaultLiquidity =
          vaultData.totalLockedToken0 * vaultData.totalLockedToken1;
        const userLiquidity = User.amount0 * User.amount1;

        // pool's fees earning between current block ranges
        const poolFeesEarnedA =
          poolDataForward.collectedFees0 - poolData.collectedFees0;
        const poolFeesEarnedB =
          poolDataForward.collectedFees1 - poolData.collectedFees1;

        // vault's share in pool
        // calculated by formula: (vault Liduidity + user's fake liquidity) / (pool liquidity + user's fake liquidity)
        const vaultShareInPool =
          (vaultLiquidity + userLiquidity) / (poolLiquidity + userLiquidity);

        // user's share in vault
        // calculated by formula: user's liquidity / (vault's liquidity + user's liquidity)
        const userShareInVault =
          userLiquidity / (vaultLiquidity + userLiquidity);

        // vault earned fees
        const vaultEarnedFeesA = poolFeesEarnedA * vaultShareInPool;
        const vaultEarnedFeesB = poolFeesEarnedB * vaultShareInPool;

        console.log(vaultEarnedFeesA, vaultEarnedFeesB);

        // user earned fees
        userEarnedFeesA += vaultEarnedFeesA * userShareInVault;
        userEarnedFeesB += vaultEarnedFeesB * userShareInVault;
      }
    }

    User.feeEarning.amount0 = userEarnedFeesA;
    User.feeEarning.amount1 = userEarnedFeesB;

    await User.save();

    return {
      fees0: userEarnedFeesA,
      fees1: userEarnedFeesB,
    };
  }

  async feesMath() {
    const POOL_ADDRESS = '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8';
    const VAULT_ADDRESS = '0x1ae1df64bf695ea1f1a7ebdc280af712340f09a9';

    const poolContract = new web3.eth.Contract(poolABI, POOL_ADDRESS);
    const vaultContract = new web3.eth.Contract(vaultABI, VAULT_ADDRESS);

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
        POOL_ADDRESS,
      );

      // fetch tick data for validated tick id
      lowerTick = await poolContract.methods.ticks(newLowerTickIdx).call();
    }
    // repeat same process for upper tick
    if (!upperTick.initialized) {
      const newUpperTickIdx = await this.returnValidatedTick(
        baseTickUpper,
        'upper',
        POOL_ADDRESS,
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
    const feesBetweenTicks0 = new bn(token0GlobalFees)
      .minus(
        this.calculateFeesBelow(
          tick,
          baseTickLower,
          feesGrowthOutsideLower0,
          token0GlobalFees,
        ).minus(
          this.calculateFeesAbove(
            tick,
            baseTickUpper,
            feesGrowthOutsideUpper0,
            token0GlobalFees,
          ),
        ),
      )
      .div(new bn(2).pow(128));

    const feesBetweenTicks1 = new bn(token1GlobalFees)
      .minus(
        this.calculateFeesBelow(
          tick,
          baseTickLower,
          feesGrowthOutsideLower1,
          token1GlobalFees,
        ).minus(
          this.calculateFeesAbove(
            tick,
            baseTickUpper,
            feesGrowthOutsideUpper1,
            token1GlobalFees,
          ),
        ),
      )
      .div(new bn(2).pow(128));

    console.log({
      token0GlobalFees,
      token1GlobalFees,
      tick,
      baseTickLower,
      baseTickUpper,
      feesGrowthOutsideLower0,
      feesGrowthOutsideLower1,
      feesGrowthOutsideUpper0,
      feesGrowthOutsideUpper1,
      feesBetweenTicks0: feesBetweenTicks0
        .div(new bn(10).pow(token0Decimals))
        .toString(),
      feesBetweenTicks1: feesBetweenTicks1
        .div(new bn(10).pow(token1Decimals))
        .toString(),
      token0,
      token1,
    });
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

      console.log(query);

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
}
