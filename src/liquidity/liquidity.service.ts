import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { throwError } from 'src/utils';
import { UserLiquidity } from './liquidity.model';

@Injectable()
export class UserLiquidityService {
  constructor(
    @InjectModel('liquidity') private liquidityModel: Model<UserLiquidity>,
  ) {}

  async getUsersLiquidity() {
    try {
      const data = await this.liquidityModel.find({});

      return data;
    } catch (error) {
      throwError(error, 'getUsersLiquidity');
    }
  }

  async addLiquidity(body: UserLiquidity) {
    try {
      const newData = await new this.liquidityModel(body).save();

      return newData;
    } catch (error) {
      throwError(error, 'addLiquidity');
    }
  }
}
