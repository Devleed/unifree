/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const poolABI = require('./poolAbi.json');

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async calculateEarning(userAddress) {
    const User = {
      liquidityBlock: 15667197,
      amount0: 1000 * 10 ** 6,
      amount1: 1 * 10 ** 18,
      poolAddress: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
      vaultAddress: '0x1ae1df64bf695ea1f1a7ebdc280af712340f09a9',
    };

    const web3 = new Web3(
      'https://mainnet.infura.io/v3/6851b33c159a414894e722bfb82e916f',
    );

    const Contract = new web3.eth.Contract(poolABI, User.poolAddress);

    let blockRanges = [];
    blockRanges.push(User.liquidityBlock);

    //fetching add liquidty events
    const mintEvents = await Contract.getPastEvents('Mint', {
      fromBlock: User.liquidityBlock,
      toBlock: 'latest',
    });
    //fetching remove liquity events
    const burnEvents = await Contract.getPastEvents('Burn', {
      fromBlock: User.liquidityBlock,
      toBlock: 'latest',
    });

    mintEvents.forEach(({ blockNumber }) => blockRanges.push(blockNumber));
    burnEvents.forEach(({ blockNumber }) => blockRanges.push(blockNumber));

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

    return {
      fees0: userEarnedFeesA,
      fees1: userEarnedFeesB,
    };
  }
}
