import { Request, Response } from "express";
import { AppController, AppException } from "dth-core";
import { Controller, Route } from "dth-core/decorators";
import { body, query, param } from "express-validator";
import SeoStaticConfig from './models/seo-static.model'
import { NotFoundException } from "../../includes/exceptions";

import { seoConfigStatues, seoConfigCategories, productCategories } from '../../includes/params'
import AuthProvider from "../../includes/auth";
import SeoProductConfig from "./models/seo-product.model";

@Controller({
  prefix: "/seo",
})
export default class SeoController extends AppController {

  @Route('GET /static-configs/view')
  async viewConfigDetail(req: Request) {
    let { link } = req.query;
    if (link !== '/') link = (link as string).substring(1)

    const seoConfig = await SeoStaticConfig.findOne({ link, status: 2 }); // status === 2 => published

    return seoConfig;
  }
  
  @Route('POST /static-configs', [
    body('category')
      .notEmpty().withMessage('Vui lòng nhập danh mục cấu hình')
      .isIn(seoConfigCategories.map(cat => cat.value)).withMessage('Dữ liệu không hợp lệ')
      .toInt(),
    body('status')
      .notEmpty().withMessage('Vui lòng nhập trạng thái cấu hình')
      .isIn(seoConfigStatues.map(cat => cat.value)).withMessage('Dữ liệu không hợp lệ')
      .toInt(),
    body('link')
      .notEmpty().withMessage('Vui lòng nhập đường dẫn'),
    body('title').notEmpty().withMessage('Vui lòng nhập nội dung tiêu đề cho đường dẫn'),
    AuthProvider.requireAuth()
  ])
  async create(req: Request & any ) {
    const seoConfig = new SeoStaticConfig({
      title: req.body.title,
      detail: req.body.detail,
      status: req.body.status ? req.body.status : 0,
      category: req.body.category,
      link: req.body.link,
      related_links: req.body.related_links ? JSON.parse(req.body.related_links): undefined,
      image: req.body.image ? req.body.image: '',
      description: req.body.description ? req.body.description: '',
      h1: req.body.h1 ? req.body.h1: '',
    })

    await seoConfig.save()
    return seoConfig;
  }

  @Route('GET /static-configs', [
    query('limit').optional().isNumeric().withMessage('Limit không đúng định dạng'),
    query('page').optional().isNumeric().withMessage('Page không đúng định dạng'),
    query('category').optional(),
    query('status').optional(),
    query('link').optional(),
    AuthProvider.requireAuth()
  ])
  async list(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1)*limit;

    const criterias: any = {};
    const { category, status, link } = req.query;

    if (category) criterias.category = category;
    if (status) criterias.status = status;
    if (link) criterias.link = new RegExp(link as string, 'gi');
    
    const [seoStaticConfigs, total] = await Promise.all([
      SeoStaticConfig.find(criterias)
        .limit(limit)
        .skip(skip)
        .sort({_id: -1 }),
      SeoStaticConfig.countDocuments(criterias)
    ]);

