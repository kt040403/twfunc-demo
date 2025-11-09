# TwFunc ドラッグ&ドロップデモ

TwFuncライブラリのドラッグ&ドロップ機能のデモページです。

## 🎯 デモページ

👉 **[デモを見る](https://yourusername.github.io/twfunc-demo/)**

## ✨ 機能

このデモでは、以下の2つのドラッグ&ドロップ機能を紹介しています：

### 1. ファイルアップロード（dropfile）

- **ドラッグ&ドロップでファイルアップロード**
- **ファイルタイプの制限** - 画像、PDF、Wordなど
- **ファイルサイズの制限** - MB単位で指定可能
- **複数/単一ファイルの切り替え**
- **クリックでのファイル選択も対応**

### 2. リスト並び替え（dropsort）

- **ドラッグ&ドロップでリスト項目を並び替え**
- **ハンドル指定** - 特定の要素をドラッグしたときのみ並び替え
- **テキスト選択可能** - ハンドル指定時
- **スムーズなアニメーション**

## 🚀 使い方

### 基本的な実装例

#### ファイルアップロード

```html
<div func="dropfile"
     dropfile-callback="handleFiles"
     dropfile-accept="image/*"
     dropfile-maxsize="5"
     dropfile-message="画像をドロップ（最大5MB）">
</div>

<script>
function handleFiles(files, element) {
  console.log(files); // FileList オブジェクト
  // ファイル処理
}
</script>
```

#### リスト並び替え

```html
<ul func="dropsort" dropsort-callback="handleSort">
  <li>項目1</li>
  <li>項目2</li>
  <li>項目3</li>
</ul>

<script>
function handleSort(element, oldIndex, newIndex) {
  console.log(`${oldIndex} から ${newIndex} に移動`);
}
</script>
```

## 📦 ファイル構成

```
twfunc-demo/
├── index.html          # デモページ
├── css/
│   ├── func.dropfile.css   # ファイルアップロード用CSS
│   └── func.dropsort.css   # リスト並び替え用CSS
├── js/
│   ├── func.js             # TwFunc基底クラス
│   ├── func.dropfile.js    # ファイルアップロード機能
│   └── func.dropsort.js    # リスト並び替え機能
└── README.md
```

## 🛠️ セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/twfunc-demo.git
cd twfunc-demo
```

### 2. ローカルで実行

HTMLファイルをブラウザで開くだけで動作します：

```bash
open index.html
```

または、ローカルサーバーを起動：

```bash
# Pythonの場合
python -m http.server 8000

# Node.jsの場合
npx http-server
```

ブラウザで `http://localhost:8000` を開く

### 3. 自分のプロジェクトに組み込む

必要なファイルをコピー：

```bash
# CSSファイル
cp css/func.dropfile.css your-project/css/
cp css/func.dropsort.css your-project/css/

# JavaScriptファイル
cp js/func.js your-project/js/
cp js/func.dropfile.js your-project/js/
cp js/func.dropsort.js your-project/js/
```

HTMLで読み込み：

```html
<link rel="stylesheet" href="css/func.dropfile.css">
<link rel="stylesheet" href="css/func.dropsort.css">

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script type="module">
  import TwFunc from './js/func.js';
  window.TwFunc = TwFunc;
  TwFunc.create("dropfile,dropsort");
</script>
```

## 📖 オプション一覧

### dropfile オプション

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `dropfile-callback` | ファイル選択後のコールバック関数名（必須） | - |
| `dropfile-multiple` | 複数ファイルを許可 | `true` |
| `dropfile-accept` | 受け入れるファイルタイプ | `""` |
| `dropfile-maxsize` | 最大ファイルサイズ（MB） | `0` |
| `dropfile-dragoverclass` | ドラッグオーバー時のクラス名 | `"dragover"` |
| `dropfile-message` | ドロップエリアのメッセージ | `""` |

### dropsort オプション

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `dropsort-callback` | 並び替え後のコールバック関数名 | `""` |
| `dropsort-handle` | ドラッグハンドルのセレクタ | `""` |
| `dropsort-dragclass` | ドラッグ中のクラス名 | `"dragging"` |
| `dropsort-dragoverclass` | ドラッグオーバー時のクラス名 | `"dragover"` |
| `dropsort-item` | 並び替え対象の子要素セレクタ | `"> *"` |

## 🌐 ブラウザ対応

- Chrome（最新版）
- Firefox（最新版）
- Safari（最新版）
- Edge（最新版）

HTML5のドラッグ&ドロップAPIを使用しているため、モダンブラウザが必要です。

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストを歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📧 お問い合わせ

質問や提案がありましたら、[Issues](https://github.com/yourusername/twfunc-demo/issues)で報告してください。

---

**Made with ❤️ using TwFunc**
