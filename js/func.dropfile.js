import TwFunc from './func.js';

//==============================================================================
//
// dropfile extends TwFunc
//
//==============================================================================
/*

ファイルをドラッグ&ドロップでアップロードする機能

【指定方法】
<div func="dropfile" dropfile-[オプション]="xxxx">
  ここにファイルをドロップ
</div>

【オプション】

■multiple
複数ファイルを許可するか（true / false）
デフォルト: true

■accept
受け入れるファイルタイプ（例: "image/*", ".pdf,.doc"）
デフォルト: "" (すべてのファイル)

■maxsize
最大ファイルサイズ（MB単位）
デフォルト: 0 (制限なし)

■callback
ファイル選択後のコールバック関数名
引数として files (FileList) が渡される
必須

■dragoverclass
ドラッグオーバー時に追加するクラス名
デフォルト: "dragover"

■message
ドロップエリアに表示するメッセージ
デフォルト: "" (メッセージを表示しない)

【使用例】
<div func="dropfile" dropfile-callback="handleFiles" dropfile-accept="image/*" dropfile-maxsize="5" dropfile-message="画像ファイルをドロップしてください">
</div>

<script>
function handleFiles(files) {
  console.log(files);
  // ファイル処理
}
</script>

*/

//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//
// dropfileクラス
//
////////////////////////////////////////////////////////////////////////////////
export default class dropfile extends TwFunc {

  /**
   * 独自CSSを持っているかどうか
   * @type {boolean}
   */
  originalCss = false;

  /**
   * デフォルトオプション
   * @static
   * @type {object}
   */
  static defaultOptions = {
    multiple: true,
    accept: "",
    maxsize: 0,
    callback: "",
    dragoverclass: "dragover",
    message: ""
  };

  /**
   * コンストラクタ―
   * @param {object} opt
   */
  constructor(opt = {}) {
    super("dropfile", opt);//必ず実行が必要
  }

  /**
   * 初期化
   * @async
   * ※動的追加要素に対しても発行される（target指定）ことを考慮する
   * @param {HTMLElement} target
   */
  async init(target = document){
    let self = this;

    let targetElements = self.getTargetElements(target);
    for (let i=0; i<targetElements.length; i++) {
      let elm = targetElements[i];
      let options = self.getOptions(elm);
      options = $.extend(true, {}, dropfile.defaultOptions, options || {});

      if (typeof elm.tagName == "undefined") {
        continue;
      }

      // メッセージを表示する場合
      if (options["message"] && $(elm).children(".dropfile-message").length === 0) {
        $(elm).append(`<div class="dropfile-message">${options["message"]}</div>`);
      }

      // ドラッグオーバー時のイベント
      $(elm).on("dragover", function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass(options["dragoverclass"]);
      });

      // ドラッグリーブ時のイベント
      $(elm).on("dragleave", function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass(options["dragoverclass"]);
      });

      // ドロップ時のイベント
      $(elm).on("drop", function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass(options["dragoverclass"]);

        let files = e.originalEvent.dataTransfer.files;

        // ファイル検証
        let validFiles = self.validateFiles(files, options);

        if (validFiles.length > 0) {
          // コールバック実行
          if (options["callback"] && typeof window[options["callback"]] === "function") {
            window[options["callback"]](validFiles, elm);
          }
        }
      });

      // クリックでファイル選択ダイアログを表示（オプション）
      $(elm).on("click", function(e) {
        if ($(e.target).hasClass("dropfile-message") || e.target === elm) {
          let input = document.createElement("input");
          input.type = "file";
          input.multiple = options["multiple"];
          if (options["accept"]) {
            input.accept = options["accept"];
          }

          input.onchange = function(e) {
            let files = e.target.files;
            let validFiles = self.validateFiles(files, options);

            if (validFiles.length > 0 && options["callback"] && typeof window[options["callback"]] === "function") {
              window[options["callback"]](validFiles, elm);
            }
          };

          input.click();
        }
      });
    }
  }

  /**
   * ファイル検証
   * @param {FileList} files
   * @param {object} options
   * @returns {Array} 有効なファイルの配列
   */
  validateFiles(files, options) {
    let validFiles = [];
    let maxSize = options["maxsize"] * 1024 * 1024; // MBをバイトに変換

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let isValid = true;
      let errorMsg = "";

      // 複数ファイルチェック
      if (!options["multiple"] && files.length > 1) {
        errorMsg = "複数ファイルは選択できません";
        isValid = false;
        break;
      }

      // ファイルサイズチェック
      if (maxSize > 0 && file.size > maxSize) {
        errorMsg = `ファイルサイズが大きすぎます: ${file.name} (最大: ${options["maxsize"]}MB)`;
        isValid = false;
      }

      // ファイルタイプチェック
      if (options["accept"] && isValid) {
        let acceptTypes = options["accept"].split(",").map(t => t.trim());
        let fileType = file.type;
        let fileName = file.name;
        let isAccepted = false;

        for (let j = 0; j < acceptTypes.length; j++) {
          let acceptType = acceptTypes[j];

          // MIMEタイプでのチェック（例: image/*）
          if (acceptType.includes("*")) {
            let typePrefix = acceptType.split("/")[0];
            if (fileType.startsWith(typePrefix)) {
              isAccepted = true;
              break;
            }
          }
          // 拡張子でのチェック（例: .pdf）
          else if (acceptType.startsWith(".")) {
            if (fileName.toLowerCase().endsWith(acceptType.toLowerCase())) {
              isAccepted = true;
              break;
            }
          }
          // 完全一致でのチェック（例: image/png）
          else if (fileType === acceptType) {
            isAccepted = true;
            break;
          }
        }

        if (!isAccepted) {
          errorMsg = `ファイルタイプが許可されていません: ${file.name}`;
          isValid = false;
        }
      }

      if (isValid) {
        validFiles.push(file);
      } else if (errorMsg) {
        if (typeof xalert === "function") {
          xalert(errorMsg, "エラー");
        } else {
          alert(errorMsg);
        }
      }
    }

    return validFiles;
  }
}
