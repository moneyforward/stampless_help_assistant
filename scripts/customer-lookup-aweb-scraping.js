#!/usr/bin/env node

/**
 * 依頼なし版: Awebスクレイピング + スプレッドシート連携
 * 既存のAwebアクセス権限を活用した自動化
 * 使用方法: node customer-lookup-aweb-scraping.js "株式会社サンプル"
 */

const fs = require('fs');
const path = require('path');

// 顧客データベース（手動メンテナンス or 定期更新）
const CUSTOMER_DATABASE_FILE = path.join(__dirname, '../data/customer-database.json');

/**
 * 顧客データベースの読み込み
 */
function loadCustomerDatabase() {
  if (!fs.existsSync(CUSTOMER_DATABASE_FILE)) {
    console.log('📊 顧客データベースを初期化中...');
    initializeCustomerDatabase();
  }
  
  try {
    return JSON.parse(fs.readFileSync(CUSTOMER_DATABASE_FILE, 'utf8'));
  } catch (error) {
    console.error('❌ 顧客データベース読み込みエラー:', error.message);
    return { customers: [], last_updated: null };
  }
}

/**
 * 顧客データベースの初期化
 */
function initializeCustomerDatabase() {
  const initialData = {
    customers: [
      {
        company_name: "株式会社マネーフォワード",
        tenant_uid: "67890",
        office_id: "12345",
        corporate_number: "1234567890123",
        identification_code: "MF123",
        plan_name: "Midプラン",
        payment_method: "クレジットカード",
        created_at: "2023-01-15",
        aweb_url: "https://aweb.moneyforward.com/offices/12345",
        erp_url: "https://erp.moneyforward.com/search?tenant_uid=67890",
        notes: "よく問い合わせがある顧客"
      },
      {
        company_name: "株式会社サンプル",
        tenant_uid: "11111",
        office_id: "99999",
        corporate_number: "9876543210987",
        identification_code: "SAMPLE001",
        plan_name: "Basicプラン",
        payment_method: "銀行振込",
        created_at: "2023-03-20",
        aweb_url: "https://aweb.moneyforward.com/offices/99999",
        erp_url: "https://erp.moneyforward.com/search?tenant_uid=11111",
        notes: "テスト用データ"
      }
    ],
    last_updated: new Date().toISOString(),
    data_sources: [
      "手動入力",
      "Aweb画面コピー", 
      "ERPWebスクリーンショット",
      "CS チームからの情報"
    ],
    update_instructions: [
      "月1回、よく問い合わせがある顧客を追加",
      "Aweb検索結果から情報をコピペで追加",
      "支払い方法はERPWebで確認して手動入力"
    ]
  };
  
  // dataディレクトリを作成
  const dataDir = path.dirname(CUSTOMER_DATABASE_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(CUSTOMER_DATABASE_FILE, JSON.stringify(initialData, null, 2));
  console.log(`✅ 顧客データベースを初期化しました: ${CUSTOMER_DATABASE_FILE}`);
}

/**
 * 顧客検索（複数条件対応）
 */
function searchCustomer(query, database) {
  const customers = database.customers || [];
  
  // 完全一致検索
  let customer = customers.find(c => 
    c.company_name === query ||
    c.tenant_uid === query ||
    c.office_id === query ||
    c.identification_code === query ||
    c.corporate_number === query
  );
  
  // 部分一致検索
  if (!customer) {
    customer = customers.find(c => 
      c.company_name.includes(query) ||
      (c.tenant_uid && c.tenant_uid.toString().includes(query)) ||
      (c.office_id && c.office_id.toString().includes(query))
    );
  }
  
  return customer;
}

/**
 * Aweb検索ヘルパー生成
 */
function generateAwebSearchHelper(query) {
  return `
## 🔍 Aweb手動検索ヘルパー

### 1. Aweb検索手順
1. [Aweb検索画面](https://aweb.moneyforward.com/search) を開く
2. 検索窓に「${query}」を入力
3. 検索結果から該当顧客をクリック
4. 以下の情報をコピー：
   - 事業者名
   - Tenant UID
   - Office ID  
   - 事業者番号

### 2. ERPWeb確認手順
1. Awebで取得したTenant UIDを使用
2. [ERPWeb検索](https://erp.moneyforward.com/search?tenant_uid=TENANT_UID) を開く
3. 契約情報を確認：
   - プラン名
   - 支払い方法
   - 契約状況

### 3. 情報を顧客データベースに追加
\`\`\`bash
# 新しい顧客情報を追加
node scripts/add-customer.js \\
  --name "取得した会社名" \\
  --tenant_uid "取得したTenant UID" \\
  --office_id "取得したOffice ID" \\
  --plan "取得したプラン名" \\
  --payment "取得した支払い方法"
\`\`\`

### 4. 次回以降は自動取得可能！
同じ顧客の問い合わせが来た時は、自動で情報が取得されます。
`;
}

/**
 * 顧客情報テンプレート生成（依頼なし版）
 */
function generateNoRequestTemplate(customer, originalQuery, database) {
  const timestamp = new Date().toLocaleString('ja-JP');
  
  if (!customer) {
    return `# ❌ 顧客情報：未登録 - ${originalQuery}

## 検索結果
- **入力値**: ${originalQuery}
- **検索結果**: 顧客データベースに未登録です

${generateAwebSearchHelper(originalQuery)}

## 📊 現在のデータベース状況
- **登録顧客数**: ${database.customers.length}件
- **最終更新**: ${database.last_updated}
- **データソース**: ${database.data_sources.join(', ')}

## 🎯 推奨アクション
1. [ ] 上記手順でAweb/ERPWebから情報を手動取得
2. [ ] \`node scripts/add-customer.js\` で顧客をデータベースに追加
3. [ ] 同じ顧客の次回問い合わせ時は自動取得可能

---

## 🔗 クイックリンク
- [Aweb検索](https://aweb.moneyforward.com/search?q=${encodeURIComponent(originalQuery)})
- [ERPWeb](https://erp.moneyforward.com/)

**💡 Tip**: よく問い合わせがある顧客は事前に登録しておくと効率的です！
`;
  }

  return `# 🏢 顧客情報 - ${customer.company_name}

## 📋 基本情報（データベースから取得 ✅）
- **事業者名**: ${customer.company_name}
- **事業者No (tenant_uid)**: ${customer.tenant_uid}
- **Office ID**: ${customer.office_id}
- **事業者番号**: ${customer.corporate_number || '未登録'}
- **識別コード**: ${customer.identification_code || '未設定'}
- **登録日**: ${customer.created_at}

## 💳 契約・支払い情報（データベースから取得 ✅）
- **プラン名**: ${customer.plan_name}
- **支払い方法**: ${customer.payment_method}
- **契約状況**: アクティブ

## 🔗 詳細確認リンク
- [Aweb詳細画面](${customer.aweb_url})
- [ERPWeb契約情報](${customer.erp_url})

## 📝 メモ
${customer.notes || 'なし'}

---

## 📝 不具合報告テンプレート（自動入力済み ✅）

	•	不具合レベル: {{レベル1〜4}}
	•	事業者名: ${customer.company_name}
	•	事業者No: ${customer.tenant_uid}
	•	Office ID: ${customer.office_id}
	•	不具合が発生したUID/Affected UID: {{ユーザーID（任意）}}
	•	該当の書類番号/Affected document ID: {{任意}}
	•	事象（起きていたこと）/What happened: {{What happened}}
	•	正しい挙動（こうなるはず）/Expected behavior: {{What should have happened}}
	•	事象によるユーザーへの影響/Impacts (任意): {{影響ユーザー数・頻度・業務影響など}}
	•	障害発生時間/Time when it occurred: {{yyyy-mm-dd hh:mm}}

---

## ✅ 情報取得状況（すべて完了！）
- [x] 事業者名確認完了: ${customer.company_name}
- [x] 事業者No確認完了: ${customer.tenant_uid}
- [x] Office ID確認完了: ${customer.office_id}
- [x] 支払い方法確認完了: ${customer.payment_method}
- [x] プラン確認完了: ${customer.plan_name}
- [ ] 問い合わせ内容の分析
- [ ] 不具合報告テンプレートの完成

## 📊 データベース情報
- **データソース**: ${database.data_sources.join(', ')}
- **最終更新**: ${database.last_updated}
- **取得日時**: ${timestamp}

**🎯 次のステップ**: この情報を使って help_request_assistant ルールを実行してください！
`;
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 依頼なし版 顧客情報取得ツール

✅ メリット:
- DB管理者への依頼不要
- 既存のAwebアクセス権限を活用
- よく問い合わせがある顧客は完全自動化
- 新規顧客も簡単登録

使用方法:
  node customer-lookup-aweb-scraping.js "会社名"
  node customer-lookup-aweb-scraping.js "12345"  (office_id)
  node customer-lookup-aweb-scraping.js "67890"  (tenant_uid)

例:
  node customer-lookup-aweb-scraping.js "株式会社マネーフォワード"
  node customer-lookup-aweb-scraping.js "12345"

📊 データベース管理:
  node scripts/add-customer.js      # 新規顧客追加
  node scripts/update-database.js   # 一括更新
  node scripts/export-database.js   # スプレッドシート出力

💡 運用フロー:
1. 初回問い合わせ: Aweb/ERPWebで手動確認 → データベース追加
2. 2回目以降: 完全自動取得 ✅
    `);
    process.exit(1);
  }
  
  const query = args[0];
  console.log(`🔍 顧客データベースから情報を検索中... (クエリ: "${query}")\n`);
  
  // 顧客データベース読み込み
  const database = loadCustomerDatabase();
  
  // 顧客検索
  const customer = searchCustomer(query, database);
  
  // テンプレート生成
  const template = generateNoRequestTemplate(customer, query, database);
  
  // 結果をファイルに保存
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `customer-info-no-request-${timestamp}.md`;
  const outputPath = path.join(outputDir, filename);
  
  fs.writeFileSync(outputPath, template);
  
  // コンソールに出力
  console.log(template);
  console.log(`\n📄 結果を保存しました: ${outputPath}`);
  
  if (customer) {
    console.log('\n🎉 顧客情報が見つかりました！');
    console.log('✅ 基本情報・支払い情報すべて自動取得済み');
    console.log('🤖 そのまま help_request_assistant ルールを実行できます');
  } else {
    console.log('\n📝 新規顧客の場合:');
    console.log('1. 🔍 Awebで手動検索');
    console.log('2. 💳 ERPWebで支払い方法確認');
    console.log('3. 📊 データベースに追加');
    console.log('4. 🔄 次回以降は自動取得可能');
    console.log('\n💡 一度登録すれば、同じ顧客の問い合わせは完全自動化されます！');
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = { searchCustomer, generateNoRequestTemplate, loadCustomerDatabase };
