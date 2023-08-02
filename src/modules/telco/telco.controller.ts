import { Request } from "express";
import { AppController } from "dth-core";
import { Controller, Route } from "dth-core/decorators";
import { xoa_dau, shuffle } from '../../includes/helper'
import { telco, getActiveFilter } from '../../includes/filter'
import { priorityStores, telco_ids } from '../../includes/params'
import { fieldSingleValueQuery } from "../../includes/elasticsearch"
import { formatListSim } from "../../includes/format_sim";

@Controller({
  prefix: "/telco",
})
export default class TelcoController extends AppController {
  @Route("GET /")
  async index(req: Request) {
    const perPage = 60;
    const currentPage = 1;
    const limitPerRequest = 60;
    let telcoList:any  = {...telco_ids}
		let telcoId: any    = 0;
		let telcoText  = "";
    let crumbs: any = []
    let tail: any = req.query.tail ? req.query.tail : "";
    let head = req.query.head ? req.query.head : "";
    let middle = req.query.middle ? req.query.middle : "";
    let page: any = req.query.page ? req.query.page : 1;
    let gte = req.query.gte ? req.query.gte : 0;
    let lte = req.query.lte ? req.query.lte : 0;
    let isSort = req.query.sort ? req.query.sort : false;
    let pn = req.query.pn ? req.query.pn : false;
    let catId: any = req.query.catId ? req.query.catId : 84;
    isSort = isSort && pn && pn !== "rand";

    if (req.query.telco) {
      for (let property in telcoList) {
        if (xoa_dau(telcoList[property]).toLowerCase() == req.query.telco) {
          telcoId   = property;
					telcoText = "Sim " + telcoList[property];
          crumbs.push({
            'path' : 'sim-'+req.query.telco,
						'title' : telcoText
          })
					break;
        }
      }
		}
		let format = '';
		if (head !== '') {
			format += head + '*';
		}
		if (middle !== '') {
			if (head !== '') {
				format += middle + '*';
			} else {
				format += '*' + middle + '*';
			}
		}
		if (tail !== '') {
			if (head !== '' || middle !== '') {
				format += tail;
			} else {
				format += '*' + tail;
			}
		}

    // const detectPriceParams = detectPriceTitleAndFormat(req.query)
    const currentPerLimit = perPage * page
    const currentOffset = Math.floor(currentPerLimit/limitPerRequest) * limitPerRequest
    let filterCondition: any = {
      limit: limitPerRequest,
      offset: currentPage,
      format: format
    }

    if (telcoId) {
      filterCondition.telcoId = telcoId
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

    if (lte) {
      filterCondition.maxPrice = lte
    }
    if (gte) {
      filterCondition.minPrice = gte
    }
    if (catId) {
      filterCondition.catId = catId
    }
    let filterServiceQueryBuilder = await fieldSingleValueQuery(filterCondition);

    // $filterServiceQueryBuilder = $this->filterService->fieldSingleValueQuery($filterCondition);
		const totalPriority             = filterServiceQueryBuilder?.hits?.total?.value;
		let listSimOnPage             = [];
		let minPrice                  = 0;
		let maxPrice                  = 0;
		if (totalPriority > perPage * page || isSort) {
			let sliceFrom = 0;
			if (currentOffset != 0) {
				// let multiple  = Math.floor((perPage * page) / currentOffset);
				// sliceFrom = (perPage * page) - currentOffset * multiple;
			}
			let totalListSim = filterServiceQueryBuilder?.hits?.hits
      for (let totalSim of totalListSim) {
        if (!minPrice) {
					minPrice = totalSim.pn;
				}
				if (!maxPrice) {
					maxPrice = totalSim.pn;
				}
				if (minPrice > totalSim.pn) {
					minPrice = totalSim.pn;
				}
				if (maxPrice < totalSim.pn) {
					maxPrice = totalSim.pn;
				}
			}
      sliceFrom = perPage * (page - 1)
			listSimOnPage = totalListSim.slice(sliceFrom, perPage)
    }
		let totalUnPriority = 0;
		if (!isSort) {
      delete filterCondition.storeIds
      filterCondition.excludeStoreIds = [...priorityStores]
      filterServiceQueryBuilder = await fieldSingleValueQuery(filterCondition)
			totalUnPriority                    = filterServiceQueryBuilder?.hits?.total?.value;
		}
		if (listSimOnPage.length < perPage && !isSort) {
			let unPriorityOffset = perPage * (page+1) - totalPriority;
			//Offset để query
			unPriorityOffset = Math.floor(unPriorityOffset / limitPerRequest);
			//Page tính theo không ưu tiên
			let unPriorityPage            = page - Math.floor(totalPriority / perPage);
      filterCondition.offset = unPriorityOffset * limitPerRequest
			let unPriorityList            = filterServiceQueryBuilder?.hits?.hits
      for (let unPriority of unPriorityList) {
        if (!minPrice) {
					minPrice = unPriority.pn;
				}
				if (!maxPrice) {
					maxPrice = unPriority.pn;
				}
				if (minPrice > unPriority.pn) {
					minPrice = unPriority.pn;
				}
				if (maxPrice < unPriority.pn) {
					maxPrice = unPriority.pn;
				}
			}
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
    
    let activeFilters = getActiveFilter(activeFilter)
		const listFilter  = telco(req.query, {
			'maxPrice' : maxPrice,
			'minPrice' : minPrice,
    });
			return {
				'code'         : 200,
				'success'      : true,
				'message'      : 'Success',
				'activeFilter' : activeFilters,
				'telco'        : {
					'totalSim'     : new Intl.NumberFormat().format(totalSim),
					'totalPages'   : Math.ceil(totalSim / perPage),
					'title'        : telcoText,
					'listSim'      : listSimOnPage,
					'viewMoreText' : viewMoreText,
					'crumbs'       : crumbs
        },
				'listFilter'   : listFilter,
      };
		}
		return {};
  }
}