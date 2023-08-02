import { Request } from "express";
import crypto from 'crypto';

import { simLoaiQuy, telco_ids } from './params'

export function generateSalt() {
  const salt = 100000 + Math.round(Math.random() * 89999);

  return salt.toString();
}

export function hashPassword(salt: string, rawPassword: string) {
  return crypto.createHash('md5').update(`${salt}:simvn:${rawPassword}`).digest("hex")
}

export function xoa_dau(str: any) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  str = str.replaceAll("?", "-").replaceAll("/", "-", ).replaceAll("&amp;*#39;", "").replaceAll(" ", "-")
  str = str.replace(/[^a-zA-Z0-9\/_|+ -]/, '');
  if (str.charAt(0) == '-') {
    str = str.slice(1)
  }
  str = str.toLowerCase()
  str = str.replace(/[\/_|+ -]+/, '-');

  // Combining Diacritical Marks
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // huyền, sắc, hỏi, ngã, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // mũ â (ê), mũ ă, mũ ơ (ư)

  return str;
}

export function get_cat_id(phone: string) {
  let pattern =
    /(2628|1368|1618|8683|5239|9279|3937|3938|3939|3333|8386|8668|4648|8888|4078|6666|3468|1668|7939|7838|7878|2879|1102|6789|6758|3737|4404)$/; //Số độc
  if (pattern.test(phone)) {
    return 78;
  } else {
    pattern = /(00000|11111|22222|33333|44444|55555|66666|77777|88888|99999)$/;
  } //VIP
  if (pattern.test(phone)) {
    return 82;
  } else {
    pattern = /(0000|1111|2222|3333|4444|5555|6666|7777|8888|9999)$/;
  } //Tứ quý
  if (pattern.test(phone)) {
    return 68;
  } else {
    pattern =
      /(((\d{3})\3)|([0-9](\d{2})[0-9]\5)|(([0-9])\7[0-9]([0-9])\8[0-9])|((\d{2})\10\10)|(([0-9])\12([0-9])\13([0-9])\14))$/;
  } //Taxi abc.abc, acc.bcc, aac.bbc, ab.ab.ab, aa.bb.cc
  if (pattern.test(phone)) {
    return 74;
  } else {
    pattern = /(000|111|222|333|444|555|666|777|888|999)$/;
  } //Tam hoa
  if (pattern.test(phone)) {
    return 80;
  } else {
    pattern =
      /(1268|1286|1186|2286|3386|4486|5586|6686|8886|9986|1168|2268|3368|4468|5568|6668|8868|9968|68168|68268|68368|68468|68568|68668|68768|68868|68968|861186|862286|863386|864486|865586|866686|867786|868886|869986|688|668|886|866)$/;
  } //Lộc phát
  if (pattern.test(phone)) {
    return 73;
  } else {
    pattern =
      /(3939|3979|7939|7979|6879|6679|8679|3339|779|3878|7838|6878|3338|3839|3879|7879|5679|3679)$/;
  } //Thần tài
  if (pattern.test(phone)) {
    return 72;
  } else {
    pattern = /(789|678|567|456|345|234|123|012)$/;
  } //Tiến lên
  if (pattern.test(phone)) {
    return 81;
  } else {
    pattern = /(5689|6689|6696|8898|8386|8689|8286|5569|1468|8699|8698|6698)$/;
  } //Dễ nhớ
  if (pattern.test(phone)) {
    return 81;
  } else {
    pattern = /((([0-9])([0-9])\4\3)|(([0-9])[0-9]\6))$/;
  } //Gánh đảo abba, axa
  if (pattern.test(phone)) {
    return 79;
  } else {
    pattern = /(((\d{2})\3)|(([0-9])\5([0-9])\6))$/;
  } //Lặp kép aabb, abab
  if (pattern.test(phone)) {
    return 67;
  } else {
    pattern =
      /(((((0[1-9]|[12][0-9]|3[01])(0?[1-9]|1[012]))|((0?[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])))[5-9][0-9])|((19[5-9][0-9])|(20[0-1][0-9])))$/;
  } //Năm sinh
  if (pattern.test(phone)) {
    return 77;
  } else {
    return 84;
  } //Tự chọn
}

