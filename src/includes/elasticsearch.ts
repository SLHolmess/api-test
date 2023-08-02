import { Client } from '@elastic/elasticsearch'
import esb from "elastic-builder";
import { fieldQuery, available_attributes } from "./params";

let _elasticSearchClient: any

export function getElasticSearch() {
  if (!_elasticSearchClient) {
    _elasticSearchClient = new Client({
      node: process.env.ELASTICSEARCH_HOST,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  return _elasticSearchClient;
}

export async function ESfindOne(sim: any, condition?: any) {
  const client = getElasticSearch();
  let esbQuery = esb.boolQuery()
    .must(esb.termQuery('id', sim))
    .must(esb.termQuery("d", false))
  if (condition) {
    for (let item in condition) {
      esbQuery.must(esb.termQuery(item, condition[item]))
    }
  }
  const esData = await client.search({
    index: "khoso",
    body: esb.requestBodySearch().query(esbQuery)
      .toJSON(),
    // _source: fieldQuery,
    aggs: {},
  });
  return esData.hits.hits.length > 0 ? esData.hits.hits[0]._source : {}
}

export async function fieldSingleValueQuery(fields: any) {
  let boolQuery = esb.boolQuery();
  boolQuery.must(esb.termQuery("d", false)); // Server test chạy dòng này

  if (!fields.storeIds) {
    fields.storeIds = [];
  }
  if (fields.minPrice) {
    boolQuery.must(esb.rangeQuery("pn").gte(fields.minPrice));
  }
  if (fields.maxPrice) {
    boolQuery.must(esb.rangeQuery("pn").lte(fields.maxPrice));
  }
  if (fields.tails) {
    fields.tails.forEach((element: any) => {
      boolQuery.must(esb.wildcardQuery("id", element));
    });
  } else {
    if (fields.telcoId) {
      boolQuery.must(esb.termQuery("t", fields.telcoId));
    }
  }

  if (fields.format) {
    const searchTypes = detechSearchType(fields.format);
    // for (const property in searchTypes) {
    //   boolQuery.must(esb.wildcardQuery("id", searchTypes[property]));
    // }
    boolQuery.must(esb.wildcardQuery("id", fields.format));
  }

  if (fields.storeIds && fields.storeIds.length > 0) {
    boolQuery.must(esb.termsQuery("s3", fields.storeIds));
  }
  if (fields.excludeStoreIds && fields.excludeStoreIds.length > 0) {
    boolQuery.mustNot(esb.termsQuery("s3", fields.excludeStoreIds));
  }
  if (fields.catId) boolQuery.must(esb.termQuery("c", fields.catId));
  if (fields.minPrice) boolQuery.must(esb.rangeQuery("pn").gte(fields.minPrice));
  if (fields.maxPrice) boolQuery.must(esb.rangeQuery("pn").lte(fields.maxPrice));

  available_attributes.forEach((element) => {
    boolQuery.mustNot(esb.termQuery(element, true));
  });

  // boolQuery.must(esb.rangeQuery('l.sec').gte(Date.now() - 60*86400)) // Lấy số update 2 tháng gần nhất

  let queryElasticSearch = esb.requestBodySearch().query(boolQuery);
  if (fields.limit) {
    queryElasticSearch.size(fields.limit > 10_000 ? 10_000 : fields.limit);
  }
  if (fields.offset) {
    queryElasticSearch.from(fields.offset);
  }
  if (fields.sort) {
    queryElasticSearch.sort(
      esb.sort(
        Object.keys(fields.sort)[0],
        Object.values(fields.sort)[0].toString()
      )
    );
  }

  if (fields.inventory) {
    const newBoolQuery = esb.boolQuery();
    boolQuery.must(newBoolQuery);
    fields.inventory.forEach((v: any) => {
      if (v) newBoolQuery.should(esb.termQuery("id", v));
    })
  }

  if (fields.sortBy && fields.direction) {
    const sortMapping: Record<string, string> = {
      "price": "pn"
    };
    if (sortMapping[fields.sortBy]) {
      queryElasticSearch.sort(
        esb.sort(sortMapping[fields.sortBy], Number(fields.direction) === 1 ? "asc" : "desc")
      )
    }
  }

  fields.track_total_hits = true;
  const client = getElasticSearch();
  let a = Math.floor(Math.random() * 100);

  console.time(`================QUERY ES ${a}================`)
  const result = await client.search({
    index: "khoso",
    body: queryElasticSearch.toJSON(),
    _source: fieldQuery,
    aggs: {},
  });
  // console.log(JSON.stringify(queryElasticSearch))
  console.timeEnd(`================QUERY ES ${a}================`)
  return result;

}
function detechSearchType(searchQuery: any) {
  const explodedSearchQuery = searchQuery.split("*");
  let searchType: any = {};
  switch (explodedSearchQuery.length) {
    case 2:
      //1 dấu *
      if (explodedSearchQuery[0] != "") {
        searchType["head"] = explodedSearchQuery[0] + "*";
      }
      if (explodedSearchQuery[1] != "") {
        searchType["tail"] = "*" + explodedSearchQuery[1];
      }
      break;
    case 1:
      //0 dấu *
      if (explodedSearchQuery[0] != "") {
        searchType["tail"] = "*" + explodedSearchQuery[0];
      }
      break;
    default:
      if (explodedSearchQuery[0] != "") {
        searchType["head"] = explodedSearchQuery[0] + "*";
      }
      if (explodedSearchQuery[1] != "") {
        searchType["middle"] = "*" + explodedSearchQuery[1] + "*";
      }
      if (explodedSearchQuery[2] != "") {
        searchType["tail"] = "*" + explodedSearchQuery[2];
      }
      break;
  }
  return searchType;
}