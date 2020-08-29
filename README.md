## オンラインのフロントエンド + Herokuバックエンド
[https://jurliyuuri.com/cerke_online_alpha/entrance.html](https://jurliyuuri.com/cerke_online_alpha/entrance.html) にデプロイされているものがある。

## ローカルのフロントエンド（MacかLinuxで） + ローカルのバックエンド
1. まず `npm install`
2. ローカルで[バックエンド](https://gitlab.com/jekto.vatimeliju/cerke_online_backend)を走らせる
3. `export API_ORIGIN=LOCAL` する
4. `npm start` する
5. `localhost:8000/entrance.html` にデプロイされているものがある。

## ローカルのフロントエンド + Herokuバックエンド

1. まず `npm install`
2. 次に `npm start`（WindowsだとここでコケるのでMacかLinux）
3. `localhost:8000/entrance.html` にデプロイされているものがある。