export function get_duplicates(array: any) {
  return array.filter((item: any, index: any) => array.indexOf(item) !== index);
}

export function highlight_phone(phone: string) {
  if (phone.indexOf("<") > -1) {
    return phone;
  }
  const patternLap = /^([0-9])\1$/;
  const patternTuQuy = /^([0-9])\1\1\1$/; //T? quý
  const patternTamHoa = /^([0-9])\1\1$/; //Tam hoa
  if (phone.indexOf(".") > -1) {
    const list = phone.split(".");
    for (let keyduplicate of get_duplicates(list)) {
      if (keyduplicate.length >= 3) {
        return phone.replace(keyduplicate, `<i>${keyduplicate}'</i>`);
      }
    }
    if (list.length >= 2) {
      for (let i = list.length - 1; i >= 0; i--) {
        if (
          (list[i].length > 3 && patternTuQuy.test(list[i])) ||
          patternTamHoa.test(list[i])
        ) {
          phone = phone.replace(`.${list[i]}`, `.<i>${list[i]}</i>`);
        }
      }
    }
    if (phone.indexOf("<") > -1) {
      return phone;
    }
    if (list.length == 3) {
      if (list[2] == list[1]) {
        return list[0] + "<i>." + list[1] + "." + list[2] + "</i>";
      }
      if (list[2].length >= 4) {
        return list[0] + "." + list[1] + ".<i>" + list[2] + "</i>";
      }
      if (list[1].length >= 4) {
        return list[0] + "<i>." + list[1] + "</i>." + list[2];
      }
    }

    if (list.length == 4) {
      if (list[3].length == 2 && list[2].length == 2) {
        return (
          list[0] + ".<i>" + list[1] + "." + list[2] + "." + list[3] + "</i>"
        );
      }
    }

    if (list.length >= 2) {
      for (let i = list.length - 1; i >= 0; i--) {
        if (patternLap.test(list[i])) {
          phone = phone.replace(`.${list[i]}`, `.<i>${list[i]}</i>`);
        }
      }
      return phone.replace(
        list[list.length - 1],
        `<i>${list[list.length - 1]}</i>`
      );
    }
  }
  if (phone.length == 10) {
    let c = phone.split("");
    for (let k = 9; k > 0; k--) {
      for (let i = k - 1; i >= 0; i--) {
        if (c[k] != c[i]) {
          if (k - i >= 3) {
            if (k < 9) {
              return `${phone.substr(0, i + 1)}<i>${phone.substr(
                i + 1,
                k - i
              )}</i>${phone.substr(k + 1)}`;
            } else {
              return `${phone.substr(0, i + 1)}<i>${phone.substr(
                i + 1
              )}</i>`;
            }
          }
          break;
        }
      }
    }
  }
  return phone;
}

