#!/usr/bin/env node

/**
 * 顧客情報自動取得スクリプト
 * 使用方法: node customer-lookup.js "株式会社サンプル"
 */

const fs = require('fs');
const path = require('path');

// 模擬データベース（実際の実装では stampless_backend のAPIまたはDBに接続）
const mockCustomerDB = [
  {
    office_id: 12345,
    tenant_uid: 67890,
    company_name: "株式会社サンプル",
    corporate_number: "1234567890123",
    identification_code: "ABC123",
    plan_name: "Midプラン",
    payment_method: "クレジットカード"
  },
  {
    office_id: 12346,
    tenant_uid: 67891,
    company_name: "有限会社テスト",
    corporate_number: "9876543210987",
    identification_code: "DEF456",
    plan_name: "Webプラン",
    payment_method: "銀行振込"
  },
  {
    office_id: 12347,
    tenant_uid: 67892,
    company_name: "合同会社ダミー",
    corporate_number: "5555666677778",
    identification_code: "GHI789",
    plan_name: "Mid+SFプラン",
    payment_method: "口座振替"
  }
];

/**
 * 顧客情報検索
 * @param {string} query - 検索クエリ（会社名、office_id、tenant_uid等）
 * @returns {object|null} - 見つかった顧客情報
 */
function searchCustomer(query) {
  const cleanQuery = query.trim();
  
  // 数値の場合はoffice_idまたはtenant_uidとして検索
  if (/^\d+$/.test(cleanQuery)) {
    const numQuery = parseInt(cleanQuery);
    return mockCustomerDB.find(customer => 
      customer.office_id === numQuery || customer.tenant_uid === numQuery
    );
  }
  
  // 文字列の場合は会社名で部分一致検索
  return mockCustomerDB.find(customer => 
    customer.company_name.includes(cleanQuery) ||
    customer.identification_code === cleanQuery ||
    customer.corporate_number === cleanQuery
  );
}

/**
 * 顧客情報テンプレート生成
 * @param {object} customerInfo - 顧客情報
 * @param {string} originalQuery - 元の検索クエリ
 * @returns {string} - マークダウンテンプレート
 */
function generateCustomerInfoTemplate(customerInfo, originalQuery) {
  if (!customerInfo) {
    return `# ❌ 顧客情報取得エラー

## 検索クエリ
- **入力値**: ${originalQuery}
- **検索結果**: 該当する顧客が見つかりませんでした

## 🔍 確認事項
- [ ] 会社名のスペルミスがないか確認
- [ ] office_id、tenant_uid が正確か確認
- [ ] 顧客がシステムに登録済みか確認

## 🔗 手動確認リンク
- [Aweb検索](https://aweb.example.com/search?q=${encodeURIComponent(originalQuery)})
- [ERPWeb検索](https://erp.example.com/search?q=${encodeURIComponent(originalQuery)})
`;
  }

  return `# 🏢 顧客情報 - ${customerInfo.company_name}

## 📋 基本情報（自動取得済み）
- **事業者名**: ${customerInfo.company_name}
- **事業者No (tenant_uid)**: ${customerInfo.tenant_uid}
- **Office ID**: ${customerInfo.office_id}
- **事業者番号**: ${customerInfo.corporate_number}
- **識別コード**: ${customerInfo.identification_code}

## 💳 契約・支払い情報（自動取得済み）
- **プラン名**: ${customerInfo.plan_name}
- **支払い方法**: ${customerInfo.payment_method}

## 🔗 詳細確認リンク
- [Aweb詳細画面](https://aweb.example.com/offices/${customerInfo.office_id})
- [ERPWeb契約情報](https://erp.example.com/search?tenant_uid=${customerInfo.tenant_uid})

---

## 📝 不具合報告テンプレート（自動入力済み）

	•	不具合レベル: {{レベル1〜4}}
	•	事業者名: ${customerInfo.company_name}
	•	事業者No: ${customerInfo.tenant_uid}
	•	Office ID: ${customerInfo.office_id}
	•	不具合が発生したUID/Affected UID: {{ユーザーID（任意）}}
	•	該当の書類番号/Affected document ID: {{任意}}
	•	事象（起きていたこと）/What happened: {{What happened}}
	•	正しい挙動（こうなるはず）/Expected behavior: {{What should have happened}}
	•	事象によるユーザーへの影響/Impacts (任意): {{影響ユーザー数・頻度・業務影響など}}
	•	障害発生時間/Time when it occurred: {{yyyy-mm-dd hh:mm}}

---

## ✅ 情報取得完了
- [x] 事業者名確認完了
- [x] 事業者No確認完了
- [x] 支払い方法確認完了
- [ ] 問い合わせ内容の分析
- [ ] 不具合報告テンプレートの完成

**次のステップ**: この情報を使って help_request_assistant ルールを実行してください。
`;
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 顧客情報取得ツール

使用方法:
  node customer-lookup.js "会社名"
  node customer-lookup.js "12345"  (office_id)
  node customer-lookup.js "67890"  (tenant_uid)

例:
  node customer-lookup.js "株式会社サンプル"
  node customer-lookup.js "12345"
    `);
    process.exit(1);
  }
  
  const query = args[0];
  console.log(`🔍 顧客情報を検索中... (クエリ: "${query}")\n`);
  
  const customerInfo = searchCustomer(query);
  const template = generateCustomerInfoTemplate(customerInfo, query);
  
  // 結果をファイルに保存
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `customer-info-${timestamp}.md`;
  const outputPath = path.join(outputDir, filename);
  
  fs.writeFileSync(outputPath, template);
  
  // コンソールに出力
  console.log(template);
  console.log(`\n📄 結果を保存しました: ${outputPath}`);
  
  if (customerInfo) {
    console.log('\n🎯 次のアクション:');
    console.log('1. この情報を確認してください');
    console.log('2. 問い合わせ内容を追加で入力してください');
    console.log('3. help_request_assistant ルールが自動実行されます');
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = { searchCustomer, generateCustomerInfoTemplate };
