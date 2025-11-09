# GitHub Pagesでデモを公開する手順

このドキュメントでは、TwFuncドラッグ&ドロップデモをGitHub Pagesで公開する手順を説明します。

## 📋 前提条件

- GitHubアカウントを持っていること
- Gitがインストールされていること

## 🚀 手順

### 1. GitHubで新しいリポジトリを作成

1. GitHubにログイン
2. 右上の「+」ボタンから「New repository」を選択
3. リポジトリ情報を入力：
   - **Repository name**: `twfunc-demo`（任意の名前）
   - **Description**: `TwFunc Drag & Drop Demo`
   - **Public** を選択（GitHub Pagesには必須）
   - ✅ **Add a README file** はチェックしない（既にREADME.mdがあるため）
4. 「Create repository」をクリック

### 2. ローカルリポジトリを初期化

ターミナルで以下のコマンドを実行：

```bash
# twfunc-demoディレクトリに移動
cd /Users/kt/Downloads/twfunc-demo

# Gitリポジトリを初期化
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Add TwFunc drag & drop demo"
```

### 3. GitHubリポジトリにプッシュ

GitHubで表示されているコマンドを実行（リポジトリURLは自分のものに置き換える）：

```bash
# リモートリポジトリを追加
git remote add origin https://github.com/yourusername/twfunc-demo.git

# mainブランチに変更（デフォルトがmasterの場合）
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

### 4. GitHub Pagesを有効化

1. GitHubのリポジトリページで「Settings」タブをクリック
2. 左サイドバーから「Pages」を選択
3. **Source** セクションで：
   - **Branch**: `main` を選択
   - **Folder**: `/ (root)` を選択
4. 「Save」をクリック

### 5. デプロイを待つ

- 数分後、緑色のバーに公開URLが表示されます
- URL形式: `https://yourusername.github.io/twfunc-demo/`

### 6. 動作確認

表示されたURLにアクセスして、デモが正しく動作することを確認します。

## 🔄 更新方法

ファイルを変更した後、以下のコマンドで更新をプッシュ：

```bash
# 変更をステージング
git add .

# コミット
git commit -m "Update demo"

# プッシュ
git push
```

数分後、GitHub Pagesに反映されます。

## 📝 README.mdのリンク更新

`README.md`の以下の部分を実際のURLに置き換えてください：

```markdown
# 変更前
👉 **[デモを見る](https://yourusername.github.io/twfunc-demo/)**

# 変更後（例）
👉 **[デモを見る](https://yourusername.github.io/twfunc-demo/)**
```

また、index.htmlのGitHubリンクも更新：

```html
<!-- 変更前 -->
<a href="https://github.com/yourusername/twfunc-demo" target="_blank">GitHub リポジトリ</a>

<!-- 変更後（例） -->
<a href="https://github.com/actualusername/twfunc-demo" target="_blank">GitHub リポジトリ</a>
```

更新後、再度コミット＆プッシュ：

```bash
git add README.md index.html
git commit -m "Update repository URLs"
git push
```

## 🎉 完了！

これで、TwFuncドラッグ&ドロップデモがGitHub Pagesで公開されました。

## 🔧 トラブルシューティング

### ページが表示されない

- GitHub Pagesの設定が正しいか確認
- ブランチが`main`になっているか確認
- ファイル名が`index.html`（小文字）か確認
- デプロイが完了するまで数分待つ

### JavaScriptが動作しない

- ブラウザのコンソールでエラーを確認
- ファイルパスが正しいか確認（相対パス）
- CSSとJSファイルが正しくコミットされているか確認

### ファイルが見つからない（404エラー）

- ディレクトリ構造を確認：
  ```
  twfunc-demo/
  ├── index.html
  ├── css/
  │   ├── func.dropfile.css
  │   └── func.dropsort.css
  └── js/
      ├── func.js
      ├── func.dropfile.js
      └── func.dropsort.js
  ```
- すべてのファイルがGitでトラッキングされているか確認：
  ```bash
  git status
  ```

## 💡 ヒント

- **カスタムドメイン**: GitHub Pagesの設定で独自ドメインを設定可能
- **HTTPS**: GitHub Pagesは自動的にHTTPSを有効化
- **Analytics**: Google Analyticsを追加してアクセス解析も可能

---

質問がある場合は、[GitHub Issues](https://github.com/yourusername/twfunc-demo/issues)で報告してください。
