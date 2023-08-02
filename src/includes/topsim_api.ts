import { PHONG_THUY_API_URL } from './config';
import axios from "axios";
import { AppException, AppLogger, AppLogger as logger } from 'dth-core';
import moment from 'moment'

import Order from '../modules/order/models/order'
import { ESfindOne } from './elasticsearch'

const TopSimAPI = {
  async pushToTopSim(order: any, simInfo: any) {
    try {
      const listUrls      = order.browser_history ? order.browser_history.split("<br />") : []
      const url = `${process.env.TOPSIM_API}/opportunities/bulk-create`;
      const contentPost = {
        "source"           : 'Website',
        "type_order"       : "default",
        "customer_name"    : order.name,
        "customer_phone"   : order.phone,
        "sold_product"     : order.sim,
        "price"            : order.price,
        "customer_ip"      : order.ip,
        "customer_address" : order.address,
        "source_text"      : 'sim.vn',
        "request_client"   : order.other_option,
        "request_date"     : moment(order.created_at).format('YYYY-MM-DD HH:mm:ss'),
        "search_history"   : listUrls,
        "reference_url"    : "",
        "storeids"         : simInfo.s3 ? simInfo.s3 : [],
      }
      return await axios.post(url, [contentPost]);
    } catch(err) {
      logger.error(`[PUSH_TO_TOPSIM] ${err.stack}`);
    }
  },

  async processing (callback: any) {
    console.log(`===== START PUSH TO TOPSIM =====`);
    try {
      //query order
      let orderToPush = await Order.findOne({viewed: 0})
      if (!orderToPush) {
        return callback(10000);
      }
      const simInfo = await ESfindOne(orderToPush.sim)
      let data = await TopSimAPI.pushToTopSim(orderToPush, simInfo)
      if (data.data.status == 'success') {
        await Order.findOneAndUpdate({_id: orderToPush._id}, {viewed: 1})
      }
      AppLogger.info('Order Push To Topsim', orderToPush, data)
  
      return callback(5000);
    } catch (err) {
      console.log(err)
      AppLogger.info('Error Push To Topsim', err)
      console.log("Error CallBack before 5000")
      return callback(5000);
    }
  },
  runProcess (timeout: any) {
    setTimeout(function () {
      TopSimAPI.processing(TopSimAPI.runProcess);
    }, timeout);
  },

}


export default TopSimAPI;