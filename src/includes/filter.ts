import { telco_ids, categoryList, filterList, telco_id_to_head } from './params'
export function getActiveFilter (currentFilter: any) {
  const gte       = currentFilter['minPrice'] ? currentFilter['minPrice']: 0
  const lte       = currentFilter['maxPrice'] ? currentFilter['maxPrice']: 0
  const telcoList:any = telco_ids
  let priceText:any = '';
  if (gte) {
    if (lte) {
      if (gte >= 1000000) {
        priceText = (gte / 1000000) + ' - ' + (lte / 1000000) + ' triệu';
      } else {
        priceText = (gte / 1000);
        if (lte >= 1000000) {
          priceText += ' - ' + (lte / 1000000) + ' triệu';
        } else {
          priceText += ' - ' + (lte / 1000);
        }
      }
    } else {
      if (gte >= 1000000) {
        priceText = 'Trên ' + (gte / 1000000) + ' triệu';
      } else {
        priceText = 'Trên ' + (gte / 1000);
      }
    }
  } else {
    if (lte) {
      if (lte >= 1000000) {
        priceText += 'Dưới ' + (lte / 1000000) + ' triệu';
      } else {
        priceText = 'Dưới ' + (lte / 1000);
      }
    }
  }
  let telcoText = '';
  if (currentFilter['telcoId'] && telcoList[currentFilter['telcoId']]) {
    if(!currentFilter['telco']) {
      telcoText = telcoList[currentFilter['telcoId']];
    }
  }
  const typeList = categoryList
  let typeText = '';
  if (parseInt(currentFilter['catId'])) {
    typeText = typeList[currentFilter['catId']].text
  }
  let head = '';
  if (currentFilter['head']) {
    head = 'Đầu ' + currentFilter['head'];
  }
  return {
    'head' : head,
    'price' : priceText,
    'telco' : telcoText,
    'type'  : typeText,
  };
}

export function search (params: any) {

  let priceFilterList:any = {...filterList['price']};
  let telcoFilterList:any = {...filterList.telco};

  let headListFilter:any      = {...filterList['head']};
  let childHeadListFilter:any = {};
  let isFilteredPrice = false;
  for (let property in priceFilterList) {
    if (params.gte) {
      if (priceFilterList[property]['from'] && priceFilterList[property]['from'] == params.gte) {
        isFilteredPrice = true;
      }
    }
    if (params.lte) {
      isFilteredPrice = false
      if (priceFilterList[property]['to'] && priceFilterList[property]['to'] == params.lte) {
        isFilteredPrice = true;
      }
    }
    if (isFilteredPrice) {
      delete priceFilterList[property]
    }
  }
  const telcoIdToHead:any = telco_id_to_head
  if (params['t']) {
    headListFilter = []
    for (let property in telcoFilterList) {
      if (params['t'] == telcoFilterList[property].id) {
        delete telcoFilterList[property]
      }
    }
    telcoIdToHead[params['t']].forEach((head:any) => {
      childHeadListFilter[`dau-${head}`] = head
    })
  }

  if (params['head']) {
    for (let key in headListFilter) {
      if (params['head'] == headListFilter[key]) {
        delete headListFilter[key]
      }
    }
    Object.entries(telcoFilterList).forEach(entry => {
      const [key, telcoFilter]:any = entry;
      const telcoId = telcoFilter['id'];
      const listTelcoHead = telcoIdToHead[telcoId] ? telcoIdToHead[telcoId]: []
      let isHeadExist = false;
      listTelcoHead.forEach((head: any) => {
        if(params['head'] !== ''){
          if(head.indexOf(params['head']) > -1) {
            isHeadExist = true;
          }
        }
      })
      if(!isHeadExist) {
        delete telcoFilterList[key]
      }
    });

    if(params['head'].length >= 3 && Object.keys(childHeadListFilter).length > 0) {
      Object.entries(childHeadListFilter).forEach(entry => {
        const [index, childHeadFilter]:any = entry;
        if(params['head'].indexOf(childHeadFilter) > -1) {
          delete childHeadListFilter[index]
        }
      });
    }
  }

  return {
    'price' : priceFilterList,
    'telco' : telcoFilterList,
    'head'  : headListFilter,
    'childHead' : childHeadListFilter
  };
}

export function category (params: any, conditions: any) {
  let priceFilterList:any = {...filterList['price']};
  let telcoFilterList:any = {...filterList.telco};

  let headListFilter:any      = {...filterList['head']};
  let childHeadListFilter:any = {};
  let isFilteredPrice = false;
  for (let property in priceFilterList) {
    if (params.gte) {
      if (priceFilterList[property]['from'] && priceFilterList[property]['from'] == params.gte) {
        isFilteredPrice = true;
      }
    }
    if (params.lte) {
      isFilteredPrice = false
      if (priceFilterList[property]['to'] && priceFilterList[property]['to'] == params.lte) {
        isFilteredPrice = true;
      }
    }
    if (isFilteredPrice) {
      delete priceFilterList[property]
    }
  }
  if(conditions['minPrice']){
    const minPrice = Math.floor(conditions['minPrice']/100000);
    for (let property in priceFilterList) {
      if (priceFilterList[property]['from'] && priceFilterList[property]['from'] < minPrice) {
        if (priceFilterList[property]['to'] && priceFilterList[property]['to'] < minPrice) {
          delete priceFilterList[property]
        }
      }
    }
  }
  const telcoIdToHead:any = telco_id_to_head
  if (params['t']) {
    headListFilter = []
    for (let property in telcoFilterList) {
      if (params['t'] == telcoFilterList[property].id) {
        delete telcoFilterList[property]
      }
    }
    telcoIdToHead[params['t']].forEach((head:any) => {
      childHeadListFilter[`dau-${head}`] = head
    })
  }
  if (params['head']) {
    for (let key in headListFilter) {
      if (params['head'] == headListFilter[key]) {
        delete headListFilter[key]
      }
    }
    Object.entries(telcoFilterList).forEach(entry => {
      const [key, telcoFilter]:any = entry;
      const telcoId = telcoFilter['id'];
      const listTelcoHead = telcoIdToHead[telcoId] ? telcoIdToHead[telcoId]: []
      let isHeadExist = false;
      listTelcoHead.forEach((head: any) => {
        if(params['head'] !== ''){
          if(head.indexOf(params['head']) > -1) {
            isHeadExist = true;
          }
        }
      })
      if(!isHeadExist) {
        delete telcoFilterList[key]
      }
    });

    if(params['head'].length >= 3 && Object.keys(childHeadListFilter).length > 0) {
      Object.entries(childHeadListFilter).forEach(entry => {
        const [index, childHeadFilter]:any = entry;
        if(params['head'].indexOf(childHeadFilter) > -1) {
          delete childHeadListFilter[index]
        }
      });
    }
  }

  return {
    'price' : priceFilterList,
    'telco' : telcoFilterList,
    'head'  : headListFilter,
    'childHead' : childHeadListFilter
  };
}

