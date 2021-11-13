# 2021年11月13日現在のステートマシン構成

[前回（2021年11月6日）の説明](https://github.com/jurliyuuri/cerke_online_alpha/blob/master/2021-11-06-current-situation.md) で一つ飛ばしたところがある。

> 手を入力するまでの多段階的な UI を実現するために、生 DOM をいじって、生のイベントハンドラ付き画像を配置して、それがクリックされると遷移する巨大爆発ステートマシンを実現する。今はこれの解説はしない。

という箇所である。ということで、今回はこれを解きほぐして説明する地獄の作業をやっていこうと思う。

## 机戦というゲームの状態遷移図
これは [Rust 版](https://docs.rs/cetkaik_full_state_transition/0.2.11/cetkaik_full_state_transition/index.html)において正しく実装されているので、まずはそちらから解説図を拝借してやっていく。

![](https://cdn.discordapp.com/attachments/718706286757150790/908928056419303424/unknown.png)

### 手の送信が抱える困難性

ここで「A」と出ているやつは「片方の番であり、どの手を指すのかを教えなければならない」という状態である。ここからは二通りの遷移があり、一つはNormalMove（踏越え判定のない動き）、もう一つは InfAfterStep + AfterHalfAcceptance である。

後者の本質的な困難性として、以下の三段階を踏むことが必然的に要求されるというのがある。

1. InfAfterStep をサーバーに向かって送信
2. サーバーが乱数（踏越え判定）をクライアントに返す
3. その判定結果を見て、ユーザーが AfterHalfAcceptance をサーバーにもう一回送信

### 入水判定が抱える困難性

さて、この二通りの遷移のどちらかを経た後の状態は、Rust 版実装で「HandNotResolvedの確率分布」と書かれているやつである。場合によっては、これに対してサーバーが乱数（入水判定）をすることで、その手が成功したかどうかが決まり、**失敗したら状態がロールバックする（けれども、【撃皇】による減点はロールバックされない）。** そうしてできた結果が、Rust 版で HandNotResolved と書いてあるやつである。

### 役判定が抱える困難性と、【撃皇】を役としていないことによる異常終了の可能性

HandNotResolved に対して、新たな駒が取得されているかどうかを確認し、分岐が走る。役がないなら **相手番の** A に戻って、**相手のターンが開始する** だけである。役があるなら、プレイヤーは【再行】(ty mok1)「シーズン続行」するか、それとも【終季】(ta xot1)「シーズン終了」するかを選ばねばならない。【再行】したなら

## フロントエンドでの状態爆発
さて、以上の話というのは、あくまで机戦というゲームが本質的に抱え込んでいる状態遷移だった。ところで、これをフロントエンドに持ってくると、机戦というゲームそのものが本質的に内包するこれらの状態遷移だけでなく、「自分の番と相手の番というのは挙動が異なる」という事実に直面する必要がある。

* 自分の番においては UI を用いて指す手を指定するための多段階的な状態遷移が必要である。
* 相手の番というのは、ポーリングしてなにが起きたかを調べ、その結果をレンダリングする必要がある。

このうち前者**とか**を取り扱うのが `src/main.ts` であり、後者**とか**を扱うのが `src/opponent_move.ts` **だと思うよ、きっと**。

で、この「自分の番？それとも相手の番？」は `game_state.ts` によって保持されていて、`GAME_STATE.is_my_turn` をセットすることで手番が移る。セッタの中では、アイコンの opacity を変えて手番を表したりしつつ、

* 相手の番になったときには:
    * **protective_cover_over_field_while_waiting_for_opponent という透明な膜を上に被せることで、DOMに対してインタラクションを起こせないようにしている**。えぇぇ！？
    * `sendMainPollAndDoEverythingThatFollows` を 0.5 stususn（時間の単位。1 stususn はおよそ 0.8093 秒）おきに飛ばす

* 自分の番になったときには:
    * **透明膜をなくすことで、DOMインタラクションを可能にする**

という実装にしている。

## 相手の番

とりあえず相手の番の方を先に書くか。今やったリファクタリングによってだいぶ見やすくなった。`src/opponent_move.ts` からは `forbidMainPolling,  allowMainPolling, sendMainPollAndDoEverythingThatFollows` の3つしか export されていない。やったぁ。全てが巨大なモジュール（本文1000行ぐらい）に閉じ込められている。

* `sendMainPollAndDoEverythingThatFollows` 
    * 名前の通り全てを支配する神メソッドである。
    * 今まで `sendMainPoll` という名前にしていたが、実態に合わせて改名した。
    * `MAIN_POLLING_ALLOWED`（クロージャに隠蔽された変数）フラグが立っているなら、相手の手が返ってくるまで自身を `setTimeout` して呼び出し続ける。

* `forbidMainPolling`
    *  `MAIN_POLLING_ALLOWED` フラグを折る。

* `allowMainPolling`
    *  `MAIN_POLLING_ALLOWED` フラグを立てるが、`sendMainPollAndDoEverythingThatFollows` 自体は呼び出さない。

さて、神の正体を暴きにいきましょう。相手から手が返ってこなかった場合は前述の通り自身を `setTimeout`。相手の指した手がレスポンスとして返ってきてた場合は、

1. メッセージ（bot対戦だと来る）を表示する
2. sound/thud.ogg を流す
3. 相手が何をしたのかに基づいて、適切な `animateOpponent***` という関数を呼び出してノードを動かし、さらに棋譜も書く。
4. ただし、`InfAfterStep` が出てきたときは話が別。このときは `/infpoll` へのリクエストが発生して、それを処理する必要が出る。

で、さらに【撃皇】とか入水とかが発生する場合があって、その都度 `animateStepTamLogo` だったり `animateWaterEntryLogo` だったりといった `src/draw_erase_animate.ts` 内の関数が呼び出されるわけである。 あとは役が完成して `drawScoreDisplay` とかが呼び出される場合もあるか。いずれにせよ、相手が指しているときというのは自分側にあんまりすべきことがないので、まだ比較的楽である。

## 自分の番

**ソースコードを読むまでもなく、明らかな地獄**。しょうがないから読むけど。

……依存関係そもそもどうなってる？リファクタリングしたからちょっとはマシになったよね？えーっと

```
node_modules/.bin/depcruise.cmd --exclude "^node_modules" --output-type dot src/main.ts > 2021-11-13-dependencicies.dot
```

としたものを https://dreampuf.github.io/GraphvizOnline/ に貼って neato エンジンにすると……

![](https://raw.githubusercontent.com/jurliyuuri/cerke_online_alpha/master/2021-11-13-dependencies.png)

**うわぁ。**

…………グラフの強連結成分取ってみようか。

![](https://raw.githubusercontent.com/jurliyuuri/cerke_online_alpha/master/2021-11-13-strongly-connected-component.png)

えっ、強連結成分が7ノード…………破滅

よし、今日は4時間も格闘してたし、そろそろ切り上げるか。