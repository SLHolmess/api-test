import { Request } from "express";
import { query } from 'express-validator'

import { AppController } from "dth-core";
import { Controller, Route } from "dth-core/decorators";

import { detectFormat, get_cat_id2 } from "./search.service";
import { xoa_dau, shuffle } from "../../includes/helper";
import { getActiveFilter, search } from "../../includes/filter";

import { fieldSingleValueQuery } from "../../includes/elasticsearch"

import {
  formatListSim
} from "../../includes/format_sim";
import {
  categoryList,
  telco_ids,
  telco_id_to_head,
  priorityStores,
  tra_gop
} from "../../includes/params";

@Controller({
  prefix: "/search",
})
export default class SearchController extends AppController {
  @Route("GET /")
  async index(req: Request) {
    let keyword = req.query.keyword.toString();
    let link = req.query.link;
    keyword = keyword.replace(/\s+/g, "-");
    keyword = keyword.replace("/*+/", "*");
    const detectSearchToken = keyword.split("*");
    const detectResults = detectFormat(link, detectSearchToken);
    return detectResults;
  }

  @Route("GET /hompage")
  async homepage() {
    let listKhoTraGop = Object.keys(tra_gop)
    let [promotionSim, installmentSim, simViettel, simVina, simMobi ] : any = await Promise.all([
      fieldSingleValueQuery({
        limit: 100,
        offset: 0,
        storeIds: priorityStores
      }),
      fieldSingleValueQuery({
        limit: 100,
        offset: 0,
        storeIds: listKhoTraGop
      }),
      fieldSingleValueQuery({
        limit: 100,
        offset: 0,
        telcoId: 1,
        storeIds: priorityStores
      }),
      fieldSingleValueQuery({
        limit: 100,
        offset: 0,
        telcoId: 2,
        storeIds: priorityStores
      }),
      fieldSingleValueQuery({
        limit: 100,
        offset: 0,
        telcoId: 3,
        storeIds: priorityStores
      })

    ])
    promotionSim = promotionSim?.hits?.hits
    shuffle(promotionSim)
    promotionSim.splice(42)
    promotionSim = formatListSim(promotionSim)
    
    // let installmentSim: any = await fieldSingleValueQuery({
    //   limit: 2000,
    //   offset: 0,
    //   storeIds: listKhoTraGop
    // })
    installmentSim = installmentSim?.hits?.hits
    shuffle(installmentSim)
    installmentSim.splice(42)
    installmentSim = formatListSim(installmentSim)

    // let simViettel = await fieldSingleValueQuery({
    //   limit: 2000,
    //   offset: 0,
    //   telcoId: 1,
    //   storeIds: priorityStores
    // })
    simViettel = simViettel?.hits?.hits
    shuffle(simViettel)
    simViettel.splice(42)
    simViettel = formatListSim(simViettel)

    // let simVina = await fieldSingleValueQuery({
    //   limit: 2000,
    //   offset: 0,
    //   telcoId: 2,
    //   storeIds: priorityStores
    // })
    simVina = simVina?.hits?.hits
    shuffle(simVina)
    simVina.splice(42)
    simVina = formatListSim(simVina)

    // let simMobi = await fieldSingleValueQuery({
    //   limit: 2000,
    //   offset: 0,
    //   telcoId: 3,
    //   storeIds: priorityStores
    // })
    simMobi = simMobi?.hits?.hits
    shuffle(simMobi)
    simMobi.splice(40)
    simMobi = formatListSim(simMobi)
    return {
      code: 200,
      success: true,
      message: 'Success',
      block: {
        'promotion'   : {
          'title'   : 'Sim khuyến mãi',
          'listSim' : promotionSim,
          'url'     : '/sim-gia-re',
        },
        'installment' : {
          'title'   : 'Sim trả góp',
          'listSim' : installmentSim,
          'url'     : '/sim-tra-gop',
        },
        'viettel' : {
          'title'   : 'Sim Viettel',
          'listSim' : simViettel,
          'url'     : '/sim-viettel',
        },
        'vinaphone' : {
          'title'   : 'Sim Vinaphone',
          'listSim' : simVina,
          'url'     : '/sim-vinaphone',
        },
        'mobifone' : {
          'title'   : 'Sim Mobifone',
          'listSim' : simMobi,
          'url'     : '/sim-mobifone',
        }
      }
    }
  }

