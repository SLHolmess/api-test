import { Request } from "express";
import { query } from "express-validator";
import { AppController } from "dth-core";
import { Controller, Route } from "dth-core/decorators";
import axios from 'axios'
import { VALUATION_API_URL } from '../../includes/config'

@Controller({
  prefix: "/valuation",
})
export default class ValuationController extends AppController {
  @Route("GET /index", [
    query('sim').notEmpty().withMessage('Không được để trống số sim')
  ])
  async index(req: Request) {
    const sim = req.query.sim ? req.query.sim : ''
    const valuation = await axios.get(`${VALUATION_API_URL}?phone=${sim}`)
    return {valuation: valuation.data}
  }
}