    return res.json({
      success: true,
      data: seoStaticConfigs,
      meta: { page, limit, total }
    });
  }

  @Route('GET /static-configs/:id', [
    param('id').isMongoId().withMessage('Id không đúng định dạng'),
    AuthProvider.requireAuth()
  ])
  async detail(req: Request, res: Response) {
    const seoStaticConfig: any = await SeoStaticConfig.findById(req.params.id)

    if (!seoStaticConfig) throw new NotFoundException({ post: req.params.id })

    return seoStaticConfig
  }

  @Route('PUT /static-configs/:id', [
    body('category')
      .optional()
      .isIn(seoConfigCategories.map(cat => cat.value)).withMessage('Dữ liệu không hợp lệ')
      .toInt(),
    body('status')
      .optional()
      .isIn(seoConfigStatues.map(cat => cat.value)).withMessage('Dữ liệu không hợp lệ')
      .toInt(),
    body('link')
      .optional(),
    body('title').optional(),
    AuthProvider.requireAuth()
  ])
  async update(req: Request & any) {
    const seoConfig = await SeoStaticConfig.findById(req.params.id)
    if (!seoConfig) throw new NotFoundException({ post: req.params.id })

    if (req.body.hasOwnProperty('status')) seoConfig.status = req.body.status;
    if (req.body.hasOwnProperty('category')) seoConfig.category = req.body.category;
    if (req.body.hasOwnProperty('link')) seoConfig.link = req.body.link;
    if (req.body.hasOwnProperty('title')) seoConfig.title = req.body.title;
    if (req.body.hasOwnProperty('detail')) seoConfig.detail = req.body.detail;
    if (req.body.hasOwnProperty('description')) seoConfig.description = req.body.description;
    if (req.body.hasOwnProperty('related_links')) seoConfig.related_links = JSON.parse(req.body.related_links);
    if (req.body.hasOwnProperty('image')) seoConfig.image = req.body.image;
    if (req.body.hasOwnProperty('h1')) seoConfig.h1 = req.body.h1;

    await seoConfig.save()

    return seoConfig
  }

  @Route('DELETE /static-configs/:id', [
    param('id').isMongoId().withMessage('Id không đúng định dạng'),
    AuthProvider.requireAuth()
  ])
  async delete(req: Request & any) {
    const seoConfig = await SeoStaticConfig.findById(req.params.id)

    if (!seoConfig) throw new NotFoundException({ seoConfig: req.params.id });

    await seoConfig.remove();

    return
  }

  // SEO Config for products
  @Route('GET /product-configs/view')
  viewProductConfigs() {

  }

  @Route('GET /product-configs', [
    AuthProvider.requireAuth()
  ])
  async getProductConfigs(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1)*limit;

    const criterias: any = {};
    const { category, status, link, title, h1, priceFrom, priceTo } = req.query;

    if (category) criterias.category = category;
    if (status) criterias.status = status;
    if (priceFrom) criterias.priceFrom = priceFrom;
    if (priceTo) criterias.priceTo = priceTo;
    if (link) criterias.link = new RegExp(link as string, 'gi');
    if (title) criterias.title = new RegExp(title as string, 'gi');
    if (h1) criterias.h1 = new RegExp(h1 as string, 'gi');
    

    const [seoProductConfigs, total] = await Promise.all([
      SeoProductConfig
        .find(criterias)
        .limit(limit)
        .skip(skip)
        .sort({_id: -1 }),
      SeoProductConfig.countDocuments(criterias),
    ]);

    return res.json({
      success: true,
      data: seoProductConfigs,
      meta: { limit, page, total }
    });
  }

  @Route('GET /product-configs/:id', [
    AuthProvider.requireAuth()
  ])
  async getProductConfigDetail(req: Request) {
    const seoProductConfig = await SeoProductConfig.findById(req.params.id);
    if (!seoProductConfig) {
      throw new NotFoundException('Không tìm thấy cấu hình SEO cho sản phẩm');
    }

    return seoProductConfig;
  }

  @Route('POST /product-configs', [
    body('category')
      .notEmpty().withMessage('Danh mục không được trống')
      .isString().withMessage('Dữ liệu không hợp lệ'),
    body('category.*')
      .isIn(productCategories.map(pCat => pCat.id)).withMessage('Dữ liệu không hợp lệ').toInt(),
    body('priceFrom')
    .optional().isInt().withMessage('Dữ liệu không hợp lệ').toInt(),
    body('priceTo')
      .optional().isInt().withMessage('Dữ liệu không hợp lệ').toInt(),

    body('status')
      .notEmpty().withMessage('Vui lòng nhập trạng thái cấu hình')
      .isIn(seoConfigStatues.map(cat => cat.value)).withMessage('Dữ liệu không hợp lệ')
      .toInt(),
    body('title').notEmpty().withMessage('Vui lòng nhập tiêu đề sản phẩm'),
    AuthProvider.requireAuth()
  ])
  async createProductConfig(req: Request) {
    if(req.body.category == "0") { 
      const resDefault = await SeoProductConfig.findOne({category: "0"});
      if(resDefault) return "SEO mặc định đã tồn tại"
    }

    const seoConfig = new SeoProductConfig({
      status: req.body.status ? req.body.status : 0,
      category: req.body.category,
      priceFrom: req.body.priceFrom,
      priceTo: req.body.priceTo,
      title: req.body.title,
      description: req.body.description ? req.body.description: '',
      h1: req.body.h1 ? req.body.h1: ''
    });

    if (parseInt(req.body.priceFrom) > parseInt(req.body.priceTo)) {
      throw new AppException('400', 'minPrince không đước lớn hơn maxPrice')
    }

    await seoConfig.save()
    return seoConfig;
  }

  @Route('PUT /product-configs/:id', [
    body('category')
      .optional()
      .isString().withMessage('Dữ liệu không hợp lệ'),
    body('category.*')
      .isIn(productCategories.map(pCat => pCat.id)).withMessage('Dữ liệu không hợp lệ').toInt(),
    body('priceFrom')
      .optional()
      .isInt().withMessage('Dữ liệu không hợp lệ')
      .toInt(),
    body('priceTo')
      .optional()
      .isInt().withMessage('Dữ liệu không hợp lệ')
      .toInt(),

    body('status')
      .optional()
      .isIn(seoConfigStatues.map(cat => cat.value)).withMessage('Dữ liệu không hợp lệ')
      .toInt(),
    body('title').notEmpty().withMessage('Vui lòng nhập tiêu đề sản phẩm'),
    AuthProvider.requireAuth()
  ])
  async updateProductConfig(req: Request) {
    const seoConfig = await SeoProductConfig.findById(req.params.id)
    if (!seoConfig) throw new NotFoundException({ post: req.params.id })

    if (parseInt(req.body.priceFrom) > parseInt(req.body.priceTo)) {
      throw new AppException('400', 'minPrince không đước lớn hơn maxPrice')
    }

    if (req.body.hasOwnProperty('status')) seoConfig.status = req.body.status;
    if (req.body.hasOwnProperty('category')) seoConfig.category = req.body.category;
    if (req.body.hasOwnProperty('priceFrom')) seoConfig.priceFrom = req.body.priceFrom;
    if (req.body.hasOwnProperty('priceTo')) seoConfig.priceTo = req.body.priceTo;

    if (req.body.hasOwnProperty('title')) seoConfig.title = req.body.title;
    if (req.body.hasOwnProperty('description')) seoConfig.description = req.body.description;
    if (req.body.hasOwnProperty('h1')) seoConfig.h1 = req.body.h1;

    await seoConfig.save()

    return seoConfig
  }

  @Route('DELETE /product-configs/:id', [
    AuthProvider.requireAuth()
  ])
  async removeProductConfig(req: Request) {
    const seoProductConfig = await SeoProductConfig.findById(req.params.id);

    seoProductConfig.remove();

    return;
  }
}