#!/usr/bin/env node

/**
 * Google Slides同期ツール（将来実装用）
 * 現在は手動コピペ用のヘルパーツール
 * 使用方法: node google-slides-sync.js --check
 */

const fs = require('fs');
const path = require('path');

// 新リース会計ガイドライン管理
const LEASE_ACCOUNTING_SLIDES_URL = 'https://docs.google.com/presentation/d/1e9xoZB8VqfD4FsRH-eM5OPElTF8NIgs5NbZNh8ZSgEw/edit?usp=sharing';
const LEASE_ACCOUNTING_DATA_FILE = path.join(__dirname, '../data/lease-accounting-guidelines.json');

/**
 * 新リース会計ガイドラインデータの初期化
 */
function initializeLeaseAccountingData() {
  const initialData = {
    last_updated: null,
    slides_url: LEASE_ACCOUNTING_SLIDES_URL,
    guidelines: {
      customer_sharing_ok: [
        "新リース会計基準の説明",
        "対応スケジュール（確定済みのもの）",
        "機能の利用方法・操作手順",
        "既存機能からの移行手順",
        "システム要件・動作環境",
        "基本的な設定方法"
      ],
      customer_sharing_ng: [
        "内部開発スケジュール",
        "技術的実装詳細",
        "他社との差別化戦略",
        "未確定の機能仕様",
        "コスト・価格戦略",
        "競合他社の機能比較詳細"
      ],
      escalation_required: [
        "法的責任に関わる判断",
        "監査対応に関する具体的手順",
        "他社製品との詳細比較",
        "カスタマイズ開発の可否",
        "会計基準の解釈",
        "業界特有の適用方法"
      ],
      special_notes: [
        "法的解釈が含まれる場合は会計士チーム確認必須",
        "業界・規模に応じた回答内容調整が必要",
        "責任者（プロダクトマネージャー）承認を取得",
        "競合他社情報は必ず除外すること"
      ]
    },
    update_history: [
      {
        date: new Date().toISOString(),
        action: "初期データ作成",
        user: "システム",
        note: "手動更新待ち"
      }
    ]
  };

  // dataディレクトリを作成
  const dataDir = path.dirname(LEASE_ACCOUNTING_DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(LEASE_ACCOUNTING_DATA_FILE, JSON.stringify(initialData, null, 2));
  console.log(`✅ 新リース会計ガイドラインデータを初期化: ${LEASE_ACCOUNTING_DATA_FILE}`);
}

/**
 * 現在のガイドラインデータを読み込み
 */
function loadLeaseAccountingData() {
  if (!fs.existsSync(LEASE_ACCOUNTING_DATA_FILE)) {
    console.log('📊 新リース会計ガイドラインデータを初期化中...');
    initializeLeaseAccountingData();
  }

  try {
    return JSON.parse(fs.readFileSync(LEASE_ACCOUNTING_DATA_FILE, 'utf8'));
  } catch (error) {
    console.error('❌ ガイドラインデータ読み込みエラー:', error.message);
    return null;
  }
}

/**
 * ガイドラインデータの保存
 */
function saveLeaseAccountingData(data) {
  data.last_updated = new Date().toISOString();
  fs.writeFileSync(LEASE_ACCOUNTING_DATA_FILE, JSON.stringify(data, null, 2));
}

/**
 * 手動更新ヘルパー
 */
function showManualUpdateHelper() {
  console.log(`
🔄 新リース会計ガイドライン手動更新ヘルパー

### 📋 更新手順:
1. Google Slides資料を開く:
   ${LEASE_ACCOUNTING_SLIDES_URL}

2. 最新の内容を確認し、以下の項目を更新:

### ✅ 顧客共有OK項目:
   - 新しく追加された機能の説明
   - 確定したリリーススケジュール
   - 操作手順の変更点

### ❌ 顧客共有NG項目:
   - 開発中の機能
   - 内部のみの技術情報
   - 競合他社戦略

### ⚠️ エスカレーション必要項目:
   - 法的判断が必要な内容
   - 会計基準の解釈
   - 業界特有の適用

3. 更新内容をこのツールに反映:
   node google-slides-sync.js --update

### 🚨 注意事項:
- 月1回の定期確認を推奨
- 重要な変更があった場合は即座に更新
- 不明な点は必ずプロダクトマネージャーに確認
  `);
}

/**
 * ガイドライン内容の表示
 */
function displayCurrentGuidelines() {
  const data = loadLeaseAccountingData();
  if (!data) return;

  console.log(`
📄 現在の新リース会計ガイドライン

🔗 Google Slides URL: ${data.slides_url}
📅 最終更新: ${data.last_updated || '未更新'}

### ✅ 顧客共有OK:
${data.guidelines.customer_sharing_ok.map(item => `  - ${item}`).join('\n')}

### ❌ 顧客共有NG:
${data.guidelines.customer_sharing_ng.map(item => `  - ${item}`).join('\n')}

### 🚨 エスカレーション必要:
${data.guidelines.escalation_required.map(item => `  - ${item}`).join('\n')}

### 📝 特記事項:
${data.guidelines.special_notes.map(item => `  - ${item}`).join('\n')}

### 📊 更新履歴:
${data.update_history.slice(-3).map(entry => 
  `  ${entry.date.split('T')[0]} - ${entry.action} (${entry.user})`
).join('\n')}
  `);
}

/**
 * 新リース会計質問の判定
 */
function checkLeaseAccountingQuestion(query) {
  const leaseKeywords = [
    'リース会計', 'リース基準', 'IFRS16', 'ASC842', 'ASU',
    'リース債務', 'リース資産', '使用権資産', 'リース負債',
    '短期リース', '少額リース', 'リース分類', 'リース期間',
    'リース料', 'リース契約', 'リース取引', 'リース移行'
  ];

  const isLeaseQuestion = leaseKeywords.some(keyword => 
    query.toLowerCase().includes(keyword.toLowerCase())
  );

  if (isLeaseQuestion) {
    console.log('🏢 新リース会計関連の質問を検出しました');
    console.log('📋 特別なガイドラインを適用します');
    
    const data = loadLeaseAccountingData();
    return {
      is_lease_question: true,
      guidelines: data?.guidelines || null,
      slides_url: LEASE_ACCOUNTING_SLIDES_URL
    };
  }

  return { is_lease_question: false };
}

/**
 * 使用方法表示
 */
function showUsage() {
  console.log(`
🔄 Google Slides同期ツール（新リース会計対応）

使用方法:
  node google-slides-sync.js [オプション]

オプション:
  --check             現在のガイドライン内容を表示
  --update            手動更新ヘルパーを表示
  --test "質問文"     新リース会計質問かどうかを判定

例:
  node google-slides-sync.js --check
  node google-slides-sync.js --test "IFRS16の対応状況を教えてください"
  node google-slides-sync.js --update

📱 将来実装予定:
- Google Slides API連携による自動更新
- Notion同期機能
- 変更通知機能
  `);
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }

  if (args.includes('--check')) {
    displayCurrentGuidelines();
    return;
  }

  if (args.includes('--update')) {
    showManualUpdateHelper();
    return;
  }

  if (args.includes('--test')) {
    const queryIndex = args.indexOf('--test') + 1;
    const query = args[queryIndex];
    
    if (!query) {
      console.error('❌ --test オプションには質問文を指定してください');
      return;
    }

    const result = checkLeaseAccountingQuestion(query);
    console.log('\n🔍 判定結果:');
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.error('❌ 不明なオプションです');
  showUsage();
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = { 
  checkLeaseAccountingQuestion, 
  loadLeaseAccountingData,
  saveLeaseAccountingData 
};
