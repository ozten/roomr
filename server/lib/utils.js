

const CHAR_TABLE = module.exports.CHAR_TABLE = 
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

/** 
 * Given a number N and a list of unique characters, convert N
 * to N base(charTable.length)
 */
var _toBaseFoo = function _toBaseFoo(num, charTable) {
  num = Math.abs(num);
  var base = charTable.length;
  var out = "";
  var rem;

  if (num === 0) return charTable[0];

  while (num > 0) {
    rem = num % base;
    out = charTable[rem] + out;
    num = (num - rem) / base;
  }

  return out.toString();
}

var _fromBaseFoo = function _fromBaseFoo(str, charTable) {
  var base = charTable.length;
  var out = 0;
  var place = 0;
  var places = str.split('');

  while (places.length) {
    digit = places.pop();
    out += charTable.indexOf(digit) * Math.pow(base, place);
    place += 1
  }

  return out;
};

/** 
 * Convert a room's unique id to a url. The conversion function must of course
 * produce a unique url
 */
var roomUrlToId = module.exports.roomUrlToId = function urlToId(url) {
  return _fromBaseFoo(url, CHAR_TABLE); 
};

var roomIdToUrl = module.exports.roomIdToUrl = function idToUrl(room_id) {
  return _toBaseFoo(room_id, CHAR_TABLE); 
};
