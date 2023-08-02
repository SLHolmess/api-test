import { head_list, categoryList, simLoaiQuyLength, simLoaiQuy, priorityStores, fieldQuery, available_attributes } from '../../includes/params'
import { xoa_dau } from '../../includes/helper'

export function detectFormat (linkQuery: any, keywordsArray:any) {
  let link         = linkQuery.replace('/', '');
  let head         = '';
  let detectFormat = '';
  let middle       = '';
  let tail         = '';
  let listCategory = categoryList;
  let redirect     = false;
  let redirectUrl  = '';
  switch (keywordsArray.length) {
    case 1:
      //Search không có dấu *
      tail = detectFormat = keywordsArray[0];
      let dauSoArray = head_list;
      let isDauSo    = false;

      isDauSo = dauSoArray.includes(tail) || (tail.length === 4 && dauSoArray.includes(tail.substring(0, 3)));
      
      if (isDauSo) {
        return {
          'redirect': true,
          'redirectUrl': `sim-dau-so-${tail}`
        }
      }
      break;
    case 2:
      //Search với 1 dấu *
      head = keywordsArray[0];
      tail = detectFormat = keywordsArray[1];
      break;
    case 3:
      head         = keywordsArray[0];
      detectFormat = tail = keywordsArray[2];
      middle       = keywordsArray[1];
      break;
    default:
      break;
  } 

  const catId         = get_cat_id2(detectFormat);
  if (simLoaiQuy.includes(catId) && detectFormat != '' && simLoaiQuyLength[catId] === detectFormat.length) {
    redirect = true;
    if (listCategory[catId]) {
      if (listCategory[catId]['url']) {
        redirectUrl = listCategory[catId]['url'];
      } else {
        redirectUrl = xoa_dau(listCategory[catId]['text']);
      }
      redirectUrl += `-${detectFormat}`;
      if (middle != '') {
        redirectUrl += '-giua';
      }
    }
    if (head != '') {
      redirectUrl += `-dau-${head}`;
    }
  } else {
    if (tail !== '') {
      redirectUrl = `sim-so-dep-duoi-${tail}`;
    }
    if (head != '') {
      if (tail !== '') {
        redirectUrl += `-dau-${head}`;
      } else {
        redirectUrl += `sim-dau-so-${head}`;
      }
    }
    if (middle != '') {
      if (redirectUrl != '') {
        if (head != '') {
          redirectUrl = `sim-so-dep-${middle}-giua-dau-${head}`;
        } else {
          redirectUrl += `-giua-${middle}`;
        }
      } else {
        redirectUrl = `sim-so-dep-${middle}-giua`;
      }
    }
    redirect = true;
    if (link === redirectUrl) {
      redirect = false;
    }
  }
  return {
    'redirect'    : redirect,
    'redirectUrl' : redirectUrl
  }
}

