//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//
// 共通ユーティリティ
//
////////////////////////////////////////////////////////////////////////////////
export default class TwFuncUtil {

  /**
   * 機能別ユーティリティクラスのクラス定義マップ
   * @type {object} 
   */
  static utilDefMap = {};

  /** 
   * 機能別ユーティリティ利用宣言
   * ※機能別は利用したい機能がuseをコールして利用する
   * @async
   * @param {string} type 利用したいタイプ
   */
  static async use(type){
    let vArrUtilType = type.split(",");
    for (let j=0; j<vArrUtilType.length; j++) {
      if (typeof TwFuncUtil.utilDefMap[vArrUtilType[j]] == "undefined") {//定義がまだ読まれていない場合
        let basePath = ".";
        if (typeof TwFunc.twFuncDefBasePathMap["util." + vArrUtilType[j]] != "undefined") {
          basePath = TwFunc.twFuncDefBasePathMap["util." + vArrUtilType[j]];
        }
        try {
          console.log("util-" + vArrUtilType[j] + " を生成");
          let module = await import(basePath + "/func.util." + vArrUtilType[j] + ".js?" + window.TwFuncVer);
          TwFuncUtil[vArrUtilType[j]] = module.default;
          TwFuncUtil.utilDefMap[vArrUtilType[j]] = module.default;
        } catch(e) {
          throw new Error(e);
        }
      }
    }
  }

//==============================================================================
// 
// 以下は、全体共通のユーティリティ
// 
//==============================================================================

  /** 
   * 数字だけの文字列かどうか
   * @param {string} str
   * @return {boolean}
   */
	static isNumberOnly(str) {
    if (str.match(/[^0-9]/g)){
      return false;
    }
  	return true;
  }


}