type Digit =
  | "num00"
  | "num01"
  | "num02"
  | "num03"
  | "num04"
  | "num05"
  | "num06"
  | "num07"
  | "num08"
  | "num09"
  | "num10"
  | "neg"
  | "num100";

export type DigitLinzklar =
  | "無"
  | "一"
  | "二"
  | "三"
  | "四"
  | "五"
  | "六"
  | "七"
  | "八"
  | "九"
  | "十"
  | "下"
  | "百";

export function toDigitsLinzklar(num: number): DigitLinzklar[] {
  function toLinzklar(a: Digit): DigitLinzklar {
    const obj: { [key in Digit]: DigitLinzklar } = {
      neg: "下",
      num00: "無",
      num01: "一",
      num02: "二",
      num03: "三",
      num04: "四",
      num05: "五",
      num06: "六",
      num07: "七",
      num08: "八",
      num09: "九",
      num10: "十",
      num100: "百",
    };
    return obj[a];
  }
  return toDigits(num).map(toLinzklar);
}

function toDigits(num: number): Digit[] {
  if (num % 1 !== 0) {
    throw new Error("non-integer");
  } else if (num >= 200) {
    const lastHundredArr: Digit[] =
      num % 100 === 0 ? [] : toDigitsSub(num % 100);
    return [...toDigitsSub(Math.floor(num / 100)), "num100", ...lastHundredArr];
  } else if (num >= 100) {
    const lastHundredArr: Digit[] = num % 100 === 0 ? [] : toDigits(num % 100);
    return ["num100", ...lastHundredArr];
  } else if (num < 0) {
    return ["neg", ...toDigits(-num)];
  } else if (num == 0) {
    return ["num00"];
  }

  const lastDigitArr: Digit[] =
    num % 10 === 0 ? [] : [`num0${num % 10}` as Digit];
  if (num >= 20) {
    return [`num0${Math.floor(num / 10)}` as Digit, "num10", ...lastDigitArr];
  } else if (num >= 10) {
    return ["num10", ...lastDigitArr];
  } else {
    return lastDigitArr;
  }
}

// -6848 should be 下六八百四八, not 下六十八百四十八. This function thus converts 68 to 六八, not 六十八.
function toDigitsSub(num: number): Digit[] {
  if (num % 1 !== 0) {
    throw new Error("non-integer");
  } else if (num >= 100) {
    throw new Error("100 or more detected in toDigitsSub");
  } else if (num <= 0) {
    throw new Error("0 or less detected in toDigitsSub");
  }

  if (num % 10 === 0) {
    if (num >= 20) {
      return [`num0${Math.floor(num / 10)}` as Digit, "num10"];
    } else if (num == 10) {
      return ["num10"];
    } else {
      throw new Error("cannot happen");
    }
  } else {
    const lastDigit: Digit = `num0${num % 10}` as Digit;
    if (num >= 20) {
      return [`num0${Math.floor(num / 10)}` as Digit, lastDigit];
    } else if (num >= 10) {
      return ["num10", lastDigit];
    } else {
      return [lastDigit];
    }
  }
}