export function highlightNumber(simfull: string) {
  let number = simfull.trim().split(",").join("").split(".").join("");
  const type = get_cat_id(number);
  let regex = "";
  let regexList = [];
  switch (type) {
    case 82:
      return highlight_phone(simfull);
      // Sim VIP
      break;
    case 68:
      // Tứ quý
      return highlight_phone(simfull);
      break;
    case 74:
      return highlight_phone(simfull);
      // Taxi
      break;
    case 80:
      regex = "000|111|222|333|444|555|666|777|888|999";
      regexList = regex.split("|");
      for (let reg of regexList) {
        if (simfull.indexOf(reg) > -1) {
          return simfull.replace(
            new RegExp("(" + reg + ")"),
            `<i>${reg}</i>`
          );
        }
      }
      return highlight_phone(simfull);
      // Tam hoa
      break;
    // case 103:
    //   regex     = "0000|1111|2222|3333|4444|5555|6666|7777|8888|9999";
    //   const regexList = regex.split("|")
    //   foreach ($regexList as $reg) {
    //     if (strpos($simfull, $reg) !== false) {
    //       return preg_replace("/(" . $reg . ")/", "<i>" . $reg . "</i>", $simfull);
    //     }
    //   }
    //   return highlight_phone(simfull);
    //   break;
    // case 102:
    //   //Tam hoa kép
    //   return highlight_phone(simfull);
    //   break;
    case 81:
      regex = "6789|5678|4567|3456|2345|1234|789|678|567|456|345|234|123|012";
      regexList = regex.split("|");
      for (let reg of regexList) {
        if (simfull.substr(-reg.length) == reg) {
          return simfull.replace(new RegExp("(" + reg + ")"), `<i>${reg}</i>`);
        }
      }
      // Tiến lên
      break;
    case 67:
      if (simfull.indexOf(".") <= -1) {
        let numbers = simfull.split("");
        let highlightKey = "";
        let isCouple = false;
        for (let index = numbers.length - 1; index > 2; ) {
          const a1 = numbers[index];
          const b1 = numbers[index - 1];
          const a2 = numbers[index - 2];
          const b2 = numbers[index - 3];
          if ((a1 == a2 && b1 == b2) || (a1 == b1 && a2 == b2)) {
            isCouple = true;
            highlightKey += b1 + a1;
          } else {
            if (isCouple) {
              highlightKey = b1 + a1 + highlightKey;
              isCouple = false;
            }
          }
          index = index - 2;
        }
        if (highlightKey !== "") {
          return simfull.replace(
            new RegExp("/(" + highlightKey.trim() + ")/"),
            `<i>${highlightKey}</i>`
          );
        }
      }
      //Lặp kép AB.AB, AA.BB
      return highlight_phone(simfull);
    case 79:
      // Gánh đảo
      if (simfull.indexOf(".") <= -1) {
        let numbers = simfull.split("");
        let highlightKey = "";
        let isCouple = false;
        for (let index = numbers.length - 1; index > 2; ) {
          const a1 = numbers[index];
          const b1 = numbers[index - 1];
          const a2 = numbers[index - 2];
          const b2 = numbers[index - 3];
          if ((a1 == a2 && b1 == b2) || (a1 == b1 && a2 == b2)) {
            isCouple = true;
            highlightKey += b1 + a1;
          } else {
            if (isCouple) {
              highlightKey = b1 + a1 + highlightKey;
              isCouple = false;
            }
          }
          index = index - 2;
        }
        for (let index = numbers.length - 1; index > 2; ) {
          const a1 = numbers[index];
          const b1 = numbers[index - 1];
          const a2 = numbers[index - 2];
          const b2 = numbers[index - 3];
          if (a1 == b2 && b1 == a2) {
            isCouple = true;
            highlightKey = b1 + a1 + highlightKey;
          } else {
            if (isCouple) {
              highlightKey = b1 + a1 + highlightKey;
              isCouple = false;
            }
          }
          index = index - 2;
        }
        if (highlightKey !== "") {
          return simfull.replace(
            new RegExp("/(" + highlightKey + ")/"),
            `<i>${highlightKey}</i>`
          );
        }
      }
      return highlight_phone(simfull);
      break;
    case 77:
      // Năm sinh
      const firstFourCharacter = simfull.substr(0, 4);
      const tail = -6 - (simfull.length - 10);
      const tailCharacter = simfull.substr(tail);
      return `${firstFourCharacter}<i>${tailCharacter}</i>`;
      break;
    case 72:
      regex =
        "1515|2626|2628|1368|1618|8683|5239|9279|3937|3938|3939|8386|8668|4648|4078|3468|1668|7939|7838|7878|2879|1102|6758|3737|4404|49532626|5239|9279|3937|3939|3333|8386|8668|4648|4078|3468|6578|6868|1668|8686|73087|1122|6789|0607|0378|8181|6028|7762|3609|8163|9981|7749|6612|5510|1257|0908|8906|1110|7749|2204|4444|8648|0404|0805|3546|5505|2306|1314|5031|2412|1920227|151618|181818|191919|2204|1486|01234|456|39|38|78|38";
      // Số độc
      regexList = regex.split("|");
      for (let reg of regexList) {
        if (simfull.substr(-reg.length) == reg) {
          return simfull.replace(
            new RegExp("/(" + reg + ")/"),
            `<i>${reg}</i>`
          );
        }
      }
      return highlight_phone(simfull);
      break;
    case 73:
      regex =
        "1268|1286|1186|2286|3386|3568|38386|4486|5586|6686|8886|9986|1168|2268|3368|4468|6186|5568|6668|8868|8966|9968|8686|68168|68268|68368|68468|68568|68668|68768|68868|68968|861186|862286|863386|864486|865586|866686|867786|868886|869986|688|966|668|886|866|266|686|366|883";
      // Số độc
      regexList = regex.split("|");
      for (let reg of regexList) {
        if (simfull.substr(-reg.length) == reg) {
          return simfull.replace(
            new RegExp("/(" + reg + ")/"),
            `<i>${reg}</i>`
          );
        }
      }
      return highlight_phone(simfull);
    // case 70:
    //   // Ông địa
    //   $regex = "7838|7878|2879|1102|6758|3737|4404|49532626|5239|9279|3937|3939|3333|8386|8668|4648|4078|3468|6578|6868|1668|8686|73087|1122|6789|0607|8181|6028|7762|3609|8163|9981|7749|6612|1688|6368|1368|3386|3688|3388|5510|1257|0908|8906|1110|7749|2204|4444|8648|0404|0805|3546|5505|2306|1314|5031|2412|1920227|151618|181818|191919|2204|1486|01234|456|39|38|78|38";
    //   // Số độc
    //   $regexList = explode("|", $regex);
    //   foreach ($regexList as $reg) {
    //     if (substr($simfull, - strlen($reg)) == $reg) {
    //       return preg_replace("/(" . $reg . ")/", "<i>" . $reg . "</i>", $simfull);
    //     }
    //   }
    //   break;
    default:
      return highlight_phone(simfull);
      break;
  }
}

