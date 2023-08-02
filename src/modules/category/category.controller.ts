import { Request } from "express";
import { AppController } from "dth-core";
import { Controller, Route } from "dth-core/decorators";
import {
  detectCategoryTitleAndFormat,
  xoa_dau,
  shuffle,
} from "../../includes/helper";
import { category, getActiveFilter } from "../../includes/filter";
import {
  priorityStores,
  categoryList,
  simLoaiQuy,
  tra_gop,
  kho4g,
  queries,
  filterList,
} from "../../includes/params";
import { fieldSingleValueQuery } from "../../includes/elasticsearch";
import { formatListSim } from "../../includes/format_sim";

@Controller({
  prefix: "/category",
})
export default class CategoryController extends AppController {
  @Route("GET /")
  async index(req: Request) {
    const perPage: number = Number(req.query.limit) || 60;
    const currentPage = 1;
    const limitPerRequest = 60;
    let tail: any = req.query.tail ? req.query.tail : "";
    let link: any = req.query.link ? req.query.link : "";
    let head = req.query.head ? req.query.head : "";
    let middle = req.query.middle ? req.query.middle : "";
    let page: any = req.query.page ? req.query.page : 1;
    let gte = req.query.gte ? req.query.gte : 0;
    let lte = req.query.lte ? req.query.lte : 0;
    let telcoId = req.query.t ? req.query.t : 0;
    let isSort = req.query.sort ? req.query.sort : false;
    let filter = req.query.filter ? req.query.filter : false;
    let pn = req.query.pn ? req.query.pn : false;
    let categoryId: any = req.query.catId ? req.query.catId : 84;
    let sortBy = req.query.sortBy ? req.query.sortBy : null;
    let direction = req.query.direction ? req.query.direction : 1;
    isSort = isSort && pn && pn !== "rand";

    const detectSearch = detectCategoryTitleAndFormat(
      categoryId,
      head,
      middle,
      tail,
      filter
    );
    const currentPagelimit = perPage * Math.abs(parseInt(page) - 1);
    // const currentPerLimit = perPage * page;
    // const currentOffset = Math.floor(currentPerLimit / limitPerRequest) * limitPerRequest;
    let filterCondition: any = {
      limit: limitPerRequest,
      offset: currentPagelimit,
      format: detectSearch.format,
    };
    if (parseInt(categoryId)) {
      filterCondition.catId = categoryId;
    }

    // Nếu có sort thì bỏ ưu tiên
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
    //   filterCondition.storeIds = priorityStores;
    }

    let categoryListCopy = JSON.parse(JSON.stringify(categoryList));
    let categoryUrl = "";
    let categoryText = "";
    if (categoryListCopy[categoryId.toString()]) {
      categoryText = categoryListCopy[categoryId]["text"];
      categoryUrl = categoryListCopy[categoryId]["url"]
        ? categoryListCopy[categoryId]["url"]
        : xoa_dau(categoryListCopy[categoryId]["text"]);
    }
    let crumbs = [];
    if (simLoaiQuy.includes(categoryId)) {
      if (tail !== "") {
        crumbs.push({
          title: categoryText,
          path: categoryUrl,
        });
        categoryUrl += "-" + tail;
        categoryText += " " + tail.substr(-1, 1);
      }
    }
    if (
      categoryListCopy[categoryId] &&
      categoryListCopy[categoryId]["parentId"]
    ) {
      const parentCategoryId = categoryListCopy[categoryId]["parentId"];
      if (categoryListCopy[parentCategoryId]) {
        crumbs.push({
          path: categoryListCopy[parentCategoryId]["url"]
            ? categoryListCopy[parentCategoryId]["url"]
            : xoa_dau(categoryListCopy[parentCategoryId]["text"]),
          title: categoryListCopy[parentCategoryId]["text"],
        });
      }
    }
    crumbs.push({
      path: categoryUrl,
      title: categoryText,
    });
    if (req.query.catId) {
      if (req.query.catId === "tra-gop") {
        delete filterCondition.catId;
        let traGopConfig = JSON.parse(JSON.stringify(tra_gop));
        let listKhoTraGop = Object.keys(traGopConfig);
        filterCondition.storeIds = listKhoTraGop;
        crumbs.push({
          path: "sim-tra-gop",
          title: "Sim Trả Góp",
        });
      } else if (req.query.catId === "4g") {
        delete filterCondition.catId;
        const sim4GConfig = kho4g;
        filterCondition.storeIds = sim4GConfig;
        crumbs.push({
          path: "sim-4g",
          title: "Sim 4G",
        });
      } else {
        const simTypes: any = Object.keys(queries);
        if (simTypes.includes(req.query.catId.toString())) {
          const simTypeAttributes = queries[req.query.catId.toString()]
            ? queries[req.query.catId.toString()]
            : [];
          const queryTail = simTypeAttributes["query"];
          filterCondition.tails = queryTail;
        }
      }
    }