  @Route("GET /query")
  async query(req: Request) {
    // const client = getElasticSearch();

    const perPage: number = Number(req.query.limit) || 60;
    const currentPage = 1;
    const limitPerRequest = 4000;
    let tail = req.query.tail ? req.query.tail : "";
    let head = req.query.head ? req.query.head : "";
    let middle = req.query.middle ? req.query.middle : "";
    let page: any = req.query.page ? req.query.page : 1;
    let gte = req.query.gte ? req.query.gte : 0;
    let lte = req.query.lte ? req.query.lte : 0;
    let telcoId = req.query.t ? req.query.t : 0;
    let isSort = req.query.sort ? req.query.sort : false;
    let pn = req.query.pn ? req.query.pn : false;
    let format = "";
    let searchTitle = "";
    let catId = req.query.catId ? req.query.catId : null; 
    let minPrice = req.query.minPrice ? req.query.minPrice : 0;
    let maxPrice = req.query.maxPrice ? req.query.maxPrice : 0;
    let sortBy = req.query.sortBy ? req.query.sortBy : null;
    let direction = req.query.direction ? req.query.direction : 1;
    isSort = isSort && pn && pn !== "rand";

    if (head != "") {
      format = head + "*";
      if (tail != "") {
        format = head + "*" + tail;
        searchTitle = "SIM đuôi số " + tail + " đầu " + head;
      } else if (middle != "") {
        format = head + "*" + middle + "*";
        searchTitle = "SIM số đẹp giữa " + middle + " đầu " + head;
      } else {
        searchTitle = "SIM đầu số " + head;
      }
    } else {
      if (tail != "") {
        format = "*" + tail;
        if (middle != "") {
          format = "*" + format;
          searchTitle = "SIM đuôi số " + tail + " giữa " + middle;
        } else {
          searchTitle = "SIM đuôi số " + tail;
        }
      } else {
        if (middle != "") {
          format = "*" + middle + "*";
          searchTitle = "SIM số đẹp " + middle + " giữa";
        }
      }
    }

    let filterCondition: any = {
      limit: 60,
      offset: 0,
      format: format,
    };
    if (isSort) {
      if (pn === "rate") {
        filterCondition.sort = {
          utP: "desc",
        };
      } else if (pn === "sec") {
        filterCondition.sort = {
          ut: "asc",
        };
      } else {
        filterCondition.sort = {
          pn: pn,
        };
      }
    } else {
      // filterCondition.storeIds = priorityStores;
    }
    if (lte) {
      filterCondition.maxPrice = lte;
    }
    if (gte) {
      filterCondition.minPrice = gte;
    }
    if (telcoId) {
      filterCondition.telcoId = telcoId;
    }
    if (catId) filterCondition.catId = catId;
    if (maxPrice) filterCondition.maxPrice = maxPrice;
    if (minPrice) filterCondition.minPrice = minPrice;
    if (sortBy) filterCondition.sortBy = sortBy;
    if (direction) filterCondition.direction = direction;

    const currentPagelimit = perPage * Math.abs(parseInt(page) - 1);
    // const currentOffset = Math.floor(currentPagelimit / limitPerRequest) * limitPerRequest;
    let arrPromise = []
    let listSimOnpage: any = [];
    let result: any = []
    let totalSim = 0;
    filterCondition["offset"] = currentPagelimit
    arrPromise.push(new Promise(async (resolve) => {
      result = await fieldSingleValueQuery(filterCondition);
      totalSim = result?.hits?.total?.value;
      if (result.hits.hits.length == 0) totalSim = 0
      if (totalSim > currentPagelimit || isSort) {
        const totalListSim = result?.hits?.hits;
        // const sliceFrom = perPage * (page - 1);
        // listSimOnpage = totalListSim.slice(sliceFrom, perPage);
        listSimOnpage = totalListSim
      }
      resolve(1);
    }))
    

    let totalUnPriority = 0;
    // if (!isSort) {
    //   arrPromise.push(new Promise(async (resolve) => {
    //     delete filterCondition.storeIds;
    //     filterCondition.excludeStoreIds = priorityStores;
    //     result = await fieldSingleValueQuery(filterCondition);
    //     console.log(result)
        
    //     totalUnPriority = result?.hits?.total?.value;
    //     if (result.hits.hits.length == 0) totalUnPriority = 0
    //     resolve(1);
    //   }))
    //   // delete filterCondition.storeIds;
    //   // filterCondition.excludeStoreIds = priorityStores;
    //   // result = await fieldSingleValueQuery(filterCondition);
    //   // arrPromise.push(fieldSingleValueQuery(filterCondition))
    //   // totalUnPriority = result?.hits?.total?.value;
    // }
    await Promise.all(arrPromise)


    // if (listSimOnpage.length < perPage && !isSort) {
    //   let unPriorityOffset = perPage * (page + 1) - totalSim;
    //   //Offset để query
    //   unPriorityOffset = Math.floor(unPriorityOffset / limitPerRequest);
    //   //Page tính theo không ưu tiên
    //   const unPriorityPage = page - Math.floor(totalSim / perPage);
    //   filterCondition["offset"] = unPriorityOffset * limitPerRequest;
    //   const unPriorityList = result?.hits?.hits;
     
    //   listSimOnpage = unPriorityList.slice(
    //     (unPriorityPage - 1) * perPage,
    //     perPage
    //   );
    // }
		
    if (!isSort) {
      totalSim += totalUnPriority;
    }
    let viewMoreText = "";
    if (totalSim - page * perPage > 0) {
      const viewMoreNumber = new Intl.NumberFormat().format(
        totalSim - page * perPage
      );
      viewMoreText = "Xem tiếp <strong>" + viewMoreNumber + "</strong> sim";
    }
    let summaryConditions = Object.assign(filterCondition, req.query);
    if (head !== "") {
      if (req.query.link.toString().indexOf(head.toString()) > -1) {
        delete summaryConditions["head"];
      }
    }
    listSimOnpage = formatListSim(listSimOnpage)
    const crumbs = this.detectBreadcrumbs(head, tail);
    return {
      code: 200,
      success: true,
      activeFilter: getActiveFilter(summaryConditions),
      search: {
        loadMore: req.query.loadMore ? true : false,
        totalSim: new Intl.NumberFormat().format(totalSim),
        totalPages: Math.ceil(totalSim / perPage),
        title: searchTitle,
        listSim: listSimOnpage,
        viewMoreText: viewMoreText,
        keywordFormat: format,
        crumbs: crumbs,
      },
      listFilter: search(req.query),
    };
  }

