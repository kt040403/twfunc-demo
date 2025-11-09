import TwFunc from './func.js';

//==============================================================================
//
// dropmove extends TwFunc
//
//==============================================================================
/*

リスト間でアイテムをドラッグ&ドロップで移動する機能

【指定方法】
<ul func="dropmove" dropmove-[オプション]="xxxx">
  <li>項目1</li>
  <li>項目2</li>
</ul>

【オプション】

■group
同じグループ内でのみ移動可能にする
同じgroup値を持つコンテナ間で移動できる
デフォルト: "default"

■callback
移動後のコールバック関数名
引数として element (移動した要素), fromContainer (移動元), toContainer (移動先), fromIndex, toIndex が渡される
デフォルト: ""

■handle
ドラッグハンドルのセレクタ
指定した要素をドラッグした時のみ移動が可能になる
デフォルト: "" (項目全体がドラッグ可能)

■dragclass
ドラッグ中に追加するクラス名
デフォルト: "dragging"

■dragoverclass
ドラッグオーバー時に追加するクラス名
デフォルト: "dragover"

■item
移動対象の子要素セレクタ
デフォルト: "> *" (直接の子要素すべて)

■allowcopy
Ctrlキー（Mac: Cmdキー）を押しながらドラッグでコピーを許可
デフォルト: false

【使用例】

■基本的な使い方
<div class="container">
  <div class="list-box">
    <h3>候補</h3>
    <ul func="dropmove" dropmove-group="items" dropmove-callback="handleMove">
      <li>項目1</li>
      <li>項目2</li>
    </ul>
  </div>
  <div class="list-box">
    <h3>登録済み</h3>
    <ul func="dropmove" dropmove-group="items" dropmove-callback="handleMove">
      <li>項目3</li>
    </ul>
  </div>
</div>

<script>
function handleMove(element, fromContainer, toContainer, fromIndex, toIndex) {
  console.log(`${fromIndex} から ${toIndex} に移動しました`);
}
</script>

*/

