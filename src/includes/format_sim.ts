import { categoryList, telco_ids, tra_gop } from './params'
import { xoa_dau, highlightNumber } from './helper'
import * as _ from 'lodash';

export function getHighlight (f: any, _id: any) {
  if (f) {
    return highlightNumber(f);
  }
  return highlightNumber(_id);
}

export function getTelcoText (t: any) {
  const listTelco:any = telco_ids
  if (listTelco[t]) {
    return listTelco[t].toLowerCase()
  }
  return '';
}

export function getPriceFormatted (pn: number) {
  const VND = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
  return VND.format(pn)
}

export function getCategoryText (c2: any) {
  return categoryList[c2] ? categoryList[c2].text : ""
}

export function getCategoryUrl (c2: any) {
  let url = ''
  if (categoryList[c2]) {
    url = categoryList[c2] ? categoryList[c2].url : ""
    if (!url) {
      url = xoa_dau(categoryList[c2].text)
    }
  }
  return url
}

export function getPriceInstallment (s3: any, pn: any) {
  const traGopConfig: any = {...tra_gop}
  let listKhoTraGop = Object.keys(traGopConfig);
  if(s3){
    let isTraGop = _.intersection(listKhoTraGop, s3);
    if(isTraGop.length > 0 && pn >= 20000000){
      const khoTraGop = isTraGop[0];
      if(traGopConfig[khoTraGop]) {
        const traGopCuaKho = traGopConfig[khoTraGop];
        const saleOff = traGopCuaKho['sale'] ? traGopCuaKho['sale'] : 0;
        let prePaymentPlan = 0;
        if(traGopCuaKho['prePaymentPercent']){
          if(traGopCuaKho['prePaymentPercent'][0]){
            const giamGia = pn  - saleOff;
            const percent = traGopCuaKho['prePaymentPercent'][0];
            prePaymentPlan = (giamGia)*percent/100;
          }
        }
        let installmentValue = pn  - saleOff - prePaymentPlan;
        let interestRate = 0;
        if(traGopCuaKho['rate']){
          traGopCuaKho['rate'].forEach((rate: any) => {
            if(rate['from'] && rate['from'] <= installmentValue){
              if(rate['to']){
                if(rate['to'] >= installmentValue)
                  interestRate = rate['value'];
              }else{
                interestRate = rate['value'];
              }
            }
          })
        }
        let monthDurationValue = 24;
        if(pn <= 4000000){
          monthDurationValue = 6;
        }
        if(traGopCuaKho['defaultMonth']){
          monthDurationValue = traGopCuaKho['defaultMonth'];
        }
        if(s3.includes(4003)){
          if(pn <= 50000000){
            monthDurationValue = 6;
          }
        }

        installmentValue = pn  - saleOff - prePaymentPlan;
        let interestByInstallment = interestRate/100;
        let tich =  (1 + interestByInstallment)**monthDurationValue;
        tich = tich * interestByInstallment;
        tich = tich*installmentValue;
        let soChia = ((1 + interestByInstallment)**monthDurationValue) - 1;
        let perMonthValue = tich/soChia/10000;
        perMonthValue = Math.ceil(perMonthValue)*10;
        return perMonthValue.toLocaleString() + "k/tháng";
      }

    }

  }
  return '';
}

export function formatListSim (listSimOnpage: any) {
  listSimOnpage = listSimOnpage.map((item: any) => item._source);
  listSimOnpage.map((item: any) => {
    item.highlight = getHighlight(item.f, item._id);
    item.telcoText = getTelcoText(item.t);
    item.priceFormatted = getPriceFormatted(item.pn);
    item.categoryText = getCategoryText(item.c2);
    item.categoryUrl = getCategoryUrl(item.c2);
    item.priceInstallment = getPriceInstallment(item.s3, item.pm);
    delete item.s3
    delete item.pb
    delete item.d
    // delete item.f
    // delete item.id
    delete item.d2
    // delete item.c2
    delete item.pn
    delete item.hg
  });
  return listSimOnpage
}