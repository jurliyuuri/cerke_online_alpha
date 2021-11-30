# cerke_online

## これはなに
架空世界ファイクレオネの遊戯「机戦/cerke/パイグ将棋/cet2kaik」のオンライン対戦を可能にする、（2021年10月現在）唯一のアプリケーション。bot対戦もできる。

### 机戦とは？
ファイクレオネという世界で遊ばれている（という設定の）ゲーム。
* [かなり丁寧かつ包括的にルールを記述した小冊子](https://cet2kaik.booth.pm/items/3469598)
* [日本机戦連盟公式サイト](https://sites.google.com/view/cet2kaik/トップページ)（日本語・英語・中国語・韓国語・フランス語・エスペラントに対応）
* [はじめての人のためのパイグ将棋](https://docs.google.com/document/d/17_cfVKLX5tGPYYRp5DUjnc8LEBOCs3uwX7t9QhO0nCY/edit#) （未完。日本語）
* [ルールが1ページに簡潔にまとまったPDF](https://raw.githubusercontent.com/sozysozbot/cerke/master/y1_huap1_summary.pdf) （英語・日本語・韓国語）
* [日本机戦連盟ニコニコ動画アカウント](https://www.nicovideo.jp/user/117068632)（日本語）
* [日本机戦連盟Discord](https://discord.gg/DtVQa5jEck)（このリポジトリに貢献したい方は是非ご参加をお願いできればと思います）
* [雑多なものが置いてあるGitHubリポジトリ](https://github.com/sozysozbot/cerke)

伝統ゲームならではのいかつさがアイデンティティというところがあるので、いかついものもいくつか用意している。
* [向こうの言語①での公式ルールブック](https://raw.githubusercontent.com/sozysozbot/cerke/master/AIL%20PANIT%20LETI%20CETKAIK%20LETI%20KULANTE.pdf)
* [向こうの言語②での短い広報動画に日本語音声をつけたやつ](https://twitter.com/cet2kaik/status/1421949189605314565)
* [向こうの言語②での長めの広報動画](https://drive.google.com/file/d/1t3HK-FauVMpvhYO1-LPVJAvDj-1KDYLj/view?usp=sharing)（未完）
* [向こうの言語①での公式ルールブックを、日本語と向こうの言語③で解説したやつ](https://docs.google.com/document/d/1yJLvWS_bQC3_EDToE5jUp0oDmNB_U6FRadsm0d97Cis/edit)

### ルール差
ただし、公式サイトにある「厳密官定」とは若干ルールが異なるので注意。これについては[Rust版実装](https://docs.rs/cetkaik_full_state_transition/0.2.10/src/cetkaik_full_state_transition/lib.rs.html#701-730)（2021年10月現在デプロイされていない）にまとまっている。具体的には、

* `step_tam_is_a_hand`: 厳密官定では「撃皇は-5点の減点役であるので、それのみで終季を達成できる」となるが、cerke_online では顔の見えない対戦ということもあり、「撃皇は役ではなく、即時減点」という規定になっている
* `tam_itself_is_tam_hue`: 厳密官定では皇は周り8マスにのみ皇効を与えるが、cerke_online ではそれに加えて皇を踏んでいるときでも皇効がある。
* `moving_tam_immediately_after_tam_has_moved`: 相手が皇を動かした直後に自分も皇を動かすのは、厳密官定では-3点の減点役であり、役であるがゆえにそれのみで終季を達成できるが、cerke_online では相手が皇を動かした直後はそもそも皇を動かすことができない。
* `tam_mun_mok`: 「皇を動かしたが結局元の位置に戻った」という状況は厳密官定では【皇再来】に相当し、-3点の減点役であり、役であるがゆえにそれのみで終季を達成できるが、そもそもパスをする方法が他にもいくらでもある机戦においてこれに罰則および終季能力を与えるというのも変と考え、cerke_online ではこれを例外扱いせず、特になにも起こらないものとする。

また、これは厳密官定とは異ならないが、撃皇したあとに裁が悪くて失敗した場合でも、撃皇がなかったことにはならない、としている。（`failure_to_complete_the_move_means_exempt_from_kut2_tam2: false`）

## デプロイ方法

### オンラインのフロントエンド + Herokuバックエンド
[http://jurliyuuri.com/cerke_online_alpha/entrance.html](http://jurliyuuri.com/cerke_online_alpha/entrance.html) にデプロイされているものがある。

### ローカルのフロントエンド（MacかLinuxで） + ローカルのバックエンド
1. まず `npm install`
2. ローカルで[バックエンド](https://gitlab.com/jekto.vatimeliju/cerke_online_backend)を走らせる
3. `export API_ORIGIN=LOCAL` する
4. `npm start` する
5. `localhost:8000/entrance.html` にデプロイされているものがある。

### ローカルのフロントエンド + Herokuバックエンド
1. まず `npm install`
2. 次に `npm start`（WindowsだとここでコケるのでMacかLinux）
3. `localhost:8000/entrance.html` にデプロイされているものがある。


## ソースコード構成について
`ephemera/` 以下においてある。名前の通り、一時的ドキュメンテーションであり、リファクタリングによってガンガン古びていくことを想定したドキュメンテーションである。
* [2021-11-06-current-situation.md](https://github.com/jurliyuuri/cerke_online_alpha/blob/master/ephemera/2021-11-06-current-situation.md)
* [2021-11-13-current-situation-state-machine.md](https://github.com/jurliyuuri/cerke_online_alpha/blob/master/ephemera/2021-11-13-current-situation-state-machine.md)
