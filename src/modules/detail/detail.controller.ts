import { Request } from "express";
import { AppController } from "dth-core";
import { Controller, Route } from "dth-core/decorators";
import { checkmang, get_id_mang, get_cat_id } from '../../includes/helper'
import { price, getActiveFilter } from '../../includes/filter'
import { available_attributes, priorityStores, categoryList, simLoaiQuy, tra_gop, kho4g, queries, filterList } from '../../includes/params'
import { fieldSingleValueQuery } from "../../includes/elasticsearch"
import { formatListSim } from "../../includes/format_sim";
import { ESfindOne } from "../../includes/elasticsearch";
import SeoProductConfigModel from "../seo/models/seo-product.model";

@Controller({
	prefix: "/detail",
})
export default class DetailController extends AppController {
	@Route("GET /index")
	async index(req: Request) {
		const id: any = req.query.sim

		const conditionAttributes = [...available_attributes]
		let objCondition: any = {}
		for (let conditionAttribute of conditionAttributes) {
			objCondition[conditionAttribute] = false
		}
		let sim = await ESfindOne(id, objCondition);
		if(!sim?.id){
			console.log("detai/index", req.query.sim);
			return {
				'code': 200,
				'success': true,
				'message': 'Success',
				'simInfo': {},
				"seoConfig": {}
			};
		} 
		sim._source = { ...sim }
		sim = await formatListSim([sim])[0]
		delete sim._source
		if (sim) {
			const telcoName = checkmang(id);
			sim.f = id;
			sim.id = id;
			sim.t = get_id_mang(telcoName);
			sim.pn = 0;
			sim.c2 = get_cat_id(id);
		}
		let description = sim.id + ' thuộc nhà mạng ' + sim.telcoText + ' với đầu số ' + sim.id.substr(0, 4) + ' và loại ' + sim.categoryText + ' với đuôi số ' + sim.id.substr(-4);
		if (sim.pn !== 0) {
			description += ' có giá bán tại sSIMvn là ' + sim.priceFormatted;
		}
		description += '. Đăng ký chính chủ và Giao sim Miễn Phí toàn quốc';
		let crumbs = [
			{
				'path': sim.categoryUrl,
				'title': sim.categoryText,
			},
			{
				'path': id,
				'title': id,
			}
		]
		let length = 6;
		let similarNumber: any = [];
		if (sim.pn == 0) {
			for (let i = 4; i < 6; i++) {
				let tail = sim.id.substr(i, length);
				let filterCondition = {
					'limit': 10,
					'offset': 0,
					'format': '*' + tail,
				};
				let filterServiceQueryBuilder: any = await fieldSingleValueQuery(filterCondition);

				similarNumber = [...similarNumber, ...filterServiceQueryBuilder?.hits?.hits]
				if (similarNumber.length >= 10) {
					break;
				} else {
					length -= 1;
				}
			}
			let filterCondition = {
				'limit': 10,
				'offset': 0,
				'catId': sim.c2,
			};
			let filterServiceQueryBuilder = await fieldSingleValueQuery(filterCondition);
			similarNumber = [...similarNumber, ...filterServiceQueryBuilder?.hits?.hits]
			similarNumber = formatListSim(similarNumber)
		}

		// get seo product config
		let resSeo = await SeoProductConfigModel.findOne({
			category: sim.c2.toString(),
			$and: [
				{
					priceFrom: { $lte: sim.p },
					priceTo: { $gte: sim.p }
				}
			],
			status: 2
		});

		if (!resSeo) {
			resSeo = await SeoProductConfigModel.findOne({
				category: sim.c2.toString(),
				priceFrom: 0,
				priceTo: 0,
				status: 2
			});
		}

		if (!resSeo) {
			resSeo = await SeoProductConfigModel.findOne({
				category: "0",
				status: 2
			});
		}

		return {
			'code': 200,
			'success': true,
			'message': 'Success',
			'simInfo': {
				'title': 'Sim ' + sim.id + ' - ' + sim.categoryText + ' ' + sim.f,
				'detail': sim,
				'crumbs': crumbs,
				'description': description,
				'similarNumber': similarNumber,
				'thumbnail': 'https://static.simthanglong.vn/' + sim.id + '.jpg',
			},
			"seoConfig": {
				'h1': resSeo?.h1 ? resSeo.h1 : "",
				'title': resSeo?.title ? resSeo.title : "",
				'description': resSeo?.description ? resSeo.description : "",
			}
		};

	}
}