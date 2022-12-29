# 2022年12月29日現在の、入水判定失敗メッセージの状況

『[「入水判定に失敗しました」ダイアログの燐字化](https://github.com/jurliyuuri/cerke_online_alpha/issues/460)』を解決していくにあたり、現状の実装を追っていく必要がある。

コードを `failedWaterEntry` で検索すると……

```
D:\cetkaik\cerke_online\src\dictionary.ts
  2,3:   failedWaterEntry: string;
  49,5:     failedWaterEntry: "入水判定に失敗しました。",

D:\cetkaik\cerke_online\src\main.ts
  541,70:     if (sessionStorage.lang !== "x-faikleone") { alert(DICTIONARY.ja.failedWaterEntry); }
  663,70:     if (sessionStorage.lang !== "x-faikleone") { alert(DICTIONARY.ja.failedWaterEntry); }

D:\cetkaik\cerke_online\src\opponent_move.ts
  562,74:         if (sessionStorage.lang !== "x-faikleone") { alert(DICTIONARY.ja.failedWaterEntry); }
  605,74:         if (sessionStorage.lang !== "x-faikleone") { alert(DICTIONARY.ja.failedWaterEntry); }
  616,72:       if (sessionStorage.lang !== "x-faikleone") { alert(DICTIONARY.ja.failedWaterEntry); }
  825,74:         if (sessionStorage.lang !== "x-faikleone") { alert(DICTIONARY.ja.failedWaterEntry); }
  875,74:         if (sessionStorage.lang !== "x-faikleone") { alert(DICTIONARY.ja.failedWaterEntry); }
  967,74:         if (sessionStorage.lang !== "x-faikleone") { alert(DICTIONARY.ja.failedWaterEntry); }
  1002,74:         if (sessionStorage.lang !== "x-faikleone") { alert(DICTIONARY.ja.failedWaterEntry); }
```

うわぁ 9 件もあるのか。

とりあえず、既存の

```
await animateWaterEntryLogo();
drawCiurlWithAudio(o.water_entry_ciurl, Side.Downward);
```

を流用し、【裁言勿入水】を表示して着水効果音を流せばよかろう。

あー、ただ、どっちかというと季節遷移メッセージ辺りの見た目で出したいんだよな（てかちょうどアスペクト比がほぼ一致しておる。厳密に合わせておくか）。ということで、そこら辺の処理を確認しに行く。

そういや季節遷移を示す日本語メッセージは x-faikleone がついていない場合は出すようにしてるんだったな。じゃあ現状の「入水判定に失敗しました。」のメッセージも消さないでおこう。

とりあえず画像の表示は組めたはず。あとは音声も入れなきゃな。まずはステージング環境にデプロイしよう。

デプロイした。日本語環境だとアラートが出て絶妙に UI がぐちゃぐちゃするが、ファイクレオネ版だとかなり自然な UI になるんだよな。うーんどうしようかね。

ああ、あと画像自体がちょっと下すぎてはみ出ているから直そう。直した。

まだはみ出る。もうちょい上に。あとアラートのタイミングを変える。オーディオも足すか。

オーディオが遅すぎる。それはそうで、最初の無音区間を削り忘れていた。削った。てか文字が出てからのディレイは要らんな。

むしろ「音が鳴る」→「それの説明が燐字で出る」→「それの翻訳が日本語で出る」の順であるべきだな。「光の方が音より早いので映像の方を先に出るべき」とはよく言うが、今回の場合は「音が先にあり、それの説明が文字で出る」が自然な順序なのだから。

よし、だいぶ自然になった。一方で、相手側の入水が失敗したときの順序がぐちゃぐちゃになってしまっている気がするな。具体的には、相手が踏越えをしたときに変なことになっていそう？なんかよくわからんな。console のデバッグ出力もちゃんと見て真面目に追いかけねば。`console.log("drawField opponent #", 14.5);` 周りか？とりあえず Μίττον に調査させるか。

![](https://cdn.discordapp.com/attachments/668122592720322570/1057933021984079912/IMG_1287.png)

あー。これも直さないとな。

…えっと、z-index の一覧を見なくては。

よくわかんないので 7000 にしておこう。こうやって z-index はどんどんインフレしていく。

![](https://cdn.discordapp.com/attachments/668122592720322570/1057944774751043668/z-index.png)

https://twitter.com/hsjoihs/status/1608385214656688131

たしかに。ここに z-index つけても意味ないのか。内側の img につけよう。
