#!/usr/bin/env node

/**
 * Google Slides API連携ツール
 * 新リース会計ガイドラインを自動で取得・更新
 * 使用方法: node google-slides-api.js --sync
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// 設定
const SLIDES_ID = '1e9xoZB8VqfD4FsRH-eM5OPElTF8NIgs5NbZNh8ZSgEw';
const CREDENTIALS_FILE = path.join(__dirname, '../config/google-api-credentials.json');
const TOKEN_FILE = path.join(__dirname, '../config/google-api-token.json');
const GUIDELINES_FILE = path.join(__dirname, '../data/lease-accounting-guidelines.json');

// Google API スコープ
const SCOPES = ['https://www.googleapis.com/auth/presentations.readonly'];

/**
 * Google API認証クライアントの作成
 */
async function authorize() {
  try {
    // 認証情報ファイルの確認
    if (!fs.existsSync(CREDENTIALS_FILE)) {
      console.error(`❌ 認証情報ファイルが見つかりません: ${CREDENTIALS_FILE}`);
      console.log('\n📋 セットアップが必要です:');
      console.log('1. Google Cloud Consoleで新しいプロジェクトを作成');
      console.log('2. Google Slides APIを有効化');
      console.log('3. サービスアカウントキーを作成');
      console.log('4. 認証情報をcredentialsファイルに保存');
      console.log('\n詳細手順: node google-slides-api.js --setup');
      return null;
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE));
    
    // サービスアカウント認証
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_FILE,
      scopes: SCOPES,
    });

    const authClient = await auth.getClient();
    console.log('✅ Google API認証成功');
    return authClient;

  } catch (error) {
    console.error('❌ Google API認証エラー:', error.message);
    console.log('\n🔧 対処法:');
    console.log('1. 認証情報ファイルの内容を確認');
    console.log('2. Google Cloud Consoleでサービスアカウントキーを再作成');
    console.log('3. Slides APIが有効になっているか確認');
    return null;
  }
}

/**
 * Google Slidesからテキスト内容を取得
 */
async function getSlidesContent(auth) {
  try {
    const slides = google.slides({ version: 'v1', auth });
    
    console.log(`🔍 Google Slidesから内容を取得中... (ID: ${SLIDES_ID})`);
    
    const response = await slides.presentations.get({
      presentationId: SLIDES_ID,
    });

    const presentation = response.data;
    let allText = [];
    let slideContents = [];

    // 各スライドのテキストを抽出
    presentation.slides.forEach((slide, index) => {
      let slideText = [];
      
      if (slide.pageElements) {
        slide.pageElements.forEach(element => {
          if (element.shape && element.shape.text) {
            element.shape.text.textElements.forEach(textElement => {
              if (textElement.textRun) {
                slideText.push(textElement.textRun.content);
              }
            });
          }
        });
      }
      
      const slideContent = slideText.join('').trim();
      if (slideContent) {
        slideContents.push({
          slideNumber: index + 1,
          content: slideContent
        });
        allText.push(slideContent);
      }
    });

    console.log(`✅ ${slideContents.length}枚のスライドからテキストを抽出しました`);
    
    return {
      title: presentation.title,
      totalSlides: presentation.slides.length,
      lastModified: new Date().toISOString(),
      slides: slideContents,
      fullText: allText.join('\n\n')
    };

  } catch (error) {
    console.error('❌ Google Slides取得エラー:', error.message);
    
    if (error.code === 404) {
      console.log('🔧 対処法: Slides IDが正しいか確認してください');
    } else if (error.code === 403) {
      console.log('🔧 対処法: サービスアカウントにSlidesへのアクセス権限を付与してください');
      console.log('   1. Google Slidesを開く');
      console.log('   2. 共有ボタンをクリック');
      console.log('   3. サービスアカウントのメールアドレスを追加（閲覧権限）');
    }
    
    return null;
  }
}

/**
 * Slides内容から新リース会計ガイドラインを抽出
 */
