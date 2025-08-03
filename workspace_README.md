# masa_knowledge - 知識管理システム - ハイブリッドZettelkastenアプローチ

このリポジトリは、Obsidianを使用した知識管理システムとCursorによるAIアシスト機能を組み合わせたハイブリッドシステムです。コードとノートを緩やかに分離しつつも、同一リポジトリ内で両方を効率的に管理できるよう設計されています。

## 🗂️ ディレクトリ構造

```
./
├─ 00_Inbox/          # 未分類のノート (24時間以内に処理)   
│   ├─ clip/          # Webクリッピング
│   ├─ other/         # その他メモ
│   └─ idea/          # アイデアメモ
├─ 20_Literature/     # 外部情報のノート (最大2階層)
│   ├─ 21_Books/      # 書籍関連ノート
│   ├─ 22_Articles/   # 記事メモ
│   ├─ 23_Videos/     # 動画コンテンツノート
│   ├─ 24_SNS/        # SNS関連ノート
│   └─ 29_Other/     # その他ノート
├─ 30_Permanent/      # 自分の言葉で再構築した核ノート
│   ├─ 31_Philosophy/ # 哲学関連
│   ├─ 32_Tech/       # 技術関連
│   ├─ 33_Productivity/ # 生産性向上
│   ├─ 34_Product/    # プロダクト関連
│   └─ 35_AI/         # AI関連
├─ 70_Share/          # 共有・公開ノート
│   ├─ 71_Internal/   # 内部限定共有
│   ├─ 75_Blog/       # ブログ用ドラフト
│   └─ 79_Public/     # 完全公開コンテンツ
├─ 90_Index/          # MOCファイル (知識の地図)
├─ 100_Cursor/        # Cursor AI関連設定・ルール解説
├─ attachments/       # 添付ファイル (画像・PDF等)
├─ .cursor/           # Cursor設定
│   └─ rules/         # 自動化ルール
└─ .obsidian/         # Obsidian設定 (一部git管理対象外)
```

## 🔄 基本ワークフロー

1. **収集 (Capture)**: すべての情報はまず`00_Inbox/`に集約
2. **処理 (Process)**: 外部情報は`20_Literature/`へ整理
3. **深化 (Synthesize)**: 自分の言葉で再構築した知識は`30_Permanent/`へ
4. **共有 (Share)**: 公開用コンテンツは`70_Share/`へ
5. **索引 (Index)**: `90_Index/`で知識体系を俯瞰

## 🛠 使用技術

- Obsidian (ナレッジベース)
- Cursor (AIアシスト)
- Git / GitHub (バージョン管理・同期)

## 📘 詳細ガイド

各フォルダの詳細なルールや運用方法については、以下を参照してください:

- [フォルダ構造と詳細ルール](./100_Cursor/101_フォルダ構造.md)
- [ワークフローガイド](./100_Cursor/102_ワークフロー.md)
- [自動化ルール](./100_Cursor/103_自動化ルール.md)
- [Git管理ポリシー](./100_Cursor/104_Git管理.md)
- [タグ管理ルール](./100_Cursor/105_タグ管理.md)

## 🔍 はじめ方

1. このリポジトリをクローン
2. Obsidianで開く (Vault設定として指定)
3. `.obsidian/`内の設定を確認・適用
4. [Obsidian Git](https://github.com/denolehov/obsidian-git)プラグインをインストール
5. 必要に応じて他のプラグインをインストール

---

詳細については、`100_Cursor/`ディレクトリ内のドキュメントを参照してください。