export function price (params: any) {
  let telcoFilterList:any = {...filterList.telco};
  let typeFilterList:any  = {...filterList.type};
  let headListFilter:any      = {...filterList.head};
  let childHeadListFilter: any = [];
  const telcoIdToHead:any = telco_id_to_head

  if (params['t']) {
    headListFilter = []
    for (let property in telcoFilterList) {
      if (params['t'] == telcoFilterList[property].id) {
        delete telcoFilterList[property]
      }
    }
    telcoIdToHead[params['t']].forEach((head:any) => {
      childHeadListFilter[`dau-${head}`] = head
    })
  }
  if (params['catId']) {
    for (let property in typeFilterList) {
      if (params['catId'] == typeFilterList[property].id) {
        delete typeFilterList[property]
      }
    }
  }

  if (params['head']) {
    for (let key in headListFilter) {
      if (params['head'] == headListFilter[key]) {
        delete headListFilter[key]
      }
    }
    Object.entries(telcoFilterList).forEach(entry => {
      const [key, telcoFilter]:any = entry;
      const telcoId = telcoFilter['id'];
      const listTelcoHead = telcoIdToHead[telcoId] ? telcoIdToHead[telcoId]: []
      let isHeadExist = false;
      listTelcoHead.forEach((head: any) => {
        if(params['head'] !== ''){
          if(head.indexOf(params['head']) > -1) {
            isHeadExist = true;
          }
        }
      })
      if(!isHeadExist) {
        delete telcoFilterList[key]
      }
    });

    if(params['head'].length >= 3 && Object.keys(childHeadListFilter).length > 0) {
      Object.entries(childHeadListFilter).forEach(entry => {
        const [index, childHeadFilter]:any = entry;
        if(params['head'].indexOf(childHeadFilter) > -1) {
          delete childHeadListFilter[index]
        }
      });
    }
  }
  return {
    'type'  : typeFilterList,
    'telco' : telcoFilterList,
    'head'  : headListFilter,
    'childHead' : childHeadListFilter
  };
}

export function telco (params: any, conditions: any) {
  let priceFilterList: any = {...filterList['price']}
  let typeFilterList: any  = {...filterList['type']}
  let headFilter: any      = [];
  let isFilteredPrice = false;
  for (let property in priceFilterList) {
    if (params['gte']) {
      if (priceFilterList[property]['from'] && priceFilterList[property]['from'] == params['gte']) {
        isFilteredPrice = true;
      }
    }
    if (params['lte']) {
      if (priceFilterList[property]['to'] && priceFilterList[property]['to'] == params['lte']) {
        isFilteredPrice = true;
      }
    }
    if (isFilteredPrice) {
      delete priceFilterList[property]
    }
  }
  if (params['catId']) {
    for (let property in typeFilterList) {
      if (typeFilterList[property]['id'] == params['catId']) {
        delete typeFilterList[property]
        break
      }
    }
  }
  let listTelco: any = {...telco_ids}
  let currentTelcoId:any = 0;
  for (let property in listTelco) {
    if (listTelco[property].toLowerCase() == params['telco'].toLowerCase()) {
      currentTelcoId = property
      break
    }
  }
  let childHeadListFilter:any = {};
  if (currentTelcoId) {
    const telcoIdToHead:any = {...telco_id_to_head}
    for (let property in telcoIdToHead) {
      if (property == currentTelcoId) {
        if (telcoIdToHead[property].length > 1) {
          for (let head of telcoIdToHead[property]) {
            childHeadListFilter[`dau-${head}`] = head
          }
        }
        break
      }
    }
  }
  if (conditions['minPrice'] && conditions['minPrice']) {
    let minPrice = Math.floor(conditions['minPrice']/100000);
    for (let property in priceFilterList) {
      if (priceFilterList[property].from && priceFilterList[property].from < minPrice) {
        if (priceFilterList[property].to && priceFilterList[property].to < minPrice) {
          delete priceFilterList[property]
        }
      }
    }
  }
  if(params['head'] && params['head'].length >= 3 && Object.keys(childHeadListFilter).length > 0) {
    Object.entries(childHeadListFilter).forEach(entry => {
      const [index, childHeadFilter]:any = entry;
      if(params['head'].indexOf(childHeadFilter) > -1) {
        delete childHeadListFilter[index]
      }
    });
  }
  return {
    'type'  : typeFilterList,
    'price' : priceFilterList,
    'head'  : headFilter,
    'childHead' : childHeadListFilter
  };
}