# Kibela MCP 設定手順（初心者向け）

## このドキュメントについて

このドキュメントは、Kibelaの記事やフォルダーをAIアシスタント（Cursor等）から検索・操作できるようにするための設定手順です。

**簡単に言うと**: Kibelaの情報をAIに質問できるようにする設定です。

## 必要なもの

### 1. ソフトウェア
- **Node.js**: プログラムを動かすためのソフト（バージョン22.14.0以上）
- **pnpm**: プログラムの部品を管理するソフト
- **Cursor**: AIアシスタント付きのエディタ（またはClaude Desktop等）

### 2. 情報
- **Kibelaのサブドメイン**: 例）`https://moneyforward.kibe.la`
- **Kibelaのアクセストークン**: Kibelaの設定画面で取得できる認証情報

## 用語説明

- **MCP**: Model Context Protocol（AIが外部サービスと連携するための仕組み）
- **アクセストークン**: サービスに安全にアクセスするためのパスワードのようなもの
- **サブドメイン**: 会社やチーム固有のKibelaのアドレス

## 1. プログラムのダウンロード

**説明**: 必要なプログラムをインターネットからダウンロードします。

### macOS/Linux版

1. ターミナル（Terminal）を開く
2. 以下のコマンドを順番に入力してEnterキーを押す：

```bash
git clone https://github.com/kibela/kibela-mcp-server.git
cd kibela-mcp-server
```

### Windows版

1. コマンドプロンプト（cmd）またはPowerShellを開く
2. 以下のコマンドを順番に入力してEnterキーを押す：

```cmd
git clone https://github.com/kibela/kibela-mcp-server.git
cd kibela-mcp-server
```

