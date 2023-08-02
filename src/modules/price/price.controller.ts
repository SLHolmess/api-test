import { Request } from "express";
import { AppController } from "dth-core";
import { Controller, Route } from "dth-core/decorators";
import { detectPriceTitleAndFormat, xoa_dau, shuffle } from '../../includes/helper'
import { price, getActiveFilter } from '../../includes/filter'
import { priorityStores, categoryList, simLoaiQuy, tra_gop, kho4g, queries, filterList } from '../../includes/params'
import { fieldSingleValueQuery } from "../../includes/elasticsearch"
import { formatListSim } from "../../includes/format_sim";

@Controller({
  prefix: "/price",
})
export default class PriceController extends AppController {
  @Route("GET /")
  async index(req: Request) {
    const perPage = 60;
    const currentPage = 1;
    const limitPerRequest = 60;
    let crumbs: any = []
    let page: any = req.query.page ? req.query.page : 1;
    let isSort = req.query.sort ? req.query.sort : false;
    let pn = req.query.pn ? req.query.pn : false;
    let minPrice = req.query.minPrice ? req.query.minPrice : 0;
    let maxPrice = req.query.maxPrice ? req.query.maxPrice : 0;
    isSort = isSort && pn && pn !== "rand";

    const detectPriceParams = detectPriceTitleAndFormat(req.query)
    const currentPerLimit = perPage * page
    const currentOffset = Math.floor(currentPerLimit/limitPerRequest) * limitPerRequest
    let filterCondition: any = {
      limit: limitPerRequest,
      offset: currentPage,
      format: detectPriceParams.format
    }

    if (minPrice) {
      filterCondition.minPrice = minPrice
		}
		if (maxPrice) {
      filterCondition.maxPrice = maxPrice
		}

    // Nếu có sort thì bỏ ưu tiên
		if (isSort) {
			if (pn === 'rate') {
        filterCondition.sort = {
          utP: 'desc'
        }
			} else if (pn === 'sec') {
        filterCondition.sort = {
          ut: 'asc'
        }
			} else {
        filterCondition.sort = {
          pn: pn
        }
			}
		} else {
			filterCondition.storeIds = priorityStores
		}

    if (detectPriceParams.telcoId) {
      filterCondition.telcoId = detectPriceParams.telcoId
    }
    if (detectPriceParams.catId) {
      filterCondition.catId = detectPriceParams.catId
    }

    let listSimOnPage = [];
		let result: any = []
		let totalPriority = 0;
    let totalUnPriority = 0;
		
		filterCondition["offset"] = (page - 1) * perPage;

		result = await fieldSingleValueQuery(filterCondition);
    totalPriority = result?.hits?.total?.value;

    if (totalPriority > perPage * parseInt(page) || isSort) {
      const totalListSim = result?.hits?.hits;
      listSimOnPage = totalListSim;

      if (!isSort) {
        delete filterCondition.storeIds;
        filterCondition.excludeStoreIds = priorityStores;
        totalUnPriority = result?.hits?.total?.value;
      }
    }
		if (listSimOnPage.length < perPage && !isSort) {
			let unPriorityOffset = perPage * (page) - listSimOnPage.length;
			//Offset để query
			unPriorityOffset = Math.floor(unPriorityOffset / limitPerRequest);
			//Page tính theo không ưu tiên
			let unPriorityPage            = page - Math.floor(totalPriority / perPage);
      filterCondition.offset = unPriorityOffset * limitPerRequest
			let unPriorityList            = result?.hits?.hits
			listSimOnPage = unPriorityList.splice(((unPriorityPage - 1) *perPage), perPage)
    }
		const totalSim     = totalPriority + totalUnPriority;
		let viewMoreText = '';
		if (totalSim - (page * perPage) > 0) {
			const viewMoreNumber = new Intl.NumberFormat().format(
        totalSim - page * perPage
      )
			viewMoreText   = 'Xem tiếp <strong>' + viewMoreNumber + '</strong> sim';
		}
		shuffle(listSimOnPage);
    listSimOnPage = formatListSim(listSimOnPage)
		let activeFilter = {...filterCondition, ...req.query}
		// let headFilters  = category(req.query, {
		// 	'maxPrice' : maxPrice,
		// 	'minPrice' : minPrice,
    // });
		return {
			'code'         : 200,
			'success'      : true,
			'message'      : 'Success',
			'activeFilter' : getActiveFilter(activeFilter),
			'price'     : {
				'loadMore'      : req.query.loadMore ? true : false,
				'totalSim'      :  new Intl.NumberFormat().format(
          totalSim
        ),
				'totalPages'    : Math.ceil(totalSim / perPage),
				'title'         : '',
				'listSim'       : listSimOnPage,
				'viewMoreText'  : viewMoreText,
				'keywordFormat' : '',
				'crumbs'        : crumbs,
      },
			'listFilter'   : price(req.query),
    };

  }
}