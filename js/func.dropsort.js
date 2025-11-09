import TwFunc from './func.js';

//==============================================================================
//
// dropsort extends TwFunc
//
//==============================================================================
/*

リスト項目をドラッグ&ドロップで並び替える機能

【指定方法】
<ul func="dropsort" dropsort-[オプション]="xxxx">
  <li>項目1</li>
  <li>項目2</li>
  <li>項目3</li>
</ul>

【オプション】

■handle
ドラッグハンドルのセレクタ
指定した要素をドラッグした時のみ並び替えが可能になる
デフォルト: "" (項目全体がドラッグ可能)

■callback
並び替え後のコールバック関数名
引数として element (並び替えられた要素), oldIndex (元の位置), newIndex (新しい位置) が渡される
デフォルト: ""

■dragclass
ドラッグ中に追加するクラス名
デフォルト: "dragging"

■dragoverclass
ドラッグオーバー時に追加するクラス名
デフォルト: "dragover"

■item
並び替え対象の子要素セレクタ
デフォルト: "> *" (直接の子要素すべて)

■axis
移動軸の制限（"x", "y", "" のいずれか）
デフォルト: "" (制限なし)

【使用例】

■基本的な使い方
<ul func="dropsort" dropsort-callback="handleSort">
  <li>項目1</li>
  <li>項目2</li>
  <li>項目3</li>
</ul>

<script>
function handleSort(element, oldIndex, newIndex) {
  console.log(`${oldIndex} から ${newIndex} に移動しました`);
}
</script>

■ハンドル指定
<ul func="dropsort" dropsort-handle=".handle">
  <li><span class="handle">≡</span> 項目1</li>
  <li><span class="handle">≡</span> 項目2</li>
  <li><span class="handle">≡</span> 項目3</li>
</ul>

*/

//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//
// dropsortクラス
//
////////////////////////////////////////////////////////////////////////////////
export default class dropsort extends TwFunc {

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
    handle: "",
    callback: "",
    dragclass: "dragging",
    dragoverclass: "dragover",
    item: "> *",
    axis: ""
  };

  /**
   * ドラッグ中の要素
   * @type {HTMLElement}
   */
  draggedElement = null;

  /**
   * 元の位置
   * @type {number}
   */
  oldIndex = -1;

  /**
   * コンストラクタ―
   * @param {object} opt
   */
  constructor(opt = {}) {
    super("dropsort", opt);//必ず実行が必要
    this.draggedElement = null;
    this.oldIndex = -1;
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
      let container = targetElements[i];
      let options = self.getOptions(container);
      options = $.extend(true, {}, dropsort.defaultOptions, options || {});

      if (typeof container.tagName == "undefined") {
        continue;
      }

      // 各アイテムにドラッグ可能属性を追加
      self.setupItems(container, options);
    }
  }

  /**
   * アイテムの設定
   * @param {HTMLElement} container
   * @param {object} options
   */
  setupItems(container, options) {
    let self = this;
    let items = $(container).find(options["item"]);

    items.each(function(index, item) {
      // 既に設定済みの場合はスキップ
      if ($(item).attr("data-dropsort-initialized") === "true") {
        return;
      }

      $(item).attr("draggable", "true");
      $(item).attr("data-dropsort-initialized", "true");

      // ハンドルが指定されている場合
      if (options["handle"]) {
        $(item).attr("draggable", "false");

        $(item).find(options["handle"]).each(function() {
          $(this).attr("draggable", "true");
          $(this).css("cursor", "move");

          // ハンドルのドラッグ開始
          $(this).on("dragstart", function(e) {
            e.stopPropagation();
            self.handleDragStart.call(item, e, options, self);
          });
        });
      } else {
        $(item).css("cursor", "move");

        // アイテム全体のドラッグ開始
        $(item).on("dragstart", function(e) {
          self.handleDragStart.call(this, e, options, self);
        });
      }

      // ドラッグ終了
      $(item).on("dragend", function(e) {
        self.handleDragEnd.call(this, e, options, self);
      });

      // ドラッグオーバー
      $(item).on("dragover", function(e) {
        self.handleDragOver.call(this, e, options, self);
      });

      // ドラッグエンター
      $(item).on("dragenter", function(e) {
        self.handleDragEnter.call(this, e, options, self);
      });

      // ドラッグリーブ
      $(item).on("dragleave", function(e) {
        self.handleDragLeave.call(this, e, options, self);
      });

      // ドロップ
      $(item).on("drop", function(e) {
        self.handleDrop.call(this, e, options, self);
      });
    });
  }

  /**
   * ドラッグ開始ハンドラ
   * @param {Event} e
   * @param {object} options
   * @param {dropsort} self
   */
  handleDragStart(e, options, self) {
    let item = this;
    self.draggedElement = item;
    self.oldIndex = $(item).parent().children(options["item"]).index(item);

    $(item).addClass(options["dragclass"]);

    // データ転送を設定
    e.originalEvent.dataTransfer.effectAllowed = "move";
    e.originalEvent.dataTransfer.setData("text/html", item.innerHTML);
  }

  /**
   * ドラッグ終了ハンドラ
   * @param {Event} e
   * @param {object} options
   * @param {dropsort} self
   */
  handleDragEnd(e, options, self) {
    let item = this;
    $(item).removeClass(options["dragclass"]);

    // すべてのドラッグオーバークラスを削除
    $(item).parent().children(options["item"]).removeClass(options["dragoverclass"]);

    // 新しい位置を取得
    let newIndex = $(item).parent().children(options["item"]).index(item);

    // コールバック実行
    if (self.oldIndex !== newIndex && options["callback"] && typeof window[options["callback"]] === "function") {
      window[options["callback"]](item, self.oldIndex, newIndex);
    }

    self.draggedElement = null;
    self.oldIndex = -1;
  }

  /**
   * ドラッグオーバーハンドラ
   * @param {Event} e
   * @param {object} options
   * @param {dropsort} self
   */
  handleDragOver(e, options, self) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.originalEvent.dataTransfer.dropEffect = "move";
    return false;
  }

  /**
   * ドラッグエンターハンドラ
   * @param {Event} e
   * @param {object} options
   * @param {dropsort} self
   */
  handleDragEnter(e, options, self) {
    let item = this;
    if (self.draggedElement !== item) {
      $(item).addClass(options["dragoverclass"]);
    }
  }

  /**
   * ドラッグリーブハンドラ
   * @param {Event} e
   * @param {object} options
   * @param {dropsort} self
   */
  handleDragLeave(e, options, self) {
    let item = this;
    $(item).removeClass(options["dragoverclass"]);
  }

  /**
   * ドロップハンドラ
   * @param {Event} e
   * @param {object} options
   * @param {dropsort} self
   */
  handleDrop(e, options, self) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    let item = this;

    if (self.draggedElement !== item) {
      // ドロップ位置に応じて挿入
      let draggedIndex = $(self.draggedElement).parent().children(options["item"]).index(self.draggedElement);
      let dropIndex = $(item).parent().children(options["item"]).index(item);

      if (draggedIndex < dropIndex) {
        $(item).after(self.draggedElement);
      } else {
        $(item).before(self.draggedElement);
      }
    }

    $(item).removeClass(options["dragoverclass"]);

    return false;
  }
}
