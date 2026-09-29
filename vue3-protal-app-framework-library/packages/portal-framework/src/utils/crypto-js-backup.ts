import CryptoJS from "crypto-js";
// 密钥
const key = "yearrow";

/**
 * 加密函数
 *
 * @param value 要加密的值，可选参数，默认为undefined
 * @returns 加密后的字符串
 */
function encrypt(value?: string): string {
  return CryptoJS.AES.encrypt(value, key).toString();
}

/**
 * 解密函数
 *
 * @param ciphertext 待解密的密文，可选参数，默认为undefined
 * @returns 解密后的明文
 */
function dncrypt(ciphertext?: string): string {
  return CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
}
export default {
  encrypt,
  dncrypt
};