function parseLeaseAccountingGuidelines(slidesContent) {
  const fullText = slidesContent.fullText.toLowerCase();
  
  // キーワードベースでガイドライン情報を抽出
  const guidelines = {
    customer_sharing_ok: [],
    customer_sharing_ng: [],
    escalation_required: [],
    special_notes: [],
    schedule_info: [],
    feature_info: []
  };

  // 顧客共有OK項目の検出
  const sharingOkKeywords = [
    'お客様に共有可能', '顧客に説明可能', '公開情報', '一般公開',
    '機能説明', '操作手順', 'スケジュール（確定）', '基本機能',
    '利用方法', '設定方法', 'システム要件'
  ];

  // 顧客共有NG項目の検出
  const sharingNgKeywords = [
    'お客様共有不可', '社内限定', '機密情報', '開発中',
    '内部開発', '技術詳細', '競合情報', '価格戦略',
    '未確定', '検討中', 'コスト情報'
  ];

  // エスカレーション必要項目の検出
  const escalationKeywords = [
    '法的判断', '会計士確認', '監査対応', '法的責任',
    '会計基準解釈', '業界特有', 'カスタマイズ',
    '他社比較', '競合比較'
  ];

  // スライド内容を分析
  slidesContent.slides.forEach(slide => {
    const content = slide.content.toLowerCase();
    
    // 各カテゴリの情報を抽出
    sharingOkKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        const lines = slide.content.split('\n');
        lines.forEach(line => {
          if (line.trim() && line.toLowerCase().includes(keyword)) {
            guidelines.customer_sharing_ok.push(line.trim());
          }
        });
      }
    });

    sharingNgKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        const lines = slide.content.split('\n');
        lines.forEach(line => {
          if (line.trim() && line.toLowerCase().includes(keyword)) {
            guidelines.customer_sharing_ng.push(line.trim());
          }
        });
      }
    });

    escalationKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        const lines = slide.content.split('\n');
        lines.forEach(line => {
          if (line.trim() && line.toLowerCase().includes(keyword)) {
            guidelines.escalation_required.push(line.trim());
          }
        });
      }
    });

    // スケジュール情報の抽出
    if (content.includes('スケジュール') || content.includes('リリース') || content.includes('対応予定')) {
      const lines = slide.content.split('\n');
      lines.forEach(line => {
        if (line.trim() && (line.includes('月') || line.includes('年') || line.includes('期'))) {
          guidelines.schedule_info.push(line.trim());
        }
      });
    }

    // 機能情報の抽出
    if (content.includes('機能') || content.includes('対応') || content.includes('実装')) {
      const lines = slide.content.split('\n');
      lines.forEach(line => {
        if (line.trim() && line.length > 10) {
          guidelines.feature_info.push(line.trim());
        }
      });
    }
  });

  // 重複除去
  Object.keys(guidelines).forEach(key => {
    guidelines[key] = [...new Set(guidelines[key])];
  });

  return guidelines;
}

/**
 * ガイドラインデータの更新
 */
function updateGuidelinesData(slidesContent, parsedGuidelines) {
  const currentData = loadCurrentGuidelines();
  
  const updatedData = {
    ...currentData,
    last_updated: slidesContent.lastModified,
    slides_url: `https://docs.google.com/presentation/d/${SLIDES_ID}/edit?usp=sharing`,
    slides_content: {
      title: slidesContent.title,
      total_slides: slidesContent.totalSlides,
      last_modified: slidesContent.lastModified,
      extracted_at: new Date().toISOString()
    },
    guidelines: {
      // 既存のベースライン + Slidesから抽出した内容をマージ
      customer_sharing_ok: [
        ...currentData.guidelines?.customer_sharing_ok || [],
        ...parsedGuidelines.customer_sharing_ok
      ],
      customer_sharing_ng: [
        ...currentData.guidelines?.customer_sharing_ng || [],
        ...parsedGuidelines.customer_sharing_ng
      ],
      escalation_required: [
        ...currentData.guidelines?.escalation_required || [],
        ...parsedGuidelines.escalation_required
      ],
      special_notes: [
        ...currentData.guidelines?.special_notes || [],
        ...parsedGuidelines.special_notes
      ],
      schedule_info: parsedGuidelines.schedule_info,
      feature_info: parsedGuidelines.feature_info
    },
    raw_slides_data: slidesContent.slides,
    update_history: [
      ...(currentData.update_history || []),
      {
        date: new Date().toISOString(),
        action: "Google Slides API自動同期",
        user: "システム",
        note: `${parsedGuidelines.customer_sharing_ok.length + parsedGuidelines.customer_sharing_ng.length}項目を更新`
      }
    ]
  };

  // 重複除去
  Object.keys(updatedData.guidelines).forEach(key => {
    if (Array.isArray(updatedData.guidelines[key])) {
      updatedData.guidelines[key] = [...new Set(updatedData.guidelines[key])];
    }
  });

  return updatedData;
}

/**
 * 現在のガイドラインデータ読み込み
 */
function loadCurrentGuidelines() {
  if (!fs.existsSync(GUIDELINES_FILE)) {
    return {
      guidelines: {
        customer_sharing_ok: [],
        customer_sharing_ng: [],
        escalation_required: [],
        special_notes: []
      },
      update_history: []
    };
  }

  try {
    return JSON.parse(fs.readFileSync(GUIDELINES_FILE, 'utf8'));
  } catch (error) {
    console.error('❌ 既存ガイドライン読み込みエラー:', error.message);
    return { guidelines: {}, update_history: [] };
  }
}

/**
 * ガイドラインデータの保存
 */
