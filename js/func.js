////////////////////////////////////////////////////////////////////////////////
//
// 機能基底クラス定義
//
////////////////////////////////////////////////////////////////////////////////
export default class TwFunc {

  /**
   * 一意な識別子生成用の番号（画面内で一意）
   * @type {number} 
   */
  static seq = 0;

  /**
   * 機能実装クラスのクラス定義マップ
   * @type {object} 
   */
  static twFuncDefMap = {};

  /**
   * 機能実装クラスのクラス定義ベースパスマップ
   * @type {object} 
   */
  static twFuncDefBasePathMap = {};


  /**
   * 機能実装クラス（TwFunc）のインスタンスマップ
   * @type {object} 
   */
  static instanceMap = {};

  /**
   * ユーティリティ作成済みかどうか
   * @type {object} 
   */
  static is_util_already = false;


  /**
   * DOM追加時に自動的にcreateするかどうか
   * @type {boolean} 
   */
  static autoCreateMode = true;


  /**
   * autoCreateModeの準備が完了したかどうか
   * @type {boolean} 
   */
  static is_auto_create_already = false;

  /**
   * TwInputControl.initSetting をコールしたかどうか
   * @type {boolean} 
   */
  static is_tw_input_control_init = false;

  /**
   * 機能名
   * @type {string} 
   */
  type = "";

  /**
   * 独自CSSを持っているかどうか
   * @type {boolean} 
   */
  originalCss = true;

  /**
   * 起動オプション　※現在未使用
   * @type {object} 
   */
  opt = {};

  /** 
   * コンストラクタ―
   * @param {string} type 機能名
   * @param {object} opt 起動オプション
   */
  constructor(type, opt = {}) {
    this.type = type;
    this.opt = opt;//TODO: 必要になったら使用
  }

  /** 
   * 対応した機能のCSSファイルのURLを取得
   * @static
   * @param {string} type
   * @param {string} basePath
   * @return {string}
   */
  static getCssURL(type, basePath = "."){
    let ar = import.meta.url.split("/");
    ar.pop();
    return ar.join("/") + "/" + basePath + "/css/func." + type + ".css";
  }

  /** 
   * 機能クラスのインスタンスを取得 ※この関数は非同期(async)
   * @async
   * @static
   * @param {HTMLElement} elm
   * @param {object} opt 起動オプション
   * @return {TwFunc} 機能インスタンス
   */
  static async getInstance(type, opt = {}){
    if (typeof TwFunc.instanceMap[type] == "undefined") {
      let is_first = false;
      if (typeof TwFunc.twFuncDefMap[type] == "undefined") {//定義がまだ読まれていない場合
        is_first = true;
        let basePath = ".";
        if (typeof TwFunc.twFuncDefBasePathMap[type] != "undefined") {
          basePath = TwFunc.twFuncDefBasePathMap[type];
        }
        try {
          console.log("func=" + type + " を生成");
          let module = await import(basePath + "/func." + type + ".js?" + window.TwFuncVer);
          TwFunc.register(type, module.default);
        } catch (e) {
          throw new Error(e);
        }
      }
      TwFunc.instanceMap[type] = new TwFunc.twFuncDefMap[type](opt);

      if (is_first) {
        try {
          //独自CSS読み込み
          if (TwFunc.instanceMap[type].originalCss) {
            let basePath = ".";
            if (typeof TwFunc.twFuncDefBasePathMap[type] != "undefined") {
              basePath = TwFunc.twFuncDefBasePathMap[type];
            }
            const res = await fetch(TwFunc.getCssURL(type, basePath) + "?" + window.TwFuncVer);
            if (res.status == 200) {
              const sheet = new CSSStyleSheet();
              await sheet.replace(await res.text());
              document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
            }
          }

        } catch (e) {
          //何もしない
        }
      }
    }
    return TwFunc.instanceMap[type];
  }

  /** 
   * ユーティリティーロード ※この関数は非同期(async)
   * @async
   * @static
   */
  static async loadUtil(){
    if (!TwFunc.is_util_already) {
      let module = await import("./func.util.js?" + window.TwFuncVer);

      //グローバルに使用できるように設定
      window.TwFuncUtil = module.default;

      TwFunc.is_util_already = true;
    }
  }

