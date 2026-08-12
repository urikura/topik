# 🇰🇷 TOPIK I 1,671 韓単語マスター (Flashcard & Quiz Web App)

![TOPIK I Vocabulary Quiz & Flashcard App](https://img.shields.io/badge/TOPIK-1671_Words-indigo?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

`topik-1671_romaji.csv`（全1,671単語）に対応した、ブラウザで動作するリアルタイム音声発音付きの **TOPIK I 単語クイズ＆Flashcard学習Webアプリ** です。

---

## ✨ 主な機能

- 🔊 **リアルタイム音声再生 (Web Speech API)**
  - 韓国語ネイティブ発音（`ko-KR`）をブラウザ標準APIでリアルタイム再生。
  - 問題表示時の自動再生（ON/OFF切替）やボタンタップでの手動再生に対応。
- 🔀 **多様な出題モード & 問題数設定**
  - **日本語 ➔ 韓国語**: 日本語の意味から正解のハングルを選択。
  - **韓国語 ➔ 日本語**: ハングル・音声から正解の日本語の意味を選択。
  - **ミックスモード**: 2つのモードをランダム交互出題。
  - **出題数**: `10問` / `20問` / `50問` / `100問` / `全1,671問`。
- 🎯 **4肢選択式クイズエンジン & フィードバック**
  - 1,671単語のデータベースから動的にダミー選択肢を生成。
  - 正解判定、コンボ（🔥 連続正解）カウント、正解選択肢の強調、合成サウンドエフェクト（チャイム/エラー音）。
  - キーボード操作（`1`〜`4` キーで回答、`Enter` / `Space` で次へ進む）に対応。
- 🃏 **3Dカードめくり単語帳モード**
  - カードの表面（ハングル）と裏面（日本語＋読み方ローマ字）を立体的にめくって暗記学習。シャッフル機能付き。
- 🔍 **全1,671語のライブ辞書検索**
  - ハングル、日本語、読み方（ローマ字 `gage` など）でのリアルタイム検索・発音試聴。

---

## 🛠️ 技術スタック

- **フロントエンド**: HTML5, Vanilla CSS3 (Glassmorphism, Dynamic Grid/Flexbox), JavaScript (ES6+)
- **音声処理**: Web Speech API (`SpeechSynthesis`), Web Audio API (`AudioContext` 効果音)
- **データ**: `topik-1671_romaji.csv` (1,671 TOPIK I 単語)

---

## 🚀 ローカルでの実行方法

特別なビルドツールのインストールは不要です。ファイルをダウンロードして開くだけで動作します。

### 方法 1: ローカルサーバーで実行 (推奨)

```bash
# リポジトリのクローン
git clone https://github.com/YOUR_USERNAME/topik-quiz-app.git
cd topik-quiz-app

# 簡易Webサーバーの起動 (例: npx serve)
npx serve .

# または Python をお使いの場合
python3 -m http.server 8080
```

ブラウザで `http://localhost:8080` にアクセスしてください。

### 方法 2: ブラウザで直接開く

`index.html` ファイルをダブルクリックするか、お使いのブラウザにドラッグ＆ドロップしてください。

---

## 🌐 GitHub Pages への公開手順 (無料ホスティング)

このリポジトリは完全なフロントエンド静的Webアプリのため、**GitHub Pages** で簡単に無料公開できます。

1. GitHubでリポジトリを作成し、コードをプッシュします（下記のコマンドを参照）。
2. GitHubリポジトリの **Settings** ➔ **Pages** を開きます。
3. **Build and deployment** の Source で `Deploy from a branch` を選択します。
4. Branch を `main` / `/ (root)` に設定して **Save** をクリックします。
5. 数分後に `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/` でアプリが公開されます！

---

## 📂 ファイル構成

```text
.
├── index.html              # メインHTML（UIレイアウト）
├── styles.css              # ダークグラスモフィズムCSSスタイル
├── data.js                 # 1,671単語データセット
├── app.js                  # クイズエンジン・音声合成・UI制御ロジック
├── topik-1671_romaji.csv   # 元単語データCSV
├── topik-1671.pdf          # 参考PDF
├── .gitignore              # Git除外設定
└── README.md               # 本ドキュメント
```

---

## 📝 ライセンス

[MIT License](LICENSE)
