import CryptoJS from "crypto-js";

// 默认加解密，十六位十六进制数作为密钥和偏移量
const defaultKey = "xViwLY6Auz1wd9sU"; // 秘钥
const defaultIV = "0BiT8j0ZelK4CjHa"; // 秘钥偏移量

/**
 * 消息加密
 * @param {*} msgStr
 * @param {*} key
 * @param {*} iv
 */
const encodeMsg = (msgStr, key, iv) => {
  key = CryptoJS.enc.Utf8.parse(key || defaultKey);
  iv = CryptoJS.enc.Utf8.parse(iv || defaultIV);
  const encrypted = CryptoJS.AES.encrypt(msgStr, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  const encryptedStr = encrypted.toString();
  return encryptedStr;
};

/**
 * 消息解密
 * @param {*} msgStr
 * @param {*} key
 * @param {*} iv
 */
const decodeMsg = (msgStr, key, iv) => {
  key = CryptoJS.enc.Utf8.parse(key || defaultKey);
  iv = CryptoJS.enc.Utf8.parse(iv || defaultIV);
  const decrypt = CryptoJS.AES.decrypt(msgStr, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
};

export { encodeMsg, decodeMsg };
