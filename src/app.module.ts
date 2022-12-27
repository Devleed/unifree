import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LiquidityModule } from './liquidity/liquidity.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://devleed:unipaperKarachi12@maincluster.7zkgows.mongodb.net/?retryWrites=true&w=majority',
      {
        dbName: 'Unipaper',
      },
    ),
    LiquidityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
