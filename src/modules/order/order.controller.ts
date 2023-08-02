import { Request, Response } from "express";
import { body } from "express-validator";
import { AppController } from "dth-core";
import { Controller, Route } from "dth-core/decorators";
import esb from "elastic-builder";
import { getElasticSearch, ESfindOne } from "../../includes/elasticsearch";
import Order from "./models/order";

@Controller({
  prefix: "/order",
})
export default class OrderController extends AppController {
  @Route("POST /place", [
    body('phone').notEmpty().withMessage('Không được để trống số liên hệ').matches(/((09|03|07|08|05)+([0-9]{8})\b)/g)
    .withMessage('Không đúng định dạng số điện thoại')
  ])
  async orderPlace(req: Request, res: Response) {
    const orderPost = req.body
    const sim = await ESfindOne(orderPost.sim)
    if (sim && !sim.d && !sim.d2 && !sim.hg) {
      let objOrder = {...req.body}
      objOrder.price = sim.pn
      objOrder.viewed = 0
      objOrder.ip = req.header('x-forwarded-for') ||  			
      req.socket.remoteAddress
      return await Order.create(objOrder)
    }
    return res.json({
      code: 401,
      success: false,
      message: 'Sim không tồn tại hoặc đã bán'
    })
  }
}