export function parsePaginationAndSortData(req: Request & any) {
  let { limit, page, sort, direction } = req.query;

  limit = parseInt(limit) || 10;
  page = parseInt(page) || 1;
  const skip = (page - 1)*limit;

  sort = ['createdAt', 'applied'].includes(sort) ? sort : 'createdAt';
  direction = ['asc', 'desc'].includes(direction) ? direction : 'desc';
  const sortDirectionMapping: any = { asc: 1, desc: -1 };
  const sortBy = { [sort]: sortDirectionMapping[direction] };

  return { page, limit, skip, sortBy };
}

export function shuffle(array: any) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function detectCategoryTitleAndFormat (categoryId: any, head: any, middle: any, tail: any, filter: any = false) {
  let categoryText = '';
  let tailLoaiQuy = 0;
  if (simLoaiQuy.includes(categoryId)) {
    tailLoaiQuy = tail.substr(-1);
  }
  let format = '';
  if (tail !== '') {
    //Có đuôi
    format = '*' + tail;
    //Có giữa
    if (middle !== '' && head === '') {
      format = '*' + middle + format;
      if (categoryId) {
        categoryText += ' giữa ' + middle;
      } else {
        categoryText += ' SIM đuôi số ' + tail + ' giữa ' + middle;
      }
    }
    //Có đầu
    if (head !== '') {
      if (middle !== '') {
        format = head + middle + format;
        if (categoryId) {
          categoryText += ' đầu ' + head + ' giữa ' + middle;
        } else {
          categoryText += ' SIM đuôi số ' + tail + ' đầu ' + head + ' giữa ' + middle;
        }
      } else {
        format = head + format;
        if (categoryId) {
          if (tailLoaiQuy) {
            categoryText += ' ' + tailLoaiQuy;
            if(!filter) {
              categoryText +=  ' đầu ' + head;
            }
          } else {
            categoryText += ' ' + tail + ' đầu ' + head;
          }
        } else {
          categoryText += ' SIM đuôi số ' + tail + ' đầu ' + head;
        }
      }
    }else{
      //Không đầu, không giữa
      categoryText += ' SIM đuôi số ' + tail;
    }
  } else {
    // Có đầu không đuôi
    if (head !== '') {
      format = head + '*';
      if (middle !== '') {
        format = format + middle + '*';
        if (simLoaiQuy.includes(categoryId) || (middle === '' && tail === '')) {
          categoryText += ' giữa ' + middle;
        } else {
          categoryText += ' Sim số đẹp đầu ' + head + ' giữa ' + middle;
        }
      } else {

        if (simLoaiQuy.includes(categoryId) && (middle === '')) {
          if(!filter){
            categoryText += ' đầu ' + head;
          }
        } else {
          categoryText += ' SIM đầu số ' + head;
        }
      }
    } else {
      if (middle !== '') {
        format       = '*' + middle + '*';
        categoryText += ' Sim số đẹp ' + middle + ' giữa';
      }
    }
  }
  return {
    'categoryText' : categoryText,
    'format'       : format,
  };
}