function saveGuidelines(data) {
  const dataDir = path.dirname(GUIDELINES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(GUIDELINES_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ ガイドラインデータを更新: ${GUIDELINES_FILE}`);
}

/**
 * セットアップガイドの表示
 */
function showSetupGuide() {
  console.log(`
🚀 Google Slides API セットアップガイド

### 📋 前提条件:
- Googleアカウント
- Google Cloud Platform プロジェクト

### ⚡ セットアップ手順:

#### 1. Google Cloud Console設定
1. https://console.cloud.google.com/ にアクセス
2. 新しいプロジェクトを作成または既存プロジェクトを選択
3. 「APIとサービス」→「ライブラリ」で「Google Slides API」を検索
4. Google Slides APIを有効化

#### 2. サービスアカウント作成
1. 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「サービスアカウント」
3. サービスアカウント名を入力（例: "slides-reader"）
4. 役割は不要（デフォルトのまま）
5. 完了後、作成されたサービスアカウントをクリック
6. 「キー」タブ→「キーを追加」→「新しいキーを作成」
7. JSON形式を選択してダウンロード

#### 3. 認証情報ファイル配置
ダウンロードしたJSONファイルを以下に配置:
${CREDENTIALS_FILE}

#### 4. Google Slidesアクセス権限付与
1. 新リース会計Slidesを開く: 
   https://docs.google.com/presentation/d/${SLIDES_ID}/edit
2. 右上の「共有」ボタンをクリック
3. サービスアカウントのメールアドレスを追加
   （JSONファイル内の "client_email" の値）
4. 権限を「閲覧者」に設定

#### 5. 依存関係インストール
\`\`\`bash
npm install googleapis
\`\`\`

#### 6. 動作テスト
\`\`\`bash
node google-slides-api.js --sync
\`\`\`

### 🔧 トラブルシューティング:
- 403エラー → Slidesのアクセス権限を確認
- 404エラー → Slides IDを確認
- 認証エラー → credentials.jsonの内容を確認

### 📱 定期実行設定（オプション）:
\`\`\`bash
# crontabで毎日実行
0 9 * * * cd /path/to/project && node scripts/google-slides-api.js --sync
\`\`\`
  `);
}

/**
 * 同期状況の表示
 */
function showSyncStatus() {
  if (!fs.existsSync(GUIDELINES_FILE)) {
    console.log('❌ ガイドラインデータが見つかりません');
    return;
  }

  const data = JSON.parse(fs.readFileSync(GUIDELINES_FILE, 'utf8'));
  
  console.log(`
📊 Google Slides同期状況

🔗 Slides URL: https://docs.google.com/presentation/d/${SLIDES_ID}/edit
📅 最終同期: ${data.last_updated || '未同期'}
📄 スライド数: ${data.slides_content?.total_slides || '不明'}

### 📋 現在のガイドライン:
✅ 顧客共有OK: ${data.guidelines?.customer_sharing_ok?.length || 0}項目
❌ 顧客共有NG: ${data.guidelines?.customer_sharing_ng?.length || 0}項目  
🚨 エスカレーション: ${data.guidelines?.escalation_required?.length || 0}項目

### 📈 同期履歴（最新3件）:
${(data.update_history || []).slice(-3).map(entry => 
  `${entry.date.split('T')[0]} - ${entry.action} (${entry.user})`
).join('\n')}

### 🔄 次回同期:
\`\`\`bash
node google-slides-api.js --sync
\`\`\`
  `);
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--setup')) {
    showSetupGuide();
    return;
  }

  if (args.includes('--status')) {
    showSyncStatus();
    return;
  }

  if (args.includes('--sync')) {
    console.log('🔄 Google Slides API同期を開始...');
    
    // 1. 認証
    const auth = await authorize();
    if (!auth) return;

    // 2. Slides内容取得
    const slidesContent = await getSlidesContent(auth);
    if (!slidesContent) return;

    // 3. ガイドライン抽出
    console.log('📋 ガイドライン情報を抽出中...');
    const parsedGuidelines = parseLeaseAccountingGuidelines(slidesContent);

    // 4. データ更新
    const updatedData = updateGuidelinesData(slidesContent, parsedGuidelines);
    saveGuidelines(updatedData);

    // 5. 結果表示
    console.log('\n🎉 同期完了！');
    console.log(`📊 抽出項目数:`);
    console.log(`  ✅ 顧客共有OK: ${parsedGuidelines.customer_sharing_ok.length}項目`);
    console.log(`  ❌ 顧客共有NG: ${parsedGuidelines.customer_sharing_ng.length}項目`);
    console.log(`  🚨 エスカレーション: ${parsedGuidelines.escalation_required.length}項目`);
    console.log(`  📅 スケジュール情報: ${parsedGuidelines.schedule_info.length}項目`);
    console.log(`  🔧 機能情報: ${parsedGuidelines.feature_info.length}項目`);

    return;
  }

  // デフォルト: 使用方法表示
  console.log(`
🔄 Google Slides API連携ツール

使用方法:
  node google-slides-api.js [オプション]

オプション:
  --setup    セットアップガイドを表示
  --sync     Google Slidesから最新情報を同期
  --status   現在の同期状況を表示

例:
  node google-slides-api.js --setup
  node google-slides-api.js --sync
  node google-slides-api.js --status

📋 新リース会計Slides:
https://docs.google.com/presentation/d/${SLIDES_ID}/edit
  `);
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 予期しないエラー:', error);
    process.exit(1);
  });
}

module.exports = { 
  authorize,
  getSlidesContent,
  parseLeaseAccountingGuidelines,
  updateGuidelinesData
};
