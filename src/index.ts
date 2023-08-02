import 'reflect-metadata'
import { AppLogger, AppServer } from 'dth-core';
import MongoProvider from './includes/mongo';

//Controller
import MainController from './modules/main.controller'
import SearchController from './modules/search/search.controller'
import UserController from './modules/user/user.controller'
import PhongThuyController from './modules/phong-thuy/phong-thuy.controller'
import ValuationController from './modules/valuation/valuation.controller'
import OrderController from './modules/order/order.controller'
import SeoController from './modules/seo/seo.controller'
import CategoryController from './modules/category/category.controller'
import PriceController from './modules/price/price.controller'
import TelcoController from './modules/telco/telco.controller'
import DetailController from './modules/detail/detail.controller'
import SettingController from './modules/setting/setting.controller';

import TopSimAPI from './includes/topsim_api'

(async () => {
  await MongoProvider.connect();

  const server = new AppServer({ debug: process.env.DEBUG === 'true' });

  server.imports([
    MainController,
    UserController,
    SearchController,
    PhongThuyController,
    ValuationController,
    OrderController,
    SeoController,
    CategoryController,
    PriceController,
    TelcoController,
    DetailController,
    SettingController
  ]);

  await TopSimAPI.processing(TopSimAPI.runProcess)

  // if (process.env.NODE_ENV !== 'production') server.imports([ DevController ]);

  // Run API
  server.run(<number><unknown>process.env.PORT || 4000);
})();


process.on('SIGTERM', (signal) => {
  console.info(`SIGTERM signal received. ${signal}`);
});



