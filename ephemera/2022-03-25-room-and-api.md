# 2022年3月25日現在の、部屋を割り当てるまでの処理とAPI

フレンド対戦を最低限でも実装していくに至って、部屋を割り当てるまでの処理とそのAPI、特に、何が秘匿情報でなにがそうでないか、とかをしっかり覚えていないことに気がついたので、まとめ上げていく。

## まずは入り口

まず、entrance.html からリンクをクリックすることで、ランダムマッチなら pending_random.html へ、対 CPU 戦なら pending_vs_cpu.html へと飛ばされる。飛ばされた先のページから、実際の処理が始まる。フレンド対戦の場合は、飛んだ先のページで「部屋を立てる」または「部屋に参加する」を選ばせて、といった感じになるのだろう。

## 対 CPU 戦

対 CPU 戦が一番簡単なので、先に解説する。なぜ一番簡単かと言えば、バックエンドが生きている限り bot は直ちに遅滞なく提供できるからである。したがって、マッチングは常に成功すると仮定してよいわけだ。

`vs_cpu_pending.ts` の `apply_for_vs_cpu_game()` が呼ばれ、`/matching/vs_cpu/entry` へと空オブジェクトが POST されると、

```ts
export declare type WhoGoesFirst = {
    process: [Ciurl, Ciurl][];
    result: boolean;
};

export declare type RetVsCpuEntry = {
    type: "LetTheGameBegin";
    access_token: string;
    is_first_move_my_move: WhoGoesFirst;
    is_IA_down_for_me: boolean;
};
```

として定義される `RetVsCpuEntry` が返ってくる。つまり、

* アクセストークン
* 最初の先手後手を決める投げ棒列
* どちらの色の王を持っているか

がやってくる。ということで、そいつらを使ってこうする。

```ts
sessionStorage.access_token = access_token;
sessionStorage.vs = "cpu";
sessionStorage.is_first_move_my_move = JSON.stringify(is_first_move_my_move);
sessionStorage.is_IA_down_for_me = JSON.stringify(is_IA_down_for_me);
location.href = "main.html";
```

つまり、`sessionStorage` にこれらの情報、および「CPU対戦です」という情報だけを入れて、`main.html` に遷移することで試合が開始する。

## ランダムマッチ

`random_pending.ts` の `apply_for_random_game()` が呼ばれ、`/matching/random/entry` に空オブジェクトが POST されると、

```ts
export declare type RetRandomEntry = {
    type: "InWaitingList";
    access_token: string;
} | {
    type: "LetTheGameBegin";
    access_token: string;
    is_first_move_my_move: WhoGoesFirst;
    is_IA_down_for_me: boolean;
};
```

が返ってくる。 `LetTheGameBegin` の方が返ってきたら、そのまま先ほどと同様に適切な値を `sessionStorage` に入れてページ遷移するだけである。一方で、`InWaitingList` の方が返ってきたら、定期的に `/matching/random/poll` に `access_token` を投げる。すると

```ts
export declare type RetRandomPoll = {
    type: "Err";
    why_illegal: string;
} | {
    type: "Ok";
    ret: RetRandomEntry;
};
```

が返ってくる。アクセストークンが壊れてたら再エントリーして新規アクセストークンを発行してもらい、さもなくばさっきと同様に `RetRandomEntry` が返ってくる。

## 部屋 ID の役割について

ということで、ここまでのことからすると、部屋 ID というのは現状ではバックエンドしか知らず、フロントエンドには部屋 ID の情報が伝わっていないと言える。

さて、では、部屋 ID がプレイヤーだったり全世界だったりに漏れるとマズいのだろうか？

その答えは「否」である。アクセストークンが漏れると他者が正当なプレイヤーになりすますことができてしまうが、部屋 ID は漏れても別に構わない。ということで、普通に部屋 ID を対戦参加用 URL として使える。

しかしここでさらにもう一ステップ足して、部屋 ID が漏れて構わないものであることを利用することで、これを「観戦用 URL」として使う道ができる。

「対戦の参加には【部屋 ID】と【部屋の鍵】が必要で、その両方を含んだやつが【対戦参加用 URL】」、としてやればよい。

## フレンド対戦をどう実装していくべきか

提供すべき API は四つ。

部屋作成者側が呼びうるのが
* `/matching/friend/make_room`
* `/matching/friend/poll`
* `/matching/friend/delete_room`

の三つであり、部屋参加側が呼びうるのが
* `/matching/friend/join_room`

である。ちなみに観戦機能は 3 月末までに実装できる気がしないので、観戦用の API は先送り。ところで、観戦用 API の動詞を `watch` にするか `spectate` にするか迷うな。 watch するのは試合であって room ではない気がする。 spectate は自動詞で使う方が普通な気がする。んー、observe もなんか違う気がする。peek はアリかもしれん。まあとりあえず先送り。

### `join_room`

部屋 ID と 部屋の鍵を POST する必要がある。

戻り値は、
* 与えられた【部屋 ID】と【部屋の鍵】は無効（壊れているか、部屋がすでに delete されている）
* 与えられた【部屋 ID】と【部屋の鍵】は有効なので、前述の`LetTheGameBegin` を返す

の二通りがあるので、
```ts
export declare type RetFriendJoinRoom = {
    type: "Err";
    why_illegal: string;
} | {
    type: "Ok";
    ret: {
        type: "LetTheGameBegin";
        access_token: string;
        is_first_move_my_move: WhoGoesFirst;
        is_IA_down_for_me: boolean;
    };
};
```

とすればよかろう。

### `make_room`

空オブジェクトを POST 。戻り値については、クライアントサイドで「対戦参加用 URL」【与戦】と「観戦用 URL」【与目】を生成する必要があるので、

```ts
export declare type RetFriendMakeRoom = {
    type: "RoomMade";
    access_token: string;
	room_id: string;
	room_key: string;
}
```

としてやればよい。

### `poll`

アクセストークンを POST。対戦相手が部屋に来たかどうかを確認し、来ていれば `LetTheGameBegin`、さもなくば `StillAloneInTheRoom` を返せばよい。

```ts
export declare type RetFriendPoll = {
    type: "Err";
    why_illegal: string;
} | {
    type: "Ok";
    ret: {
        type: "StillAloneInTheRoom";
    } | {
        type: "LetTheGameBegin";
        is_first_move_my_move: WhoGoesFirst;
        is_IA_down_for_me: boolean;
    };
};
```

### `delete_room`
アクセストークンを POST。すると部屋が無効化される。

```ts
export declare type RetFriendPoll = {
    type: "Err";
    why_illegal: string;
} | {
    type: "Ok";
    ret: "RoomIsRevoked";
};
```


## ところで
hsjoihs「ところで、アクセストークンとか `access_token` とか呼んでるこれ、意味論的に考えて『セッショントークン』では？？？」

[spinachpasta](https://github.com/spinachpasta/)「はい、そうです。」
