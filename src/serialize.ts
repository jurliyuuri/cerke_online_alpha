import {
    AbsoluteCoord,
    Ciurl,
    Color,
    NormalMove,
    Profession,
} from "cerke_online_api";

export function serializeAbsoluteCoord(coord: AbsoluteCoord) {
    return `${coord[1]}${coord[0]}`;
}

export function serializeCiurlCount(ciurl_count: number) {
    return ["無", "一", "二", "三", "四", "五"][ciurl_count]
}

export function serializeCiurl(ciurl: Ciurl) {
    return serializeCiurlCount(ciurl.filter(a => a).length);
}

export function serializeColor(color: Color) {
    return color === Color.Huok2 ? "黒" : "赤";
}

export function serializeProf(prof: Profession) {
    return ["船", "兵", "弓", "車", "虎", "馬", "筆", "巫", "将", "王"][prof];
}




export function normalMessageToKiarArk(message: NormalMove, water_ciurl_count?: number): string {
    if (message.type === "NonTamMove") {
        if (message.data.type === "FromHand") {
            return `${serializeColor(message.data.color)}${serializeProf(message.data.prof)}${serializeAbsoluteCoord(message.data.dest)}`
        } else if (message.data.type === "SrcDst") {
            if (water_ciurl_count === undefined) {
                return `${serializeAbsoluteCoord(message.data.src)}片${serializeAbsoluteCoord(message.data.dest)}無撃裁`
            } else if (water_ciurl_count < 3) {
                // failed entry
                return `${serializeAbsoluteCoord(message.data.src)}片${serializeAbsoluteCoord(message.data.dest)}水${serializeCiurlCount(water_ciurl_count)}此無`
            } else {
                return `${serializeAbsoluteCoord(message.data.src)}片${serializeAbsoluteCoord(message.data.dest)}水${serializeCiurlCount(water_ciurl_count)}`
            }
        } else if (message.data.type === "SrcStepDstFinite") {
            if (water_ciurl_count === undefined) {
                return `${serializeAbsoluteCoord(message.data.src)}片${serializeAbsoluteCoord(message.data.step)}${serializeAbsoluteCoord(message.data.dest)}無撃裁`
            } else if (water_ciurl_count < 3) {
                return `${serializeAbsoluteCoord(message.data.src)}片${serializeAbsoluteCoord(message.data.step)}${serializeAbsoluteCoord(message.data.dest)}水${serializeCiurlCount(water_ciurl_count)}此無`
            } else {
                return `${serializeAbsoluteCoord(message.data.src)}片${serializeAbsoluteCoord(message.data.step)}${serializeAbsoluteCoord(message.data.dest)}水${serializeCiurlCount(water_ciurl_count)}`
            }
        } else {
            const _should_not_reach_here: never = message.data;
            throw new Error("should not reach here")
        }
    } else if (message.type === "TamMove") {
        if (message.stepStyle === "NoStep") {
            return `${serializeAbsoluteCoord(message.src)}皇[${serializeAbsoluteCoord(message.firstDest)}]${serializeAbsoluteCoord(message.secondDest)}`
        } else if (message.stepStyle === "StepsDuringFormer") {
            return `${serializeAbsoluteCoord(message.src)}皇${serializeAbsoluteCoord(message.step)}[${serializeAbsoluteCoord(message.firstDest)}]${serializeAbsoluteCoord(message.secondDest)}`
        } else if (message.stepStyle === "StepsDuringLatter") {
            return `${serializeAbsoluteCoord(message.src)}皇[${serializeAbsoluteCoord(message.firstDest)}]${serializeAbsoluteCoord(message.step)}${serializeAbsoluteCoord(message.secondDest)}`
        } else {
            const _should_not_reach_here: never = message.stepStyle;
            throw new Error("should not reach here")
        }
    } else {
        const _should_not_reach_here: never = message;
        throw new Error("should not reach here")
    }
}