export function get_cat_id2 (phone: any) {

  let pattern = /(000000000|111111111|222222222|333333333|444444444|555555555|666666666|777777777|888888888|999999999)/; //Vãi Quý
  if (pattern.test(phone)) {
    return 82;
  } else {
    pattern = /(00000000|11111111|22222222|33333333|44444444|55555555|66666666|77777777|88888888|99999999)/; //Bát Quý
    if (pattern.test(phone)) {
      return 82;
    } else {
      if (pattern.test(phone)) {
        return 78;
      }
      pattern = /(0000000|1111111|2222222|3333333|4444444|5555555|6666666|7777777|8888888|9999999)/; //Thất Quý
      if (pattern.test(phone)) {
        return 82;
      } else {
        pattern = /(000000|111111|222222|333333|444444|555555|666666|777777|888888|999999)/; //Lục Quý
        if (pattern.test(phone)) {
          return 100;
        } else {
          pattern = /(00000|11111|22222|33333|44444|55555|66666|77777|88888|99999)/; //Ngũ Quý
          if (pattern.test(phone)) {
            return 99;
          } else {
            pattern = /(0000|1111|2222|3333|4444|5555|6666|7777|8888|9999)/; //Tứ quý
            if (pattern.test(phone)) {
              return 68;
            } else {
              pattern = /(.*)(000000|111111|222222|333333|444444|555555|666666|777777|888888|999999)(.*)/; //Lục Quý giữa
              if (pattern.test(phone)) {
                return 105;
              } else {
                pattern = /(.*)(00000|11111|22222|33333|44444|55555|66666|77777|88888|99999)(.*)/; //Ngũ Quý giữa
                if (pattern.test(phone)) {
                  return 104;
                } else {
                  pattern = /(.*)(0000|1111|2222|3333|4444|5555|6666|7777|8888|9999)(.*)/; //Tứ quý giữa
                  if (pattern.test(phone)) {
                    return 103;
                  } else {

                  }
                }
              }
              pattern = /(000|111|222|333|444|555|666|777|888|999)/; //Tam hoa
              if (pattern.test(phone)) {
                pattern = /(000|111|222|333|444|555|666|777|888|999)/; //Tam hoa kép
                if (phone.substr(0, phone.length - 3).match(pattern)) {
                  return 102;
                }
                return 80;
              } else {
                pattern = /(((\d{3})\3)|((\d{2})\5\5)|((\d{4})\7)|(([0-9])\9\9\9([0-9])\10\10\10))/; //Taxi ABC.ABC, AB.AB.AB, ABCD.ABCD, AAAA.BBBB
                if (pattern.test(phone)) {
                  return 74;
                }
                pattern = /(66|88|68|86|88|69|96)/; //Lộc phát
                if (pattern.test(phone)) {
                  return 73;
                }
                pattern = /(39|79)/; //Thần tài
                if (pattern.test(phone)) {
                  return 72;
                }
                pattern = /(789|678|567|456|345|234|123|012)/; //Tiến lên A(A+1)(A+2), AB.A(B+1).A(B+2), AB.(A+1)B.(A+2)B ??????????
                if (pattern.test(phone)) {
                  return 81;
                }
                pattern = /(38|78)/; //Ông địa
                if (pattern.test(phone)) {
                  return 70;
                }
                pattern = /((([0-9])([0-9])\4\3)|(([0-9])([0-9])([0-9])\8\7\6))/; //Gánh đảo AB.BA, ABC.CBA
                if (pattern.test(phone)) {
                  return 79;
                }
                pattern = /(((\d{2})\3)|(([0-9])\5([0-9])\6))/; //Lặp kép AB.AB, AA.BB
                if (pattern.test(phone)) {
                  return 67;
                }
                let arrc = phone.split("");
                let len  = arrc.lenth - 1;
                if (len >= 3) {
                  if ((arrc[len] == arrc[len - 1]) && arrc[len - 2] == arrc[len - 3]) { //kep
                    return 120;
                  } else if ((arrc[len] == arrc[len - 2]) && arrc[len - 1] == arrc[len - 3]) { //lap
                    return 123;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  pattern = /((([0-9])\3[0-9]\3\3[0-9])|(([0-9])([0-9])\6\5([0-9])\7)|(([0-9])\9[0-9]([0-9])\10[0-9])|([0-9]([0-9])\12[0-9]\12\12))/; //Dễ nhớ AAB.AAC, ABB.ACC, AAB.CCD, ABB.CBB
  if (pattern.test(phone)) {
    return 76;
  }
  pattern = /(0[1-9]|[1-2][0-9]|31(?!(?:0[2469]|11))|30(?!02))(0[1-9]|1[0-2])(((19)?[5-9][0-9])|((20)?[0-1][0-9]))/; //Năm sinh
  if (pattern.test(phone)) {
    return 77;
  }
  pattern = /^(0913|0903|0983)/; //Đầu cổ 0913, 0903, 0983
  if (pattern.test(phone)) {
    return 106;
  }
  pattern = /(8683|1515|2626|2628|1368|1618|8683|5239|9279|3937|3938|3939|8386|8668|4648|4078|3468|1668|7939|7838|7878|2879|1102|6789|6758|3737|4404|49532626|5239|9279|3937|39|38|3939|3333|8386|8668|4648|4078|3468|6578|6868|1668|8686|73087|1122|6789|6758|0607|0378|8181|3737|6028|7762|3609|8163|9981|7749|6612|5510|1257|0908|8906|1110|7749|2204|4444|8648|0404|0805|3546|5505|2306|1314|5031|2412|1920227|151618|181818|191919|2204|1486|01234|456)/; //Số độc
  if (pattern.test(phone)) {
    return 78;
  }
  return 84; //Tự chọn
}