**注意**: 初回実行時は「git」が見つからないエラーが出る場合があります。その場合は[Git for Windows](https://git-scm.com/download/win)をダウンロードしてインストールしてください。

## 2. 必要な部品のインストール

**説明**: プログラムを動かすために必要な部品をインストールします。

### macOS/Linux版

以下のコマンドを入力してEnterキーを押す：

```bash
pnpm install
```

**注意**: 「pnpm」が見つからないエラーが出た場合は、以下のコマンドを先に実行してください：

```bash
npm install -g pnpm
```

### Windows版

以下のコマンドを入力してEnterキーを押す：

```cmd
pnpm install
```

**注意**: 「pnpm」が見つからないエラーが出た場合は、以下のコマンドを先に実行してください：

```cmd
npm install -g pnpm
```

**インストール中**: しばらく時間がかかります。完了するまで待ってください。

## 3. プログラムの準備

**説明**: ダウンロードしたプログラムを実行できる形に準備します。

### macOS/Linux版

以下のコマンドを入力してEnterキーを押す：

```bash
pnpm build
```

### Windows版

以下のコマンドを入力してEnterキーを押す：

```cmd
pnpm build
```

**成功の確認**: エラーが出ずに完了すれば成功です。`bin/cli.mjs`というファイルが作成されます。

## 4. Cursorの設定ファイルを編集

**説明**: Cursor（AIアシスタント）にKibelaの情報を教えるための設定を行います。

### 設定ファイルの場所

#### macOS/Linux版
- ファイルの場所: `~/.cursor/mcp.json`
- 通常は `/Users/あなたのユーザー名/.cursor/mcp.json` にあります

#### Windows版
- ファイルの場所: `%USERPROFILE%\.cursor\mcp.json`
- 通常は `C:\Users\あなたのユーザー名\.cursor\mcp.json` にあります

### 設定ファイルの内容

以下の内容を設定ファイルに追加または編集してください：

#### macOS/Linux版

```json
{
  "mcpServers": {
    "kibela": {
      "command": "/Users/あなたのユーザー名/Documents/workspace/kibela-mcp-server/bin/cli.mjs",
      "env": {
        "KIBELA_ORIGIN": "https://あなたの会社.kibe.la",
        "KIBELA_ACCESS_TOKEN": "あなたのアクセストークン"
      }
    }
  }
}
```

#### Windows版

```json
{
  "mcpServers": {
    "kibela": {
      "command": "C:\\Users\\あなたのユーザー名\\Documents\\workspace\\kibela-mcp-server\\bin\\cli.mjs",
      "env": {
        "KIBELA_ORIGIN": "https://あなたの会社.kibe.la",
        "KIBELA_ACCESS_TOKEN": "あなたのアクセストークン"
      }
    }
  }
}
```

**重要**: 
- `あなたのユーザー名` を実際のユーザー名に変更してください
- `あなたの会社.kibe.la` を実際のKibelaのアドレスに変更してください
- `あなたのアクセストークン` を実際のアクセストークンに変更してください

## 5. 必要な情報の準備

**説明**: Kibelaにアクセスするために必要な情報を準備します。

### 必要な情報

#### 1. Kibelaのアドレス（KIBELA_ORIGIN）
- **例**: `https://moneyforward.kibe.la`
- **確認方法**: ブラウザでKibelaにアクセスする際のURL
- **注意**: 末尾のスラッシュ（`/`）は含めない

#### 2. Kibelaのアクセストークン（KIBELA_ACCESS_TOKEN）
- **形式**: `secret/AT/...` で始まる文字列
- **取得方法**: 
  1. Kibelaにログイン
  2. 設定画面を開く
  3. 「アクセストークン」または「API」の項目を探す
  4. 新しいトークンを発行

### 情報の確認方法

**Kibelaのアドレス確認**:
1. ブラウザでKibelaにアクセス
2. アドレスバーのURLをコピー
3. 例: `https://moneyforward.kibe.la`

**アクセストークンの確認**:
- Kibelaの設定画面で「アクセストークン」を検索
- または管理者に問い合わせ

### 設定例

#### macOS/Linux版

```json
{
  "mcpServers": {
    "kibela": {
      "command": "/Users/username/Documents/workspace/kibela-mcp-server/bin/cli.mjs",
      "env": {
        "KIBELA_ORIGIN": "https://moneyforward.kibe.la",
        "KIBELA_ACCESS_TOKEN": "secret/AT/MzY5Mw/wv1V1AfN8IYf6QXiJGqkJboVKAa0s04J4SgZ9MqPckI"
      }
    }
  }
}
```

#### Windows版

```json
{
  "mcpServers": {
    "kibela": {
      "command": "C:\\Users\\username\\Documents\\workspace\\kibela-mcp-server\\bin\\cli.mjs",
      "env": {
        "KIBELA_ORIGIN": "https://moneyforward.kibe.la",
        "KIBELA_ACCESS_TOKEN": "secret/AT/MzY5Mw/wv1V1AfN8IYf6QXiJGqkJboVKAa0s04J4SgZ9MqPckI"
      }
    }
  }
}
```

**注意**: 上記の例は参考用です。実際の値に変更してください。

## 6. 他の方法での設定（上級者向け）

**説明**: pnpmが使えない場合の代替方法です。通常は上記の手順で問題ありません。

### npmを使用する場合

pnpmの代わりにnpmを使用する場合：

#### macOS/Linux版

```bash
npm install
npm run build
```

#### Windows版

```cmd
npm install
npm run build
```

### yarnを使用する場合

yarnを使用する場合：

#### macOS/Linux版

```bash
yarn install
yarn build
```

#### Windows版

```cmd
yarn install
yarn build
```

**初心者の方**: このセクションは飛ばして、次の「動作確認」に進んでください。

## 7. 設定の確認

**説明**: 設定が正しく行われているか確認します。

### 簡単な確認方法

#### macOS/Linux版

1. ターミナルで以下のコマンドを実行：

```bash
cd kibela-mcp-server
KIBELA_ORIGIN="https://あなたの会社.kibe.la" KIBELA_ACCESS_TOKEN="あなたのアクセストークン" ./bin/cli.mjs
```

**エラーが出た場合**: 以下のコマンドを先に実行してください：

```bash
chmod +x bin/cli.mjs
```

#### Windows版

1. コマンドプロンプトで以下のコマンドを実行：

```cmd
cd kibela-mcp-server
set KIBELA_ORIGIN=https://あなたの会社.kibe.la
set KIBELA_ACCESS_TOKEN=あなたのアクセストークン
node bin/cli.mjs
```

**PowerShellを使用する場合**:

```powershell
cd kibela-mcp-server
$env:KIBELA_ORIGIN="https://あなたの会社.kibe.la"
$env:KIBELA_ACCESS_TOKEN="あなたのアクセストークン"
node bin/cli.mjs
```

### Cursorでの確認

1. **Cursorを再起動**（重要！）
2. CursorでAIアシスタントに「Kibelaから記事を検索して」と質問
3. 正常に動作すれば設定完了です

**成功の確認**: AIがKibelaの記事を検索できれば成功です。

## 8. できること（上級者向け）

**説明**: 設定が完了すると、以下のような操作がAIアシスタントからできるようになります。

### 記事・ノートの操作

- **記事の検索**: キーワードで記事を探す
- **記事の取得**: 特定の記事の内容を取得
- **記事の作成**: 新しい記事を作成
- **記事の更新**: 既存の記事を編集

### フォルダーの操作

- **フォルダーの検索**: フォルダーを探す
- **フォルダー内の記事取得**: 特定のフォルダーにある記事を取得
- **フォルダーの作成**: 新しいフォルダーを作成
- **記事の移動**: 記事を別のフォルダーに移動

### コメントの操作

- **コメントの作成**: 記事にコメントを追加
- **コメントへの返信**: コメントに返信

**初心者の方**: 基本的には「記事の検索」が最もよく使われます。他の機能は必要に応じて使用してください。

## 9. よくある問題と解決方法

### 問題1: 「git」が見つからない

**症状**: `git: command not found` というエラーが出る

**解決方法**:
- **Windows**: [Git for Windows](https://git-scm.com/download/win)をダウンロードしてインストール
- **macOS**: ターミナルで `xcode-select --install` を実行

### 問題2: 「pnpm」が見つからない

**症状**: `pnpm: command not found` というエラーが出る

**解決方法**:
```bash
npm install -g pnpm
```

### 問題3: 「Invalid URL」エラー

**症状**: `Invalid URL` または `undefined/api/v1` というエラーが出る

**解決方法**:
1. 設定ファイルの `KIBELA_ORIGIN` が正しく設定されているか確認
2. 末尾にスラッシュ（`/`）が含まれていないか確認
3. 例: `https://moneyforward.kibe.la` （正しい）
4. 例: `https://moneyforward.kibe.la/` （間違い）

### 問題4: 認証エラー

**症状**: 認証に関するエラーが出る

**解決方法**:
1. Kibelaの設定画面でアクセストークンを再発行
2. 設定ファイルの `KIBELA_ACCESS_TOKEN` を更新

### 問題5: CursorでKibelaツールが表示されない

**症状**: AIアシスタントがKibelaの記事を検索できない

**解決方法**:
1. **Cursorを完全に再起動**（重要！）
2. 設定ファイルが正しく保存されているか確認
3. 設定ファイルのパスが正しいか確認

### Windows固有の問題

#### パスの問題
- Windowsでは `\` を使用: `C:\\Users\\username\\path\\to\\cli.mjs`
- 例: `C:\Users\username\Documents\workspace\kibela-mcp-server\bin\cli.mjs`

#### 環境変数の設定
- **コマンドプロンプト**: `set KIBELA_ORIGIN=https://...`
- **PowerShell**: `$env:KIBELA_ORIGIN="https://..."`

### それでも解決しない場合

1. 管理者に相談
2. エラーメッセージをコピーして保存
3. 設定手順を最初からやり直す

## 10. 使い方の例

### 基本的な使い方

設定が完了すると、Cursorで以下のように質問できます：

**例1: 記事の検索**
```
「Kibelaから「React」に関する記事を検索して」
```

**例2: 特定の記事の取得**
```
「Kibelaの記事「記事の書き方」の内容を教えて」
```

**例3: フォルダー内の記事取得**
```
「開発フォルダーにある記事を一覧表示して」
```

### よく使う質問例

- 「Kibelaから技術記事を検索して」
- 「プロダクトマネジメントに関する記事を探して」
- 「最近更新された記事を教えて」
- 「特定の著者の記事を検索して」

**初心者の方**: まずは「Kibelaから記事を検索して」と質問してみてください。

## 参考リンク

- [Kibela MCP Server GitHub](https://github.com/kibela/kibela-mcp-server)
- [Kibela公式サイト](https://kibe.la/)
- [Node.js公式サイト](https://nodejs.org/)
- [pnpm公式サイト](https://pnpm.io/)
- [Git for Windows](https://git-scm.com/download/win)

## 注意事項

- **セキュリティ**: アクセストークンは他人に教えないでください
- **更新**: 定期的にアクセストークンを更新することをお勧めします
- **バックアップ**: 設定ファイルは安全な場所にバックアップしてください

## まとめ

この設定により、CursorのAIアシスタントからKibelaの記事を検索・操作できるようになります。

**設定の流れ**:
1. プログラムのダウンロード
2. 必要な部品のインストール
3. プログラムの準備
4. Cursorの設定ファイル編集
5. 必要な情報の準備
6. 設定の確認

**成功の確認**: Cursorで「Kibelaから記事を検索して」と質問して、正常に動作すれば完了です。

---

**作成日**: 2025年8月3日  
**更新日**: 2025年8月3日  
**バージョン**: 2.0（初心者向け版） 