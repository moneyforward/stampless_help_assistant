/**
 * 現在の日時をYYYY-MM-DD+時間形式で返します
 * @returns {string} YYYY-MM-DD+時間形式の文字列
 */
function getCurrentDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}+${hours}${minutes}`;
}

// 関数を実行して結果をコンソールに出力
console.log(getCurrentDateTimeString());