export function detectPriceTitleAndFormat (queryPrams: any) {
  let minPrice = 0;
  let maxPrice = 0;
  let textFrom = '';
  let textTo = '';
  let multipleFrom = 1000;
  let multipleTo   = 1000;
  let head       = queryPrams.head ? queryPrams.head : "";
  let middle       = queryPrams.middle ? queryPrams.middle : "";
  let tail    = queryPrams.tail ? queryPrams.tail : "";
  let from         = queryPrams.lessPrice ? queryPrams.lessPrice : "";
  let dvFrom       = queryPrams.lessUnit ? queryPrams.lessUnit : "";
  let to           = queryPrams.greaterPrice ? queryPrams.greaterPrice : "";
  let dvTo         = queryPrams.greaterUnit ? queryPrams.greaterUnit : "";
  let filter       = queryPrams.filter ? queryPrams.filter : "";
  let priceText        = '';
  if (dvFrom != "") {
    if (dvFrom == 'nghin') {
      minPrice = from;
      textFrom = 'nghìn';
    } else if (dvFrom == 'trieu') {
      minPrice     = from;
      textFrom     = 'triệu';
      multipleFrom = 1000000;
    } else if (dvFrom == 'ty') {
      minPrice     = from;
      textFrom     = 'tỷ';
      multipleFrom = 1000000000;
    }
    if (dvTo != "") {
      priceText = 'Sim giá từ ' + from + ' ' + textFrom;
    } else {
      priceText = 'Sim giá trên ' + from + ' ' + textFrom;
    }
  }
  if (dvTo != "") {
    if (dvTo == 'nghin') {
      maxPrice = to;
      textTo   = 'nghìn';
    } else if (dvTo == 'trieu') {
      maxPrice   = to;
      textTo     = 'triệu';
      multipleTo = 1000000;
    }else if (dvTo == 'ty') {
      maxPrice   = to;
      textTo     = 'tỷ';
      multipleTo = 1000000000;
    }

    if (dvFrom != "") {
      priceText += ' đến ' + to + ' ' + textTo;
    } else {
      priceText += 'Sim giá dưới ' + to + ' ' + textTo;
    }
  }
  if (head && !filter) {
    priceText += ' đầu ' + head;
  }

  let format = '';
  if(head !== '') {
    format += head+'*';
  }
  if (middle !== '') {
    if (head !== '') {
      format +=  middle + '*';
    }else{
      format += '*' + middle + '*';
    }
  }
  if(tail !== '') {
    if (head !== '' ||  middle !== '') {
      format +=  tail;
    }else{
      format += '*' + tail;
    }
  }
  let telcoId    = queryPrams.t ? queryPrams.t : 0
  let catId      = queryPrams.catId ? queryPrams.catId : 0
  return {
    'priceText' : priceText,
    'format'    : format,
    'minPrice'  : minPrice * multipleFrom,
    'maxPrice'  : maxPrice * multipleTo,
    'telcoId' : telcoId,
    'catId' : catId
  }
}