  /** 
   * 一度だけ実行される設定
   * @static
   */
  static async initSetting(){

    //自動create設定
    if (!TwFunc.is_auto_create_already) {
      //dom監視を実行
      let observer = new MutationObserver(function(mutationList, observer) {
        if (TwFunc.autoCreateMode) {
          (async function(){
            for (const mutation of mutationList) {
              if (mutation.addedNodes && mutation.addedNodes.length) {
                //let type = Object.keys(TwFunc.twFuncDefMap).join(",");
                //if (type != "") {
                //  await TwFunc.create(type, addedNode);
                //}
                for (const addedNode of mutation.addedNodes) {
                  if (addedNode instanceof HTMLElement) {
                    let types = TwFunc.getTypeList(addedNode);
                    if (types.length) {
                      await TwFunc.create(types.join(","), addedNode);
                    }
                  }
                }
              }
            }
          })();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
      });

      TwFunc.is_auto_create_already = true;
    }

    //TwInputControlの初期化
    if (!TwFunc.is_tw_input_control_init) {
      await TwInputControl.initSetting();
      TwFunc.is_tw_input_control_init = true;
    }
  }

  /** 
   * 対象機能クラス定義の登録
   * @static
   * @param {HTMLElement} elm
   * @param {array}
   */
  static getTypeList(elm) {
    let funcList = {};
    let setFuncList = function(func) {
      if (func) {
        let ar = func.split(",");
        for (let _func of ar) {
          _func = _func.trim();
          funcList[_func] = _func;
        }
      }
    }
    if ($(elm).attr("func")) {
      setFuncList($(elm).attr("func"));
    } else {
      $(elm).find("[func]").each(function(){
        setFuncList($(this).attr("func"));
      });
    }
    return Object.keys(funcList);
  }

  /** 
   * 対象機能クラス定義の登録
   * @static
   * @param {string} type 機能名
   * @param {TwFunc} twfunc クラス定義
   */
  static register(type, twfunc) {
    TwFunc.twFuncDefMap[type] = twfunc;
  }

  /** 
   * 対象機能クラス定義パスの登録
   * @static
   * @param {string} type 機能名
   * @param {TwFunc} twfunc クラス定義
   */
  static registerBasePath(type, basePath) {
    TwFunc.twFuncDefBasePathMap[type] = basePath;
  }

  /** 
   * 対象機能クラスのインスタンス作成し返却する
   * @async
   * @static
   * @param {string} type 機能名
   * @param {HTMLElement} target 対象を探す起点要素（自身含む）
   * @param {object} opt 起動オプション
   * @return {TwFunc|array|boolean} type の指定が１つだった場合、TwFuncのインスタンスを返却、複数指定の場合、配列でTwFuncインスタンスを返却
   */
  static async create(type, target = document, opt = {}) {
    try {
      //utilを生成
      if (!TwFunc.is_util_already) {
        await TwFunc.loadUtil();
      }

      let vArrType = type.split(",");
      if (vArrType.length == 1) {
        let _vFunc = await TwFunc.getInstance(type, opt);
        _vFunc.util = TwFunc.instanceMap["util"];
        await _vFunc.init(target);
        if (!TwFunc.is_auto_create_already) {
          await TwFunc.initSetting();
        }
        return _vFunc;
      } else {
        let _vArrFunc = [];
        for (let i=0; i<vArrType.length; i++) {
          let _vFunc = await TwFunc.getInstance(vArrType[i], opt);
          _vFunc.util = TwFunc.instanceMap["util"];
          await _vFunc.init(target);
          _vArrFunc.push(_vFunc);
        }
        if (!TwFunc.is_auto_create_already) {
          await TwFunc.initSetting();
        }
        return _vArrFunc;
      }
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  /** 
   * 一意な識別子を取得（未設定の場合はセットして返却）
   * @static
   * @param {HTMLElement} elm
   * @return {string} 一意な識別子
   */
  static getIdent(elm){
    let _elm = $(elm)[0];
    if (typeof _elm.__twfunc_ident == "undefined") {
      TwFunc.seq++;
      _elm.__twfunc_ident = "twfunc_ident" + TwFunc.seq;
    }
    return _elm.__twfunc_ident;
  }

  /** 
   * オプションを返却
   * @static
   * @param {HTMLElement} elm
   * @param {RegExp} matchPattern
   * @return {object} matchPattern を削除したオプション名をキーにした配列を返却
   */
  static getAttrValues(elm, matchPattern) {
  	if (!elm || !matchPattern || !elm.attributes.length) return {};

  	let result  = {};
  	let attrs   = elm.attributes;
  	let matches = [];

  	for (var i = 0, len = attrs.length; i < len; i++) {
  		if (matches = attrs[i].name.match(matchPattern)) {
        let name = attrs[i].name.replace(matches, "");
        result[name] = attrs[i].value;
  		}
  	}

  	return result;
  }

  /** 
   * オプションを返却
   * @param {HTMLElement} elm
   * @return {object} オプション名をキーにした配列
   */
  getOptions(elm) {
    return TwFunc.getAttrValues($(elm)[0], new RegExp("^" + this.type + "-"));
  }

  /** 
   * 初期化　※継承クラスがオーバーライドする
   * @async
   * @param {HTMLElement} target 対象を探す起点要素（自身含む）
   */
  async init(target = document){

  }

  /** 
   * 機能設定されている対象要素のリストを返却
   * @param {HTMLElement} elm
   * @return {array} HTMLElementの配列
   */
  getTargetElements(elm = document) {
    let self = this;
    let targetElements = [];

    if (self.isTarget(elm)) {
      TwInputControl.getInstance(elm);//ここでTwInputControlインスタンスを設定しておく
      targetElements.push(elm);
    } else {
      $(elm).find("[func]").each(function(){
        if (self.isTarget(this)) {
          TwInputControl.getInstance(this);//ここでTwInputControlインスタンスを設定しておく
          targetElements.push(this);
        }
      });
    }

    return targetElements;
  }

  /** 
   * 機能要素判定
   * @param {HTMLElement} elm
   * @return {boolean}
   */
  isTarget(elm) {
    let func = $(elm).attr("func");
    if (!func) {
      return false;
    }
    let vArrFunc = func.split(",");
    for (let i=0; i<vArrFunc.length; i++) {
      if (vArrFunc[i].trim() == this.type) {
        return true;
      }
    }
    return false;
  }

}


////////////////////////////////////////////////////////////////////////////////
//
// 入力コントールクラス定義
//
////////////////////////////////////////////////////////////////////////////////
export class TwInputControl {

  /**
   * 入力コントールクラス（TwInputControl）のインスタンスマップ
   * @type {object} 
   */
  static instanceMap = {};

  /**
   * エラーが発生している要素のマップ
   * @type {object} 
   */
  static errorMap = {};


  /**
   * 対象要素
   * @type {HTMLElement} 
   */
  elm = null;

  /**
   * EFOクラス
   * @type {efo} 
   */
  efo = null;

  /**
   * EFOオプション
   * @type {object} 
   */
  efoOptions = {};

  /**
   * デフォルトEFOオプション
   * @type {object} 
   */
  defaultEfoOptions = {
    mode: ""
  };

  /**
   * 最適化モード※全体用で個別適用不可
   * @type {number} 
   */
  static efoMode = 1; //0:最適化しない 1:最適化する


  /**
   * バリデーションモード※全体用で個別適用不可
   * @type {number} 
   */
  static valMode = 1; //0:バリデーションをしない 1:通常のバリデーションモード 2:リアルタイムバリデーションモード

  /**
   * Validationクラス
   * @type {val} 
   */
  val = null;

  /**
   * Valオプション
   * @type {object} 
   */
  valOptions = {};

  /**
   * 要素に設定されている最適化クラス(efoElement)
   * @type {array} 
   */
  vArrEFOElement = [];

  /**
   * 要素に設定されているバリデーションクラス(valElement)
   * @type {array} 
   */
  vArrValElement = [];

  /**
   * 保存データ
   * @type {string} 
   */
  vArrBackupData = [];

  /** 
   * 入力コントールクラス取得
   * @param {HTMLElement} elm
   * @return {TwInputControl}
   */
  static getInstance(elm){
    let ident = TwFunc.getIdent(elm);
    if (typeof TwInputControl.instanceMap[ident] == "undefined") {
      TwInputControl.instanceMap[ident] = new TwInputControl(elm);
      TwInputControl.instanceMap[ident].init();
    }
    return TwInputControl.instanceMap[ident];
  }

  /** 
   * コンストラクタ―
   * @param {HTMLElement} elm
   */
  constructor(elm) {
    this.elm = elm;
    this.vArrBackupData.push($(elm).val());
  }


  /** 
   * 監視用
   * @type {MutationObserver} 
   */
  vArrObserver = {};

  /** 
   * 監視OK
   * @param {string} observerKey 監視キー
   */
  resolveObserver(observerKey) {
    if (this.vArrObserver[observerKey]) {
      this.vArrObserver[observerKey].observer.disconnect();
      this.vArrObserver[observerKey].defer.resolve();
      delete this.vArrObserver[observerKey];
    }
  }

  /** 
   * 監視キャンセル
   * @param {string} observerKey 監視キー
   */
  cancelObserver(observerKey) {
    if (this.vArrObserver[observerKey]) {
      this.vArrObserver[observerKey].observer.disconnect();
      this.vArrObserver[observerKey].defer.reject();
      delete this.vArrObserver[observerKey];
    }
  }

  /** 
   * 初期化（個別）
   * @async
   */
  async init(){
    let self = this;

    //クリック
    $(self.elm).on("click", function() {
      let myElement = this;
      (async function() {
        //フォーカスインイベントを発火
        $(myElement).trigger("TwInputEvent-click");
      })();
    });

    //フォーカスイン
    $(self.elm).on("focus", function() {
      let myElement = this;
      (async function() {

        //監視中があればキャンセル
        if (self.vArrObserver) {
          for (let key in self.vArrObserver) {
            self.cancelObserver(key);
          }
        }

        let old_value = $(myElement).val();

        //フォーカスインした時の値を記憶しておく
        self.addBackup(old_value);

        //最適化処理を行う
        let new_value = old_value;

        for (let i=0; i<self.vArrEFOElement.length; i++) {
          new_value = self.vArrEFOElement[i].optimizeIn(new_value);
        }

        if (old_value != new_value) {
          $(myElement).val(new_value);
        }

        //フォーカスインイベントを発火
        $(myElement).trigger("TwInputEvent-focus");
      })();
    });

    //キーアップ
    $(self.elm).on("keyup", function() {
      let myElement = this;
      (async function() {
        if (TwInputControl.valMode == 2) {

          let value = $(myElement).val();

          //--------------------------------------------------------
          //最適化処理を行う
          //--------------------------------------------------------
          if (TwInputControl.efoMode == 1 && self.efo) {
            //共通最適化
            value = self.efo.convert(value, self.efoOptions["mode"]);

            //個別最適化
            for (let i=0; i<self.vArrEFOElement.length; i++) {
              value = self.vArrEFOElement[i].optimizeOut(value);
            }
          }

          //--------------------------------------------------------
          //バリデーションを行う
          //--------------------------------------------------------
          if (self.val) {

            //共通バリデーション
            let error = "";
            let result = self.commonValidate();
            if (result !== true) {
              error = result;
            }
            if (error == "") {
              for (let i=0; i<self.vArrValElement.length; i++) {
                if (value === "") {
                  continue;
                }

                let result = null;
                if (self.valOptions["callback"] != "") {
                  result = window[self.valOptions["callback"]](value, myElement);
                } else {
                  result = self.vArrValElement[i].validate(value);
                }

                if (result !== true) {
                  error = result;
                  //エラーがあった場合、他のチェックは行わない
                  break;
                }
              }
            }

            if (error == "") {

              self.hideError();

            } else {
              //メッセージの指定がある場合そちらの内容に置き換える
              if (self.valOptions["err"]) {
                error = self.valOptions["err"];
              }

              self.setErrorClass();
              self.showError(error);
            }
          }
        }
      })();
    });

    //フォーカスアウト
    $(self.elm).on("blur", function() {
      let myElement = this;
      (async function() {

        if ($(".ui-datepicker").length && $(".ui-datepicker").css("display") != "none") {//datepicker が表示されている場合
          try {
            await self.observeStyleChange("datepicker", $(".ui-datepicker")[0], "display", "none");//閉じるまで待つ
          } catch (e) {
            //キャンセル時
            return;
          }
        }

        let old_value = $(myElement).val();
        let new_value = old_value;

        //--------------------------------------------------------
        //最適化処理を行う
        //--------------------------------------------------------
        if (TwInputControl.efoMode == 1 && self.efo) {
          //共通最適化
          new_value = self.efo.convert(new_value, self.efoOptions["mode"]);

          //個別最適化
          for (let i=0; i<self.vArrEFOElement.length; i++) {
            new_value = self.vArrEFOElement[i].optimizeOut(new_value);
          }
        }

        //--------------------------------------------------------
        //バリデーションを行う
        //--------------------------------------------------------
        if (1 <= TwInputControl.valMode && self.val) {
          //共通バリデーション
          let error = "";
          let result = self.commonValidate();
          if (result !== true) {
            error = result;
          }
          if (error == "") {
            for (let i=0; i<self.vArrValElement.length; i++) {
              if (new_value === "") {
                continue;
              }

              let result = null;
              if (self.valOptions["callback"] != "") {
                result = window[self.valOptions["callback"]](new_value, myElement);
              } else {
                result = self.vArrValElement[i].validate(new_value);
              }

              if (result !== true) {
                error = result;
                //エラーがあった場合、他のチェックは行わない
                break;
              }
            }
          }

          if (error == "") {

            self.hideError();

          } else {
            //メッセージの指定がある場合そちらの内容に置き換える
            if (self.valOptions["err"]) {
              error = self.valOptions["err"];
            }
            if (self.valOptions["rollback"] == 1) {
              self.rollbackData();
              new_value = self.getLastBackup();
            }
            self.setErrorClass();
            self.showError(error);
          }
        }

        if (old_value != new_value) {
          $(myElement).val(new_value);
        }
        if (self.isLastBackupChange(new_value)) {
          //変更イベントを発火
          $(myElement).trigger("TwInputEvent-change");

          self.vArrBackupData.push(new_value);
        }

        //フォーカスアウトイベントを発火
        $(myElement).trigger("TwInputEvent-blur");
      })();
    });

    //まだ valOptions は参照できないので、直で参照
    if ($(self.elm).attr("val-group") == 1) {
      let type = $(self.elm).attr("val-group-type");
      switch (type) {
        case "radio":
        case "checkbox":
          $(self.elm).find("input[type=" + type + "]").on("change", function() {
            let myElement = this;
            (async function() {
              //--------------------------------------------------------
              //バリデーションを行う
              //--------------------------------------------------------
              if (1 <= TwInputControl.valMode && self.val) {
                //共通バリデーション
                let error = "";
                let result = self.commonValidate();
                if (result !== true) {
                  error = result;
                }
                if (error == "") {
                  for (let i=0; i<self.vArrValElement.length; i++) {
                    let result = null;
                    if (self.valOptions["callback"] != "") {
                      result = window[self.valOptions["callback"]](new_value, myElement);
                    } else {
                      result = self.vArrValElement[i].validateGroup();
                    }
                    if (result !== true) {
                      error = result;
                      //エラーがあった場合、他のチェックは行わない
                      break;
                    }
                  }
                }

                if (error == "") {
                  self.hideError();
                } else {
                  //メッセージの指定がある場合そちらの内容に置き換える
                  if (self.valOptions["err"]) {
                    error = self.valOptions["err"];
                  }
                  self.setErrorClass();
                  self.showError(error);
                }
              }

              //変更イベントを発火
              $(myElement).trigger("TwInputEvent-change");
            })();
          });
          break;
      }
    }

  }

  /** 
   * 一度だけ実行する全体の設定
   * @async
   */
  static async initSetting(){
    //wrapperのスクロール
    $("#wrapper").on("scroll", function() {
      //リアルタイムバリデーションのエラーボックスが表示されている場合、位置を補正
      if (TwInputControl.valMode == 2) {
        for (let ident in TwInputControl.errorMap) {
          let elm = TwInputControl.errorMap[ident];
          let ctl = TwInputControl.getInstance(elm);
          let errorBox = ctl.getErrorBox(false);
          ctl.setPosition(errorBox);
        }
      }
    });
  }

  /** 
   * 特定の要素のスタイルを監視
   * @param {HTMLElement} elm 
   * @param {string} observerKey 監視キー
   * @param {string} targetStyle 監視するスタイル
   * @param {string} detectStyle 検知スタイル
   * @return {boolean|string}
   */
  async observeStyleChange(observerKey, elm, targetStyle, detectStyle) {
    let self = this;
    let defer = $.Deferred();
    let observer = new MutationObserver(function() {
      if ($(elm).css(targetStyle) == detectStyle) {
        self.resolveObserver(observerKey);
      }
    });
    observer.observe(elm, {
      attributes: true,
      attributeFilter: ['style']
    });
    this.vArrObserver[observerKey] = {"defer": defer, "observer": observer};
    return defer;
  }

  /** 
   * 共通バリデーション実行
   * @param {boolean} req true:必須チェックを行う
   * @return {boolean|string}
   */
  commonValidate(req = false){
    let self = this;
    let error = "";
    let req_chk = false;
    if (req) {
      if (self.valOptions["req"] == 1) {//必須チェック
        req_chk = true;
      } else if (self.valOptions["reqc"] && $(self.elm).hasClass(self.valOptions["reqc"])) {//クラスが設定されている場合発動
        req_chk = true;
      }
    }

    if (req_chk) {//必須チェック
      if (self.valOptions["group"] != 1) {//グループ設定されていない場合
        let value = $(self.elm).val();
        if (value === "") {
          if (self.valOptions["err"]) {
            error = self.valOptions["err"];
          } else {
            error = "未入力";
          }
        }
      } else {
        //グループ設定されている場合は、vArrValElementは１つしか入っていない想定
        let result = self.vArrValElement[0].requiredGroup();
        if (result !== true) {
          error = result;
        }
      }
    }

    if (error != "") {
      return error;
    }
    return true;
  }

  /** 
   * EFOクラス登録
   * @param {efo} v
   */
  setEFO(v, options = {}) {
    this.efo = v;
    this.efoOptions = $.extend({}, v.defaultCommonOptions, options || {});
  }

  /** 
   * EFO実装クラス登録
   * @param {efoElement} v
   * @param {object} options
   */
  addEFOElement(v) {
    this.vArrEFOElement.push(v);
  }

  /** 
   * バリデーションクラス登録
   * @param {val} v
   * @param {object} options
   */
  setVal(v, options = {}) {
    this.val = v;
    this.valOptions = $.extend({}, v.defaultCommonOptions, options || {});
  }

  /** 
   * バリデーション実装クラス登録
   * @param {valElement} v
   */
  addValElement(v) {
    this.vArrValElement.push(v);
  }

  /** 
   * バックアップに追加（最後のバックアップから内容が変わった場合のみ）
   * @param {string} value
   */
  addBackup(value) {
    if (!this.vArrBackupData.length || this.vArrBackupData[this.vArrBackupData.length - 1] != value) {
      this.vArrBackupData.push(value);
    }
  }

  /** 
   * 最後にバックアップした内容を返却
   * @return {string}
   */
  getLastBackup() {
    if (this.vArrBackupData.length) {
      return this.vArrBackupData[this.vArrBackupData.length - 1];
    }
    return null;
  }

  /** 
   * 最後にバックアップした内容を異なるかどうか
   * @param {string} value
   * @return {boolean}
   */
  isLastBackupChange(value) {
    if (this.vArrBackupData.length) {
      return this.vArrBackupData[this.vArrBackupData.length - 1] !== value;
    } else if (value !== "") {
      return true;
    }
    return false;
  }


  /** 
   * 入力内容を戻す
   */
  rollbackData() {
    let self = this;
    $(self.elm).val(self.getLastBackup());
  }


  /** 
   * エラーボックスを取得
   * @param {boolean} create
   */
  getErrorBox(create = true) {
    //if (TwInputControl.valMode == 2) {
      let self = this;
      //let ident = TwFunc.getIdent(self.elm);
      let ident = TwFunc.getIdent(self.getErrorTarget());
      let $errorBox = null;
      let id = ident + "-error";
      if (!$("#" + id).length) {
        if (create) {
          //$errorBox = $('<div id="' + id + '" class="TwFuncErrorBox" func="observe" observe-cond="resize" observe-action="TwInputControl.getInstance(this).hoge()"><div class="TwFuncErrorBoxContainer"><p class="error"></p></div></div>');
          $errorBox = $('<div id="' + id + '" class="TwFuncErrorBox"><div class="TwFuncErrorBoxContainer"><p class="error"></p></div></div>');
          $errorBox.hide();
          $("body").append($errorBox);
        } else {
          return null;
        }
      } else {
        $errorBox = $("#" + id);
      }
      return $errorBox[0];
    //} else {
    //  return null;
    //}
  }


  /** 
   * エラーボックスを表示
   * @param {string} error
   * @param {boolean} view 画面
   */
  showError(error) {
    let self = this;
    //エスケープ
    error = error.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (TwInputControl.valMode == 2) {
      let $errorBox = $(self.getErrorBox());
      $errorBox.find(".error").html(error);

      //位置を設定
      self.setPosition($errorBox[0]);

      $errorBox.show();

    } else {
      xalert(error, "エラー");
    }

    //エラーマップに登録
    //let ident = TwFunc.getIdent(self.elm);
    //TwInputControl.errorMap[ident] = self.elm;
    let ident = TwFunc.getIdent(self.getErrorTarget());
    TwInputControl.errorMap[ident] = self.getErrorTarget();
  }

  /** 
   * エラー対象取得
   */
  getErrorTarget() {
    let error_target = this.elm;
    if (this.valOptions["errt"]) {
      let errt = this.valOptions["errt"];
      if (errt.match(/^#/)) {// id指定
        if ($(errt).length) {
          error_target = $(errt)[0];
        }
      } else if (errt.match(/\./)) {// class指定
        if ($(errt).length) {
          error_target = $(errt)[0];
        }
      } else {// name指定
        if ($("[name=" + errt + "]").length) {
          error_target = $("[name=" + errt + "]")[0];
        }
      }
    }
    return error_target;
  }

  /** 
   * エラークラスセット
   */
  setErrorClass() {
    //$(this.elm).addClass("showRequire");
    $(this.getErrorTarget()).addClass("showRequire");
  }

  /** 
   * エラーボックスを非表示
   */
  hideError() {
    let self = this;

    //エラーclassを削除
    //$(self.elm).removeClass("showRequire");
    $(self.getErrorTarget()).removeClass("showRequire");

    //if (TwInputControl.valMode == 2) {
      let errorBox = self.getErrorBox(false);
      if (errorBox) {
        $(errorBox).hide();
      }
    //}

    //エラーマップに登録
    //let ident = TwFunc.getIdent(self.elm);
    let ident = TwFunc.getIdent(self.getErrorTarget());
    if (TwInputControl.errorMap[ident]) {
      delete TwInputControl.errorMap[ident];
    }
  }

  /** 
   * エラーの位置を設定
   * @param {HTMLElement} errorBox
   */
  setPosition(errorBox) {
    let self = this;
    //let $elm = $(self.elm);
    let $elm = $(self.getErrorTarget());
    let $errorBox = $(errorBox);

/*
    //表示位置を計算
    let elm_top = $elm.offset().top;
    let elm_left = $elm.offset().left;
    let set_top = elm_top + $elm.outerHeight(false) + 1;
    let set_left = elm_left;

    let wh = $(window).height();
    let ww = $(window).width();

    //要素の下に表示した時にwindowの高さを超えてしまう場合、要素の上に表示する
    if (wh < set_top + $errorBox.outerHeight(false)) {
      set_top = elm_top - $errorBox.outerHeight(false) - 1;
    }

    //要素の左端に合わせて表示した時にwindowの幅を超えてしまう場合、要素の右に合わせる
    if (ww < set_left + $errorBox.outerWidth(false)) {
      let elm_right = elm_left + $elm.outerWidth(false) + 1;
      let set_right = ww - elm_right;

      $errorBox.css({
         top: set_top
        ,left: "unset"
        ,right: set_right
      });

    } else {
      $errorBox.css({
         top: set_top
        ,left: set_left
        ,right: "unset"
      });
    }
*/
    //表示位置を計算
    let elm_top = $elm.offset().top;
    let elm_left = $elm.offset().left;
    let set_top = elm_top - $errorBox.outerHeight(false) -1;
    let set_left = elm_left;

    let wh = $(window).height();
    let ww = $(window).width();

    //要素の上に表示できない場合要素の下に表示する
    if (set_top < 0) {
      set_top = elm_top + $elm.outerHeight(false) + 1;
      $errorBox.removeClass("posTop").addClass("posBottom");
    } else {
      $errorBox.removeClass("posBottom").addClass("posTop");
    }

    //要素の左端に合わせて表示した時にwindowの幅を超えてしまう場合、要素の右に合わせる
    if (ww < set_left + $errorBox.outerWidth(false)) {
      let elm_right = elm_left + $elm.outerWidth(false) + 1;
      let set_right = ww - elm_right;

      $errorBox.css({
         top: set_top
        ,left: "unset"
        ,right: set_right
      });

    } else {
      $errorBox.css({
         top: set_top
        ,left: set_left
        ,right: "unset"
      });
    }

  }

/////////////////////////////////////////////////// 共通関数（static）

  /** 
   * 最適化
   * @param {boolean} post true:POST送信用
   * @param {HTMLElement} elm 未指定の場合、設定されているすべての最適化を実行
   * @return {boolean}
   */
  static optimize(post = false, elm = null) {

    let _optimize = function(ctl) {
      //共通最適化
      let old_value = $(ctl.elm).val();
      let new_value = old_value;

      if (ctl.efo) {
        new_value = ctl.efo.convert(new_value, ctl.efoOptions["mode"]);

        //個別最適化
        for (let i=0; i<ctl.vArrEFOElement.length; i++) {
          new_value = ctl.vArrEFOElement[i].optimize(new_value, post);
        }
      }

      if (old_value != new_value) {
        $(ctl.elm).val(new_value);
        if (!post) {//POST送信用でない場合は、バックアップデータにセット（ロールバックできるようにする）
          ctl.addBackup(new_value);
        }
      }
    }

    if (elm != null) {//単体指定
      let ctl = TwInputControl.getInstance(elm);
      _optimize(ctl);

    } else {//全体
      for (let i in TwInputControl.instanceMap) {
        let ctl = TwInputControl.instanceMap[i];
        _optimize(ctl, post);
      }
    }
  }


  /** 
   * バリデート
   * @param {HTMLElement} elm 未指定の場合、設定されているすべてのバリデートを実行
   * @param {HTMLElement} form 対象のフォーム。elm が指定されている場合は使用しない
   * @return {boolean}
   */
  static validate(elm = null, form = null) {

    let _validate = function(ctl, disp_flg) {
      let error = "";

      //共通バリデーション
      let result = ctl.commonValidate(true);
      if (result !== true) {
        error = result;
      } else {
        for (let i=0; i<ctl.vArrValElement.length; i++) {
          if ($(ctl.elm).val() === "") {
            continue;
          }

          let result = null;
          let value = $(ctl.elm).val();
          if (ctl.valOptions["callback"] != "") {
            result = window[ctl.valOptions["callback"]](value, ctl.elm);
          } else {
            result = ctl.vArrValElement[i].validate(value);
          }

          if (result !== true) {
            error = result;

            //メッセージの指定がある場合そちらの内容に置き換える
            if (ctl.valOptions["err"]) {
              error = ctl.valOptions["err"];
            }

            //エラーがあった場合、他のチェックは行わない
            break;
          }
        }
      }
      if (error == "") {
        return true;
      } else {

        //要素の表示名を設定
        if (TwInputControl.valMode != 2) {
          if (disp_flg && ctl.valOptions["disp"] != "") {
            if (ctl.valOptions["disp"].match(/^#/) && $(ctl.valOptions["disp"]).length) {
              error = $(ctl.valOptions["disp"]).text() + " " + error;
            } else {
              error = ctl.valOptions["disp"] + " " + error;
            }
          }
        }
        return error;
      }
    }

    let errors = [];
    if (elm != null) {//単体指定
      let ctl = TwInputControl.getInstance(elm);
      let result = _validate(ctl, false);
      let error = (result !== true ? result : "");
      if (error == "") {
        ctl.hideError();
      } else {
        ctl.setErrorClass();
        if (TwInputControl.valMode == 2) {
          ctl.showError();
        }
        errors.push(error);
      }
    } else {//全体
      for (let i in TwInputControl.instanceMap) {
        let ctl = TwInputControl.instanceMap[i];
        if (form && !TwInputControl.isElementInForm($(ctl.elm)[0], $(form)[0])) {
          continue;
        }
        let result = _validate(ctl, true);
        let error = (result !== true ? result : "");
        if (error == "") {
          ctl.hideError(error);
        } else {
          ctl.setErrorClass();
          if (TwInputControl.valMode == 2) {
            ctl.showError(error);
          }
          errors.push(error);
        }
      }
    }

    if (errors.length) {
      let error_msg = errors.length + "件の不正な入力があります\n\n";
      return error_msg + errors.join("\n");
    }

  	return true;
  }

  /** 
   * 指定した要素が、指定したformの中にあるかどうか
   * @param {HTMLElement} element 要素
   * @param {HTMLFormElement} form 要素
   * @return {boolean}
   */
  static isElementInForm(element, form) {
    if (!(element instanceof HTMLElement) || !(form instanceof HTMLFormElement)) {
      return false;
    }
    let current = element;
    while (current) {
      if (current === form) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
}

  /** 
   * 検証をクリアする
   * @param {HTMLElement} elm 未指定の場合、設定されているすべての検証をクリア
   * @return {boolean}
   */
  static validateClear(elm = null) {
    if (elm != null) {//単体指定
      let ctl = TwInputControl.getInstance(elm);
      ctl.hideError();
    } else {//全体
      for (let i in TwInputControl.instanceMap) {
        let ctl = TwInputControl.instanceMap[i];
        ctl.hideError();
      }
    }

  	return true;

  }

  /** 
   * 入力内容を戻す
   * @param {HTMLElement} elm 未指定の場合、設定されているすべての入力内容を戻す
   */
  static rollback(elm = null) {
    let self = this;
    if (elm != null) {//単体指定
      TwInputControl.getInstance(elm).rollbackData();
    } else {//全体
      for (let i in TwInputControl.instanceMap) {
        TwInputControl.instanceMap[i].rollbackData();
      }
    }
  }

  /** 
   * 指定した要素にスクロール
   * @async
   * @param {HTMLElement} elm
   * @param {number} margin_top
   */
  static async scrollIntoView(elm, margin_top = 50) {
    if ($(elm).length) {
      let defer = $.Deferred();
      $(elm).css("scroll-margin-top", margin_top + 'px');
      const intersectionObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(function() {
              $(elm).css("scroll-margin-top", '');
              observer.disconnect();
              defer.resolve();
            }, 100);
          }
        });
      });
      intersectionObserver.observe(elm);
      elm.scrollIntoView({behavior: "smooth"});
      return defer;
    }
  }

  /**
   * 指定したフォームから、FormDataを作成する
   * @param {FormData} form 
   * @returns FormData
   */
  static createFormData(form) {
    const $form = $(form);
    const formData = new FormData();

    $form.find('input, select, textarea').each(function () {

      let ctl = null;
      if (typeof this.__twfunc_ident != "undefined") {
        ctl = TwInputControl.getInstance(this);
      }
      //最適化処理を行う
      const _optimize = function(value) {
        if (ctl === null) {
          return value;
        }
        if (TwInputControl.efoMode == 1 && ctl.efo) {
          //共通最適化
          value = ctl.efo.convert(value, ctl.efoOptions["mode"]);
          //個別最適化
          for (let i=0; i<ctl.vArrEFOElement.length; i++) {
            value = ctl.vArrEFOElement[i].optimize(value, true);
          }
        }
        return value;
      }

      const $el = $(this);
      const tag = $el.prop('tagName');
      const type = ($el.attr('type') || '').toLowerCase();
      const name = $el.attr('name');

      //disabled、name未設定は除く
      if (!$el.prop('disabled') && name) {
        if ((type === 'checkbox' || type === 'radio')) {
          if ($el.prop('checked')) {//チェックボックス、ラジオはチェック対象のみ
            formData.append(name, _optimize($el.val()));
          }
        } else if (type === 'file') {
          const files = $el.prop('files');
          for (let i = 0; i < files.length; i++) {
            formData.append(name, files[i]);
          }
        } else if (tag === 'SELECT' && $el.prop('multiple')) {
          $el.find('option:selected').each(function () {
            formData.append(name, _optimize($(this).val()));
          });
        } else {
          formData.append(name, _optimize($el.val()));
        }
      }
    });

    return formData;
  }
}