  detectBreadcrumbs(head: any, tail: any) {
    let catList = categoryList;
    let crumbs: any = [];
    if (tail !== "") {
      const catId = get_cat_id2(tail);
      if (catList[catId]) {
        crumbs.push({
          path: catList[catId]["url"]
            ? catList[catId]["url"]
            : xoa_dau(catList[catId]["text"]),
          title: catList[catId]["text"],
        });
      }
      crumbs.push({
        path: "sim-so-dep-duoi-" + tail,
        title: "Đuôi " + tail,
      });
      if (head !== "") {
        crumbs.push({
          path: "sim-so-dep-duoi-" + tail + "-dau-" + head,
          title: head + "*" + tail,
        });
      }
    } else {
      let telcoList: any = telco_ids;
      let telcoId = 0;
      if (head.length == 2) {
        if (head === "03") {
          telcoId = 1;
        } else if (head === "07") {
          telcoId = 3;
        }
      } else {
        let telcoToHeadList: any = telco_id_to_head;
        for (const property in telcoToHeadList) {
          if (telcoToHeadList[property].includes(head)) {
            telcoId = parseInt(property);
          }
        }
      }
      if (telcoId) {
        if (telcoList[telcoId]) {
          crumbs.push({
            path: "sim-" + telcoList[telcoId].toLowerCase(),
            title: " Sim " + telcoList[telcoId],
          });
        }
      }
      crumbs.push({
        path: "sim-dau-so-" + head,
        title: " Đầu " + head,
      });
    }
    return crumbs;
  }

}
