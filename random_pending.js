(()=>{"use strict";var n={9451:(n,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.API_ORIGIN=void 0,e.API_ORIGIN="https://little-water-8645.fly.dev"}},e={};function t(o){var i=e[o];if(void 0!==i)return i.exports;var s=e[o]={exports:{}};return n[o](s,s.exports,t),s.exports}(()=>{const n=t(9451);let e;function o(){(async()=>{let n=await r((n=>n));for(e=n;"LetTheGameBegin"!==n.type;){await new Promise((n=>setTimeout(n,200*(2+Math.random())*.8093)));const t=await i(n.session_token,(n=>n));"Err"!==t.type?(n=t.ret,e=n):(n=await r((n=>n)),e=n)}var t,o,s;t=n.session_token,o=n.is_first_move_my_move,s=n.is_IA_down_for_me,sessionStorage.vs="someone",sessionStorage.session_token=t,sessionStorage.is_first_move_my_move=JSON.stringify(o),sessionStorage.is_IA_down_for_me=JSON.stringify(s),location.href="main.html"})()}async function i(e,t){return await s(location.href.includes("staging")?`${n.API_ORIGIN}/matching/random/poll/staging`:`${n.API_ORIGIN}/matching/random/poll`,{session_token:e},t)}async function s(n,e,t){const o=await fetch(n,{method:"POST",body:JSON.stringify(e),headers:{"Content-Type":"application/json"},keepalive:!0}).then((n=>n.json())).then(t).catch((n=>{console.error("Error:",n)}));if(console.log(o),!o)throw alert("network error!"),new Error("network error!");return o}async function r(e){return await s(location.href.includes("staging")?`${n.API_ORIGIN}/matching/random/entry/staging`:`${n.API_ORIGIN}/matching/random/entry`,{},e)}document.addEventListener("visibilitychange",(()=>{if("hidden"===document.visibilityState){if(void 0!==e){const t=e.session_token;e=void 0,(async()=>{console.log(`trying to cancel ${t}:`);const e=await async function(e,t){return await s(location.href.includes("staging")?`${n.API_ORIGIN}/matching/random/cancel/staging`:`${n.API_ORIGIN}/matching/random/cancel`,{session_token:e},(n=>n))}(t);console.log(`got result ${JSON.stringify(e)}`)})()}}else void 0===e&&o()})),o()})()})();