//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//
// dropmoveクラス
//
////////////////////////////////////////////////////////////////////////////////
export default class dropmove extends TwFunc {

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
    group: "default",
    callback: "",
    handle: "",
    dragclass: "dragging",
    dragoverclass: "dragover",
    item: "*",  // 子要素すべて（"> *" ではなく "*" にする）
    allowcopy: false
  };

  /**
   * グループごとのコンテナマップ
   * @type {object}
   */
  static groupContainers = {};

  /**
   * ドラッグ中の要素
   * @type {HTMLElement}
   */
  draggedElement = null;

  /**
   * ドラッグ元のコンテナ
   * @type {HTMLElement}
   */
  sourceContainer = null;

  /**
   * 元の位置
   * @type {number}
   */
  sourceIndex = -1;

  /**
   * コピーモードかどうか
   * @type {boolean}
   */
  isCopyMode = false;

  /**
   * コンストラクタ―
   * @param {object} opt
   */
  constructor(opt = {}) {
    super("dropmove", opt);
    this.draggedElement = null;
    this.sourceContainer = null;
    this.sourceIndex = -1;
    this.isCopyMode = false;
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
      options = $.extend(true, {}, dropmove.defaultOptions, options || {});

      if (typeof container.tagName == "undefined") {
        continue;
      }

      // グループに登録
      let group = options["group"];
      if (!dropmove.groupContainers[group]) {
        dropmove.groupContainers[group] = [];
      }
      if (!dropmove.groupContainers[group].includes(container)) {
        dropmove.groupContainers[group].push(container);
      }

      // コンテナにドロップイベントを設定
      self.setupContainer(container, options);

      // 各アイテムにドラッグ可能属性を追加
      self.setupItems(container, options);
    }
  }

  /**
   * コンテナの設定
   * @param {HTMLElement} container
   * @param {object} options
   */
  setupContainer(container, options) {
    let self = this;

    // ドラッグオーバー
    $(container).on("dragover.dropmove", function(e) {
      e.preventDefault();
      e.originalEvent.dataTransfer.dropEffect = self.isCopyMode ? "copy" : "move";
      $(this).addClass(options["dragoverclass"]);
      return false;
    });

    // ドラッグリーブ
    $(container).on("dragleave.dropmove", function(e) {
      // 子要素へのleaveは無視
      if (!$(this).is(e.target) && $.contains(this, e.target)) {
        return;
      }
      $(this).removeClass(options["dragoverclass"]);
    });

    // ドロップ
    $(container).on("drop.dropmove", function(e) {
      e.preventDefault();
      e.stopPropagation();

      $(this).removeClass(options["dragoverclass"]);

      if (self.draggedElement && self.sourceContainer) {
        let targetContainer = this;

        // 同じグループ内かチェック
        let sourceGroup = self.getOptions(self.sourceContainer)["group"] || "default";
        let targetGroup = options["group"];

        if (sourceGroup !== targetGroup) {
          return false;
        }

        // 移動先のインデックスを取得
        let targetIndex = $(targetContainer).children(options["item"]).length;

        // コピーモードの場合
        if (self.isCopyMode && options["allowcopy"]) {
          let clone = $(self.draggedElement).clone();
          clone.removeAttr("data-dropmove-initialized");
          $(targetContainer).append(clone);

          // 新しい要素にもイベントを設定
          self.setupItems(targetContainer, options);
        } else {
          // 移動モード
          $(targetContainer).append(self.draggedElement);
        }

        // コールバック実行
        if (options["callback"] && typeof window[options["callback"]] === "function") {
          window[options["callback"]](
            self.draggedElement,
            self.sourceContainer,
            targetContainer,
            self.sourceIndex,
            targetIndex
          );
        }
      }

      return false;
    });
  }

  /**
   * アイテムの設定
   * @param {HTMLElement} container
   * @param {object} options
   */
  setupItems(container, options) {
    let self = this;
    let items = $(container).children(options["item"]);

    items.each(function(index, item) {
      // 既に設定済みの場合はスキップ
      if ($(item).attr("data-dropmove-initialized") === "true") {
        return;
      }

      $(item).attr("draggable", "true");
      $(item).attr("data-dropmove-initialized", "true");

      // ハンドルが指定されている場合
      if (options["handle"]) {
        $(item).attr("draggable", "false");

        $(item).find(options["handle"]).each(function() {
          $(this).attr("draggable", "true");
          $(this).css("cursor", "move");

          // ハンドルのドラッグ開始
          $(this).on("dragstart.dropmove", function(e) {
            e.stopPropagation();
            self.handleDragStart.call(item, e, options, self, container);
          });
        });
      } else {
        $(item).css("cursor", "move");

        // アイテム全体のドラッグ開始
        $(item).on("dragstart.dropmove", function(e) {
          self.handleDragStart.call(this, e, options, self, container);
        });
      }

      // ドラッグ終了
      $(item).on("dragend.dropmove", function(e) {
        self.handleDragEnd.call(this, e, options, self);
      });

      // アイテム上のドラッグオーバー（並び替え用）
      $(item).on("dragover.dropmove", function(e) {
        if (e.preventDefault) {
          e.preventDefault();
        }

        if (self.draggedElement !== this && self.draggedElement) {
          let targetContainer = $(this).parent()[0];
          let draggedIndex = $(targetContainer).children(options["item"]).index(self.draggedElement);
          let dropIndex = $(targetContainer).children(options["item"]).index(this);

          if (draggedIndex !== -1) {
            // 同じコンテナ内での並び替え
            if (draggedIndex < dropIndex) {
              $(this).after(self.draggedElement);
            } else {
              $(this).before(self.draggedElement);
            }
          }
        }

        return false;
      });
    });
  }

  /**
   * ドラッグ開始ハンドラ
   * @param {Event} e
   * @param {object} options
   * @param {dropmove} self
   * @param {HTMLElement} container
   */
  handleDragStart(e, options, self, container) {
    let item = this;

    self.draggedElement = item;
    self.sourceContainer = container;
    self.sourceIndex = $(container).children(options["item"]).index(item);

    // コピーモードチェック（Ctrl/Cmdキー）
    self.isCopyMode = (e.originalEvent.ctrlKey || e.originalEvent.metaKey) && options["allowcopy"];

    $(item).addClass(options["dragclass"]);

    // データ転送を設定
    e.originalEvent.dataTransfer.effectAllowed = self.isCopyMode ? "copy" : "move";
    e.originalEvent.dataTransfer.setData("text/html", item.innerHTML);
  }

  /**
   * ドラッグ終了ハンドラ
   * @param {Event} e
   * @param {object} options
   * @param {dropmove} self
   */
  handleDragEnd(e, options, self) {
    let item = this;
    $(item).removeClass(options["dragclass"]);

    // すべてのドラッグオーバークラスを削除
    $("[func*='dropmove']").removeClass(options["dragoverclass"]);

    self.draggedElement = null;
    self.sourceContainer = null;
    self.sourceIndex = -1;
    self.isCopyMode = false;
  }
}
