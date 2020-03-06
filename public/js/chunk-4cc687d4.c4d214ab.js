(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-4cc687d4"],{4023:function(t,e,a){"use strict";var r=a("40e1"),n=a.n(r);n.a},"40e1":function(t,e,a){},f958:function(t,e,a){"use strict";a.r(e);var r=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"row"},[a("div",{staticClass:"col-lg-8 offset-lg-2 my-4"},[a("div",{staticClass:"card border-0"},[a("div",{staticClass:"card-body"},[a("div",{staticClass:"d-flex align-items-start"},[a("div",[a("div",[t._v("Wallet Balance: "),a("i",{staticClass:"clickable fa fa-sync-alt",attrs:{id:"refresh-wallet"},on:{click:t.refreshWallet}}),a("i",{directives:[{name:"show",rawName:"v-show",value:t.userXrpWalletCurrentAmount>1,expression:"userXrpWalletCurrentAmount > 1"}],staticClass:"ml-1 clickable fa fa-share",attrs:{id:"send-ripple-button","data-toggle":"modal","data-target":"#send-xrp-modal"}})]),a("div",{staticClass:"text-large"},[t._v(t._s(t.userXrpWalletCurrentAmount)+" XRP ≈ $"+t._s(t.currentAmountUsd)+" USD")]),a("b-tooltip",{attrs:{target:"refresh-wallet",placement:"rightbottom"}},[t._v("Is your wallet missing a credit or debit you expect to see? We have background workers running constantly to ensure the integrity and accuracy of all balances, but you can force an off-schedule automated review of your wallet balance by clicking here.")]),a("b-tooltip",{attrs:{target:"send-ripple-button",placement:"rightbottom"}},[t._v("If you want to send any amount in your wallet to another address, click here to designate the destination and amount to send.")])],1),a("div",{staticClass:"ml-auto text-right small"},[t._m(0),a("div",[t._v("1 XRP ≈ $"+t._s(t.xrpExchangePrice||"N/A")+" USD")]),a("div",{staticClass:"small"},[t._v("Updated "+t._s(t.exchangeUpdated))]),a("b-tooltip",{attrs:{target:"exchange-rate-info"}},[t._v("We use Coinbase's spot price as the exchange rate between fiat and cryptocurrencies. This price usually sits somewhere between the buy and sell price at any point in time on Coinbase.")])],1)])])]),a("div",{staticClass:"card mt-4"},[t._m(1),a("div",{staticClass:"card-body"},[a("div",{staticClass:"mb-2"},[t._v("Send Ripple (XRP) to this address & tag combo.")]),a("div",{staticClass:"alert alert-warning"},[t._v("NOTE: Make sure you include the tag when sending XRP to this address. If you send XRP without specifying the tag below we cannot fund your account.")]),a("div",[a("div",{staticClass:"text-center"},[a("div",{staticClass:"row"},[a("div",{staticClass:"col-lg-8 offset-lg-2"},[a("div",{staticClass:"form-group"},[a("label",[t._v("XRP Address")]),a("div",[a("code",{staticClass:"p-1"},[t._v(t._s(t.xrpAddress.mod2))])])]),a("div",{staticClass:"form-group"},[a("label",[t._v("XRP Tag")]),a("div",[a("code",{staticClass:"p-1"},[t._v(t._s(t.xrpAddress.mod1))])])])])])])])]),t._m(2),a("div",{staticClass:"card-body"},[t.privacyCard?a("div",{staticClass:"row small-gutters"},[a("div",{staticClass:"col-lg-6"},[a("div",{staticClass:"form-group"},[a("div",[a("strong",[t._v(t._s(t.privacyCard.friendly_name))])])]),a("div",{staticClass:"form-group"},[a("label",[t._v("Card #")]),a("div",{staticClass:"text-large"},[a("strong",[t._v(t._s(t.cardNumber))])])])]),a("div",{staticClass:"col-lg-6"},[a("div",{staticClass:"card"},[a("div",{staticClass:"card-body py-2"},[a("div",{staticClass:"row small-gutters"},[a("div",{staticClass:"col"},[a("div",{staticClass:"form-group m-0"},[a("label",[t._v("State")]),a("div",[a("strong",[t._v(t._s(t.privacyCard.state))])])])]),a("div",{staticClass:"col"},[a("div",{staticClass:"form-group m-0"},[a("label",[t._v("Spend Limit")]),a("div",[a("strong",[t._v("$"+t._s(t.privacyCardLimitUsd))])])])]),a("div",{staticClass:"col d-flex align-items-center justify-content-end"},["OPEN"!==t.privacyCard.state?a("div",[a("button",{staticClass:"btn btn-vsm btn-primary",attrs:{id:"lock-privacy-card"},on:{click:t.lockCard}},[t._v("Lock "),a("i",{staticClass:"fa fa-info-circle"})]),a("b-tooltip",{attrs:{target:"lock-privacy-card",placement:"right"}},[t._v("Locking your card temporarily adds funds to your card you can spend at your merchant of choice (up to a maximum of $"+t._s(t.maxTransaction)+"). We calculate the exchange rate of your cryptocurrency wallet at the time you lock the card to add funds to it, and the card is active for up to 10 minutes. After 10 minutes if you don't use your card, it will be paused again and you'll have to re-lock at the latest exchange rate.")])],1):t.changingCardActiveDuration?a("div",{staticClass:"small text-danger"},[a("strong",[t._v(t._s(t.changingCardActiveDuration.minutes()))]),t._v(" min, "),a("strong",[t._v(t._s(t.changingCardActiveDuration.seconds()))]),t._v(" sec remaining")]):t._e()])])])])]),a("div",{staticClass:"col-lg-4"},[a("div",{staticClass:"form-group"},[a("label",[t._v("Exp Month")]),a("div",{staticClass:"text-large"},[a("strong",[t._v(t._s(t.privacyCard.exp_month))])])])]),a("div",{staticClass:"col-lg-4"},[a("div",{staticClass:"form-group"},[a("label",[t._v("Exp Year")]),a("div",{staticClass:"text-large"},[a("strong",[t._v(t._s(t.privacyCard.exp_year))])])])]),a("div",{staticClass:"col-lg-4"},[a("div",{staticClass:"form-group"},[a("label",[t._v("CVV")]),a("div",{staticClass:"text-large"},[a("strong",[t._v(t._s(t.privacyCard.cvv))])])])])]):a("div",[a("div",{staticClass:"alert alert-warning mb-0"},[t._v("No active card available to use at a merchant. Once you fund your account we will automatically create a card for you to use at your merchant of choice.")])])])])]),t.userXrpWalletCurrentAmount>1?a("send-xrp-modal",{attrs:{id:"send-xrp-modal"}}):t._e()],1)},n=[function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("i",{staticClass:"fa fa-info-circle",attrs:{id:"exchange-rate-info"}}),t._v(" Exchange Rate")])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"card-header"},[a("h4",{staticClass:"m-0"},[t._v("1. Fund Your Account")])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"card-header border-top"},[a("h4",{staticClass:"m-0"},[t._v("2. Use Card Info at Merchant")])])}],i=a("a34a"),s=a.n(i),c=a("901e"),o=a.n(c),l=a("2f62"),u=a("f817"),d=a("25db"),v=a("f259");function p(t,e,a,r,n,i,s){try{var c=t[i](s),o=c.value}catch(l){return void a(l)}c.done?e(o):Promise.resolve(o).then(r,n)}function f(t){return function(){var e=this,a=arguments;return new Promise((function(r,n){var i=t.apply(e,a);function s(t){p(i,r,n,s,c,"next",t)}function c(t){p(i,r,n,s,c,"throw",t)}s(void 0)}))}}var m={lockBurnerCard:function(){return f(s.a.mark((function t(){var e;return s.a.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,Object(d["a"])("/api/1.0/privacy/card/update",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})});case 2:return e=t.sent,t.next=5,Object(v["a"])(e);case 5:return t.abrupt("return",t.sent);case 6:case"end":return t.stop()}}),t)})))()}};function g(t,e,a,r,n,i,s){try{var c=t[i](s),o=c.value}catch(l){return void a(l)}c.done?e(o):Promise.resolve(o).then(r,n)}function h(t){return function(){var e=this,a=arguments;return new Promise((function(r,n){var i=t.apply(e,a);function s(t){g(i,r,n,s,c,"next",t)}function c(t){g(i,r,n,s,c,"throw",t)}s(void 0)}))}}function y(t,e){var a=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),a.push.apply(a,r)}return a}function C(t){for(var e=1;e<arguments.length;e++){var a=null!=arguments[e]?arguments[e]:{};e%2?y(Object(a),!0).forEach((function(e){b(t,e,a[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(a)):y(Object(a)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(a,e))}))}return t}function b(t,e,a){return e in t?Object.defineProperty(t,e,{value:a,enumerable:!0,configurable:!0,writable:!0}):t[e]=a,t}var w={data:function(){return{spotPriceInterval:null,privacyActiveSecondsRemaining:null,changingCardActiveDuration:null,changingCardActiveInterval:null}},computed:C({},Object(l["b"])({privacyCard:function(t){return t.privacy.card},xrpAddress:function(t){return t.ripple.address},xrpExchangePrice:function(t){return t.exchangePrices.xrp},exchangeUpdated:function(t){return Object(u["a"])(t.exchangePricesLastUpdated).format("h:mm:ss a")},userXrpWallet:function(t){return t.wallets.xrp||{}},maxTransaction:function(t){return t.privacy.maxPerTransaction},privacyCardLimitUsd:function(t,e){return e.getPrivacyCardLimitUsd},currentAmountUsd:function(t){return new o.a(t.calculateAmountUsd("xrp",this.userXrpWallet.current_amount||0)).toFixed(2)},privacyActiveExpSeconds:function(t){return t.privacy.activeExpirationSeconds}}),{userXrpWalletCurrentAmount:function(){return new o.a(this.userXrpWallet.current_amount||0).toFixed(2)},cardNumber:function(){return((this.privacyCard.card_number||"").match(/\d{4}/g)||[]).join(" ")}}),watch:{privacyActiveExpSeconds:function(t){var e=this;!t||t<=0||(this.changingCardActiveInterval=this.changingCardActiveInterval||setInterval((function(){e.privacyActiveSecondsRemaining=e.privacyActiveSecondsRemaining?e.privacyActiveSecondsRemaining-1:t;var a=u["a"].duration(e.privacyActiveSecondsRemaining,"seconds");if(!e.privacyActiveSecondsRemaining||e.privacyActiveSecondsRemaining<=0)return e.changingCardActiveDuration=null,clearInterval(e.changingCardActiveInterval),e.changingCardActiveInterval=null;e.changingCardActiveDuration=a}),1e3))}},methods:{lockCard:function(){return h(s.a.mark((function t(){return s.a.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,m.lockBurnerCard();case 3:window.toastr.success("Successfully updated your card! Your spend limit is updated, please use your card within 10 minutes or you will have to relock it later."),t.next=9;break;case 6:t.prev=6,t.t0=t["catch"](0),window.toastr.error(t.t0.message);case 9:case"end":return t.stop()}}),t,null,[[0,6]])})))()},refreshWallet:function(){this.$socket.emit("refreshUserWallet","xrp"),window.toastr.success("Sit tight, we're ensuring your wallet balance is correct!")},init:function(){var t=this;return h(s.a.mark((function e(){return s.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:t.$socket.emit("getSpotPrice",{type:"XRP"}),t.$socket.emit("privacyGetActiveCard"),t.$socket.emit("rippleGetAddress"),t.$socket.emit("walletGetUserWallets"),t.$socket.emit("getMaximumSpendPerTransaction"),t.spotPriceInterval=t.spotPriceInterval||setInterval((function(){return t.$socket.emit("getSpotPrice",{type:"XRP"})}),1e4);case 6:case"end":return e.stop()}}),e)})))()}},created:function(){var t=this;return h(s.a.mark((function e(){return s.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t.$socket.on("refresh",h(s.a.mark((function e(){return s.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,t.init;case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))),e.next=3,t.init();case 3:case"end":return e.stop()}}),e)})))()},beforeDestroy:function(){clearInterval(this.spotPriceInterval)}},_=w,x=(a("4023"),a("2877")),k=Object(x["a"])(_,r,n,!1,null,"2b1c941e",null);e["default"]=k.exports}}]);
//# sourceMappingURL=chunk-4cc687d4.c4d214ab.js.map