    if (lte) {
      filterCondition.maxPrice = lte;
    }
    if (gte) {
      filterCondition.minPrice = gte;
    }
    if (telcoId) {
      filterCondition.telcoId = telcoId;
    } else {
      let telcoText: any = req.query.telco ? req.query.telco : "";
      if (telcoText !== "") {
        let listTelcoFilter = JSON.parse(JSON.stringify(filterList)).telco;
        for (const property in listTelcoFilter) {
          if (property == telcoText.toLowerCase()) {
            const telcoId = listTelcoFilter[property]["id"];
            filterCondition.telcoId = telcoId;
            req.query.t = telcoId;
            crumbs.push({
              path: categoryUrl + "-" + property,
              title: categoryText + " " + property,
            });
            break;
          }
        }
      }
    }

    if (sortBy) filterCondition.sortBy = sortBy;
    if (direction) filterCondition.direction = direction;

    let filterServiceQueryBuilder = await fieldSingleValueQuery(
      filterCondition
    );
    // $filterServiceQueryBuilder = $this->filterService->fieldSingleValueQuery($filterCondition);
    const totalPriority = filterServiceQueryBuilder?.hits?.total?.value;
    let listSimOnPage: any = [];
    let minPrice = 0;
    let maxPrice = 0;
	listSimOnPage = filterServiceQueryBuilder?.hits?.hits;
    // if (totalPriority > perPage * page || isSort) {
    //   let sliceFrom = 0;
    //   if (currentOffset != 0) {
    //     let multiple = Math.floor((perPage * page) / currentOffset);
    //     sliceFrom = perPage * page - currentOffset * multiple;
    //   }
    //   let totalListSim = filterServiceQueryBuilder?.hits?.hits;
    //   for (let totalSim of totalListSim) {
    //     if (!minPrice) {
    //       minPrice = totalSim.pn;
    //     }
    //     if (!maxPrice) {
    //       maxPrice = totalSim.pn;
    //     }
    //     if (minPrice > totalSim.pn) {
    //       minPrice = totalSim.pn;
    //     }
    //     if (maxPrice < totalSim.pn) {
    //       maxPrice = totalSim.pn;
    //     }
    //   }
    //   listSimOnPage = totalListSim.slice(sliceFrom, perPage);
    // }
    let totalUnPriority = 0;
    // if (!isSort) {
    //   delete filterCondition.storeIds;
    //   filterCondition.excludeStoreIds = [...priorityStores];
    //   filterServiceQueryBuilder = await fieldSingleValueQuery(filterCondition);
    //   totalUnPriority = filterServiceQueryBuilder?.hits?.total?.value;
    // }
    // if (listSimOnPage.length < perPage && !isSort) {
    //   let unPriorityOffset = perPage * page - listSimOnPage.length;
    //   //Offset để query
    //   unPriorityOffset = Math.floor(unPriorityOffset / limitPerRequest);
    //   //Page tính theo không ưu tiên
    //   let unPriorityPage = page - Math.floor(totalPriority / perPage);
    //   filterCondition.offset = unPriorityOffset * limitPerRequest;
    //   let unPriorityList = filterServiceQueryBuilder?.hits?.hits;
    //   for (let unPriority of unPriorityList) {
    //     if (!minPrice) {
    //       minPrice = unPriority.pn;
    //     }
    //     if (!maxPrice) {
    //       maxPrice = unPriority.pn;
    //     }
    //     if (minPrice > unPriority.pn) {
    //       minPrice = unPriority.pn;
    //     }
    //     if (maxPrice < unPriority.pn) {
    //       maxPrice = unPriority.pn;
    //     }
    //   }
    //   listSimOnPage = unPriorityList.splice(
    //     (unPriorityPage - 1) * perPage,
    //     perPage
    //   );
    // }
    const totalSim = totalPriority + totalUnPriority;
    let viewMoreText = "";
    if (totalSim - page * perPage > 0) {
      const viewMoreNumber = new Intl.NumberFormat().format(
        totalSim - page * perPage
      );
      viewMoreText = "Xem tiếp <strong>" + viewMoreNumber + "</strong> sim";
    }
    listSimOnPage = formatListSim(listSimOnPage);
    let activeFilter = { ...filterCondition, ...req.query };
    let headFilters = category(req.query, {
      maxPrice: maxPrice,
      minPrice: minPrice,
    });
    if (head) {
      if (link.indexOf(head) > -1) {
        delete activeFilter.head;
        headFilters["head"] = [];
        crumbs.push({
          path: link,
          title: "Đầu " + head,
        });
      }
    }
    return {
      code: 200,
      success: true,
      message: "Success",
      activeFilter: getActiveFilter(activeFilter),
      category: {
        loadMore: req.query.loadMore ? true : false,
        totalSim: new Intl.NumberFormat().format(totalSim),
        totalPages: Math.ceil(totalSim / perPage),
        title: "",
        listSim: listSimOnPage,
        viewMoreText: viewMoreText,
        keywordFormat: "",
        crumbs: crumbs,
      },
      listFilter: headFilters,
    };
  }
}
