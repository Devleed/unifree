import { Injectable, NotFoundException } from '@nestjs/common';
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
import { CreateUserLiquidity } from './dto/create-user-liq.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

const web3 = new Web3(
  'https://mainnet.infura.io/v3/6851b33c159a414894e722bfb82e916f',
);
const goerliWeb3 = new Web3(
  'https://goerli.infura.io/v3/80ba3747876843469bf0c36d0a355f71',
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

const uniswapMathABI = [
  {
    inputs: [
      { internalType: 'uint160', name: 'sqrtRatioAX96', type: 'uint160' },
      { internalType: 'uint160', name: 'sqrtRatioBX96', type: 'uint160' },
      { internalType: 'uint256', name: 'amount0', type: 'uint256' },
    ],
    name: 'getLiquidityForAmount0',
    outputs: [{ internalType: 'uint128', name: 'liquidity', type: 'uint128' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint160', name: 'sqrtRatioAX96', type: 'uint160' },
      { internalType: 'uint160', name: 'sqrtRatioBX96', type: 'uint160' },
      { internalType: 'uint256', name: 'amount1', type: 'uint256' },
    ],
    name: 'getLiquidityForAmount1',
    outputs: [{ internalType: 'uint128', name: 'liquidity', type: 'uint128' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint160', name: 'sqrtRatioX96', type: 'uint160' },
      { internalType: 'uint160', name: 'sqrtRatioAX96', type: 'uint160' },
      { internalType: 'uint160', name: 'sqrtRatioBX96', type: 'uint160' },
      { internalType: 'uint256', name: 'amount0', type: 'uint256' },
      { internalType: 'uint256', name: 'amount1', type: 'uint256' },
    ],
    name: 'getLiquidityForAmounts',
    outputs: [{ internalType: 'uint128', name: 'liquidity', type: 'uint128' }],
    stateMutability: 'pure',
    type: 'function',
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

  async addLiquidity(_reqBody: CreateUserLiquidity) {
    console.log(_reqBody);

    const poolContract = new web3.eth.Contract(poolABI, _reqBody.poolAddress);

    const [{ tick }, token0, token1, feeTier, blockNumber] = await Promise.all([
      poolContract.methods.slot0().call(),
      poolContract.methods.token0().call(),
      poolContract.methods.token1().call(),
      poolContract.methods.fee().call(),
      web3.eth.getBlockNumber(),
    ]);

    if (token0.toLowerCase() !== _reqBody.token0.toLowerCase()) {
      const changedAmounts = [_reqBody.amount1, _reqBody.amount0];
      const changedTokens = [_reqBody.token1, _reqBody.token0];

      _reqBody.token0 = changedTokens[0];
      _reqBody.token1 = changedTokens[1];

      _reqBody.amount0 = changedAmounts[0];
      _reqBody.amount1 = changedAmounts[1];
    }

    // get tokens data
    const token0Data = new web3.eth.Contract(erc20ABI, token0);
    const token1Data = new web3.eth.Contract(erc20ABI, token1);

    // get tokens decimals
    const [token0Decimals, token1Decimals]: [string, string] =
      await Promise.all([
        token0Data.methods.decimals().call(),
        token1Data.methods.decimals().call(),
      ]);

    const sqrtPriceX96 = getSqrtPriceX96(
      this.tickToPrice(tick),
      token0Decimals,
      token1Decimals,
    );
    const sqrtPriceAX96 = getSqrtPriceX96(
      this.tickToPrice(_reqBody.tickLower),
      token0Decimals,
      token1Decimals,
    );
    const sqrtPriceBX96 = getSqrtPriceX96(
      this.tickToPrice(_reqBody.tickUpper),
      token0Decimals,
      token1Decimals,
    );

    const liquidity = getLiquidityForAmounts(
      sqrtPriceX96.decimalPlaces(0, 1),
      sqrtPriceAX96.decimalPlaces(0, 1),
      sqrtPriceBX96.decimalPlaces(0, 1),
      _reqBody.amount0,
      Number(token1Decimals),
      _reqBody.amount1,
      Number(token0Decimals),
    );

    const { feesPerUnitLiq0, feesPerUnitLiq1 } =
      await this.calculateFeesPerUnitLiquidity(
        _reqBody.poolAddress,
        _reqBody.tickLower,
        _reqBody.tickUpper,
      );

    const userLiquidityExists = await this.liquidityModel.findOne({
      user: _reqBody.user,
      poolAddress: _reqBody.poolAddress,
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

      userLiquidityExists.amount0 += _reqBody.amount0;
      userLiquidityExists.amount1 += _reqBody.amount1;

      userLiquidityExists.feeEarning.amount0 += feesEarnedTillNow[0];
      userLiquidityExists.feeEarning.amount1 += feesEarnedTillNow[1];

      userLiquidityExists.liquidityBlock = blockNumber;

      return await userLiquidityExists.save();
    }

    _reqBody['liquidity'] = parseInt(liquidity.toString());
    _reqBody['liquidityBlock'] = blockNumber;
    _reqBody['feesPerUnitLiquidity'] = {
      fees0: feesPerUnitLiq0,
      fees1: feesPerUnitLiq1,
    };
    _reqBody['lpTokens'] = Math.sqrt(_reqBody.amount0 * _reqBody.amount1);
    _reqBody['feeTier'] = parseInt(feeTier);

    console.log('final req body -', _reqBody);

    const userLiquidity = new this.liquidityModel(_reqBody);
    return await userLiquidity.save();
  }

  async removeLiquidity({ userAddress, poolAddress }) {
    try {
      const userLiquidity = await this.liquidityModel.findOne({
        user: userAddress,
        poolAddress,
      });

      if (!userLiquidity) throw new NotFoundException('No liquidity found');

      userLiquidity.liquidity = 0;

      return await userLiquidity.save();
    } catch (error) {
      console.log('error removing liq -', error);

      throw error;
    }
  }

  async calculateEarning({ userAddress, poolAddress }) {
    const User = await this.liquidityModel.findOne({
      User: userAddress,
      poolAddress,
    });

    if (User.liquidity > 0) {
      const { fees0, fees1 } = User.feesPerUnitLiquidity;

      const { feesPerUnitLiq0, feesPerUnitLiq1 } =
        await this.calculateFeesPerUnitLiquidity(
          User.poolAddress,
          User.tickLower,
          User.tickUpper,
        );

      User.feeEarning.amount0 += User.liquidity * (feesPerUnitLiq0 - fees0);
      User.feeEarning.amount1 += User.liquidity * (feesPerUnitLiq1 - fees1);

      User.feesPerUnitLiquidity = {
        fees0: feesPerUnitLiq0,
        fees1: feesPerUnitLiq1,
      };

      User['earningBlock'] = await web3.eth.getBlockNumber();

      return await User.save();
    }

    return User;
  }

  async calculateFeesPerUnitLiquidity(
    poolAddress: string,
    tickLower: number,
    tickUpper: number,
  ) {
    const poolContract = new web3.eth.Contract(poolABI, poolAddress);

    // get calculation data
    const [token0GlobalFees, token1GlobalFees, { tick }, token0, token1] =
      await Promise.all([
        poolContract.methods.feeGrowthGlobal0X128().call(),
        poolContract.methods.feeGrowthGlobal1X128().call(),
        poolContract.methods.slot0().call(),
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
      poolContract.methods.ticks(tickLower).call(),
      poolContract.methods.ticks(tickUpper).call(),
    ]);

    // check if ticks are initialized
    if (!lowerTick.initialized) {
      // if not get closest initialized tick id
      const newLowerTickIdx = await this.returnValidatedTick(
        String(tickLower),
        'lower',
        poolAddress,
      );

      // fetch tick data for validated tick id
      lowerTick = await poolContract.methods.ticks(newLowerTickIdx).call();
    }
    // repeat same process for upper tick
    if (!upperTick.initialized) {
      const newUpperTickIdx = await this.returnValidatedTick(
        String(tickUpper),
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
          String(tickLower),
          feesGrowthOutsideLower0,
          token0GlobalFees,
        ).plus(
          this.calculateFeesAbove(
            tick,
            String(tickUpper),
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
          String(tickLower),
          feesGrowthOutsideLower1,
          token1GlobalFees,
        ).plus(
          this.calculateFeesAbove(
            tick,
            String(tickUpper),
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
    // const feesPerUnitLiq0 = new bn('2741121578289278401784866037683222').minus(
    //   new bn(
    //     Number(204394) >= Number(197640)
    //       ? new bn('1383717631670994827413360514879678')
    //       : new bn('2741121578289278401784866037683222').minus(
    //           new bn('1383717631670994827413360514879678'),
    //         ),
    //   ).plus(
    //     new bn(
    //       Number(204394) >= Number(198960)
    //         ? new bn('2741121578289278401784866037683222').minus(
    //             new bn('1734368711749661705640501362416568'),
    //           )
    //         : new bn('1734368711749661705640501362416568'),
    //     ),
    //   ),
    // );
    // // .div(new bn(2).pow(128));

    // console.log('fee -', feesPerUnitLiq0.toString());

    // return feesPerUnitLiq0.toString();
    return this._checkLiq();
  }

  private tickToPrice(tick: string | number) {
    return Math.pow(1.0001, Number(tick));
  }

  async _checkLiq() {
    const uniswapMathContract = new goerliWeb3.eth.Contract(
      uniswapMathABI,
      '0xB663216d69C09221AC4aA5A6e7da928Bf60e13c7',
    );

    const sqrtPriceX96 = getSqrtPriceX96(1.0001 ** 198251, '6', '18');
    const sqrtPriceAX96 = getSqrtPriceX96(1.0001 ** 197870, '6', '18');
    const sqrtPriceBX96 = getSqrtPriceX96(1.0001 ** 198760, '6', '18');

    console.log(
      sqrtPriceX96.decimalPlaces(0, 1).toString(),
      sqrtPriceAX96.decimalPlaces(0, 1).toString(),
      sqrtPriceBX96.decimalPlaces(0, 1).toString(),
    );

    const liq = await uniswapMathContract.methods
      .getLiquidityForAmounts(
        sqrtPriceX96.decimalPlaces(0, 1),
        sqrtPriceAX96.decimalPlaces(0, 1),
        sqrtPriceBX96.decimalPlaces(0, 1),
        '32576642',
        '9999999928841578',
      )
      .call();

    const liquidity = getLiquidityForAmounts(
      sqrtPriceX96,
      sqrtPriceAX96,
      sqrtPriceBX96,
      32.576642,
      6,
      0.009999999928841577,
      18,
    );

    console.log({
      liquidity,
      liq,
    });

    return {
      liq,
      liquidity: liquidity.toString(),
    };
  }
}
