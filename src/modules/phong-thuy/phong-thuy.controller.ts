import { Request } from "express";
import { AppController } from "dth-core";
import { Controller, Route } from "dth-core/decorators";
import { body, query } from "express-validator";
import PhongThuyAPI from "../../includes/phong_thuy_api"
import moment from 'moment';

@Controller({
  prefix: "/phong-thuy",
})
export default class PhongThuyController extends AppController {
  @Route("GET /")
  async index(req: Request) {
    let objPhongThuy:any = {
      'listSim'      : [],
      'title'        : 'Sim Phong Thuỷ',
      'viewMoreText' : 'Xem Thêm',
      'crumbs'       : [{
        path: 'sim-phong-thuy',
        title: 'Sim Phong Thủy'
      }]
    }
    return {
      'code'      : 200,
      'success'   : true,
      'message'   : 'Success',
      'phongThuy' : objPhongThuy
    }
  }

  @Route("GET /search-sim", [
    query('birth_date').notEmpty().withMessage('Ngày sinh không được để trống'),
    query('birth_time').notEmpty().withMessage('Giờ sinh không được để trống'),
    query('sex').notEmpty().withMessage('Giờ sinh không được để trống')
  ])
  async searchSim(req: Request) {
    const name = req.query.name ? req.query.name : ''
    let birthDate:any = req.query.birth_date ? req.query.birth_date : ''
    const birthtime:any = req.query.birth_time ? req.query.birth_time : ''
    let sex:any = req.query.sex ? req.query.sex : ''
    sex = sex.toLowerCase() == 'nam' ? 1 : 0
    const gioPhutSinh = birthtime.split(":")
    birthDate =  moment(birthDate).format('DD-MM-YYYY');
    const searchData = {
      ho_ten: name,
      ngay_sinh: birthDate,
      gio_sinh: gioPhutSinh[0],
      phut_sinh: gioPhutSinh[1],
      gioi_tinh: sex,
      sid: '4039,8888'
    }
    console.log(searchData)
    let dataPhongThuy = await PhongThuyAPI.searchSim(searchData)
    return dataPhongThuy.data
  }

  @Route("GET /boi-sim", [
    query('birth_date').notEmpty().withMessage('Ngày sinh không được để trống'),
    query('birth_time').notEmpty().withMessage('Giờ sinh không được để trống'),
    query('sex').notEmpty().withMessage('Giờ sinh không được để trống'),
    query('sim').notEmpty().withMessage('Số sim không được để trống'),
    query('name').notEmpty().withMessage('Tên không được để trống'),
  ]
  )
  async boiSim(req: Request) {
    const name = req.query.name ? req.query.name : ''
    const sim = req.query.sim ? req.query.sim : ''
    let birthDate:any = req.query.birth_date ? req.query.birth_date : ''
    const birthtime:any = req.query.birth_time ? req.query.birth_time : ''
    let sex:any = req.query.sex ? req.query.sex : ''
    sex = sex.toLowerCase() == 'nam' ? 1 : 0
    const gioPhutSinh = birthtime.split(":")
    birthDate =  moment(birthDate).format('DD-MM-YYYY');
    const searchData = {
      ho_ten: name,
      ngay_sinh: birthDate,
      gio_sinh: gioPhutSinh[0],
      phut_sinh: gioPhutSinh[1],
      gioi_tinh: sex,
      so_sim: sim
    }
    let dataBoisim = await PhongThuyAPI.boiSim(searchData)

    return dataBoisim.data
  }
}