export function checkmang (simso:any) {
  let mang: any = [];

  mang[0] = {}
  mang[0]['tenmang'] = "";
  mang[0]['dauso'] = "";
  mang[1] = {};
  mang[1]['tenmang'] = "viettel";
  mang[1]['dauso'] = "096,097,098,0162,0163,0164,0165,0166,0167,0168,0169,086,032,033,034,035,036,037,038,039,";
  mang[1]['tukhoa'] = "viettel,vietel,viettell,viet tel";

  mang[2] = {};
  mang[2]['tenmang'] = "vinaphone";
  mang[2]['dauso'] = "091,094,0123,0124,0125,0127,0129,088,081,082,083,084,085,";
  mang[2]['tukhoa'] = "vina,vinaphone,vinafone";

  mang[3] = {};
  mang[3]['tenmang'] = "mobifone";
  mang[3]['dauso'] = "090,093,0120,0121,0122,0126,0128,089,070,076,077,078,079,";
  mang[3]['tukhoa'] = "mobi,mobifone,mobiphone,mobi phone,mobi fone";

  mang[4] = {};
  mang[4]['tenmang'] = "vietnamobile";
  mang[4]['dauso'] = "092,0188,052,056,058";
  mang[4]['tukhoa'] = "vietnamobile,vietnammobile,vietnam mobile";

  mang[5] = {};
  mang[5]['tenmang'] = "gmobile";
  mang[5]['dauso'] = "099,0199,059,";
  mang[5]['tukhoa'] = "gmobile,g mobile";

  mang[6] = {};
  mang[6]['tenmang'] = "sfone";
  mang[6]['dauso'] = "095,";
  mang[6]['tukhoa'] = "sfone,s fone,s phone,sphone";

  mang[7] = {};
  mang[7]['tenmang'] = "máy bàn";
  mang[7]['dauso'] = "042,046,049,086,084,";
  mang[7]['tukhoa'] = "may ban,co dinh,homephone,gphone, home phone,g phone";

  mang[8] = {};
  mang[8]['tenmang'] = "iTelecom";
  mang[8]['dauso'] = "087";
  mang[8]['tukhoa'] = "sim itelecom, sim đông dương, sim indochina";

  mang[9] = {};
  mang[9]['tenmang'] = "Reddi";
  mang[9]['dauso'] = "055";
  mang[9]['tukhoa'] = "sim reddi";

  let tenmang            = "máy bàn";

  const sosim2             = simso.replace("/[^0-9]/", "");
  const dauso3             = sosim2.substr( 0, 3) + ",";
  const dauso4             = sosim2.substr(0, 4) + ",";
  for (let value of mang) {
    if ( (value['dauso'].indexOf(dauso3) > -1) || (value['dauso'].indexOf(dauso4) > -1) ) {
      tenmang = value['tenmang']
      break
    }
  }
  return tenmang
}

export function get_id_mang (mang: any) {
  const loaiMang = JSON.parse(JSON.stringify(telco_ids))
  let ok: any = 0
  for (let property in loaiMang) {
    if (loaiMang[property].toLowerCase() == mang.toLowerCase()) {
      ok = property
      break;
    }
  }
  return ok
}