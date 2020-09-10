const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var mongoosePaginate = require('mongoose-paginate');


const Coin = new Schema({
  type: {type: String, required: true, enum:["btc","eth","trx","alpha",'allwin','zlw']},
  address: {type: String, required: true},
  private_key: {type: String, required: false, default:null, toJSON: false},
  wallet: {type: String, required: false, default:null, toJSON: false},
  value: {type: Number, required: false, default: 0}
});

Coin.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.private_key;
  delete obj.wallet;
  return obj;
};


const DividendAllocation = new Schema({
  date: {type: Date, required: false, default: Date.now, index: -1},
  eth:{type:Number, required: false, default:0},
  trx:{type:Number, required: false, default:0},
  btc:{type:Number, required: false, default:0},
  alpha:{type:Number, required: false, default:0},
  allwin:{type:Number, required: false, default:0},
  zlw:{type:Number, required: false, default:0},
});


const Holder = new Schema({
  eth_address: {type: String, required: false, default: 0, index:true},
  eth:{type:Number, required: false, default:0},
  trx:{type:Number, required: false, default:0},
  btc:{type:Number, required: false, default:0},
  alpha:{type:Number, required: false, default:0},
  allwin:{type:Number, required: false, default:0},
  zlw:{type:Number, required: false, default:0},
  tokens:{type:Number, required:false, default:0, index:-1}
});



const Email = new Schema({
  address: {type: String, required: true},
  code: {type: String, required: true, toJSON: false},
  verified: {type: Boolean, required: false, default: false}
});

Email.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.code;
  return obj;
};


const PromoCode = new Schema({
  prefix:{type:String, required:true, maxlength:30, index:true},
  code:{type:String, required:true, maxlength:30},
  date:{type:Date, required:false, default:Date.now, index:true},
  values:{type:[{coin_type:{type:String, required:true},value:{type:Number, required:true}}], required:true},
  used:{type:Boolean, required:false, default:false, index:true},
  enabled:{type:Boolean, required:false, default:true, index:true}
});

const TournamentWinner = new Schema({
  user_id:{type: ObjectId, required:true},
  user_name:{type:String, required:true},
  pos:{type:Number, required:true},
  wins:{type:Number, required:true},
  prize_usd:{type:Number, required:false, default:0}
});

const Chat = new Schema({//new_chat_member
  date:{type:Date, required:false, default:Date.now, index:true},
  id:{type:Number, required:true},
  title:{type:String, required:false, default:'chat'},
  type:{type:String, required:false, default:'group'},
  enabled:{type:Boolean, required:false, default:true}
});

const Tournament = new Schema({
  id:{type:Number, required:false, default:0, index:-1},
  date:{type:Date, required:false, default:Date.now, index:-1},
  value_usd:{type:Number, required:true},
  top:{type:Number, required:true},
  closed:{type:Boolean, required:false, default:false, index:true},
  values:{type:[{coin_type:{type:String, required:true},value:{type:Number, required:true}}], required:true},
  winners:{type:[TournamentWinner], required:false}
});

const DemoUser = new Schema({
  name: {type: String, required: false, default:'demo-user-0', index:true},
  value_usd:{type:Number, required:true},
  fp:{type:String, required:true},
  date: {type: Date, required: false, default: Date.now, index:-1},
  role:{type:String, required:false, default:"user", enum:["user","bank","bot","bot_bitch"], index:true, toJSON:false},
  bets_num:{type:Number, required:false, default:0},
  bets_sum:{type:Number, required:false, default:0},
  winbets_num:{type:Number, required:false, default:0},
  winbets_sum:{type:Number, required:false, default:0, index:-1}
});

const Partner = new Schema({
  user_id:{type:ObjectId, required:true, unique: true},
  pid:{type:String, required:false},
  clickid:{type:String, required:false},
  web_id:{type:String, required:false}
});

const PartnerLog = new Schema({
  date: {type: Date, required: false, default: Date.now, index:-1},
  url:{type:String, required:false},
  response:{type:Object, required:false},
});

const User = new Schema({
  name: {type: String, required: false,default:'anonymous', index:true},
  date: {type: Date, required: false, default: Date.now, index:-1},
  email: {type: Email, required: true, index:true},
  password: {type: String, required: true, index:true},//, toJSON: false
  role:{type:String, required:false, default:"user", enum:["user","admin","bank","bot","bot_bitch","promo","tournament"], index:true, toJSON:false},
  wallet: {type: [Coin], required: false, default: []},
  bets_num:{type:Number, required:false, default:0},
  bets_sum:{type:Number, required:false, default:0},
  winbets_num:{type:Number, required:false, default:0},
  winbets_sum:{type:Number, required:false, default:0, index:-1},
  promo_used:{type:Boolean, required:false, default:false, index:true},
  chat_ban:{type:Boolean, required:false, default:false},
  ref:{
      fathers:{type:[ObjectId], required:false, default:[]},
      childs:{type:Number, required:false, default:0},
      childs_nums:{type:[Number], required:false, default:[0,0,0,0]},
      values:{type:[{type:{type:String},value:{type:Number}}]},
      wallet:{
        eth:{type:Number, required:false, default:0},
        trx:{type:Number, required:false, default:0},
        btc:{type:Number, required:false, default:0},
        alpha:{type:Number, required:false, default:0},
        allwin:{type:Number, required: false, default:0},
        zlw:{type:Number, required: false, default:0}
      },
      father_token_code:{type:String, required:false, default:"",maxlength:50},
      my_token_code:{type:String, required:false, default:"",maxlength:50}
  },
  package_id:{type:Number, required:false, index:true},
  main_admin:{type:Boolean, required:false, index:true}

});

const ChatMessage = new Schema({
  type:{type:String, enum:['text','bet','game_result'], required:true, index:true},
  user_id:{type:ObjectId, required:false, index:true},
  tg_chat_id:{type:Number, required:false},
  tg_user_id:{type:Number, required:false},
  user_name:{type:String, required:false},
  date: {type: Date, required: false, default: Date.now, index:-1},
  bet:{type:Array, required:false},
  text:{type:String, required:false},
  game_result:{type:String, required:false},
  chat_link:{type:String, required:false},
},{ capped: 10 * 1024 * 1024 });


const ZelwinPaymentOrder = new Schema({
  orderId:{type:Number, required:true, index:true},
  curOut:{type:String, required:true, index:true},
  secret:{type:String, required:true, index:true},
  userId:{type:ObjectId, required:true, index:true},
  date: {type: Date, required: false, default: Date.now, index:-1},
})


const toValue = new Schema({
  field:{type:String, required:false},
  name:{type:String, required:false},
  value:{type:String, required:false},
});

const ZelwinPaymentEvent = new Schema({
  orderUID:{type:Number, required:true, index:true},
  orderId:{type:String, required:true, index:true},
  newStatus:{type:String, required:true, index:true},
  inAmount:{type:String, required:true, index:false},
  xml_from:{type:String, required:true, index:false},
  xml_to:{type:String, required:true, index:false},
  outAmount:{type:String, required:true, index:false},
  outStatus:{type:String, required:false, index:false},
  timestamp:{type:Number, required:true, index:false},
  toValues:{type:[toValue], required:true, index:false},
  hash:{type:String, required:true, index:true}
});


const Bet = new Schema({
  game_id: {type: Number, required: true, index:true},
  demo:{type:Boolean, required:false, default:false, index:true},
  rate: {type: String, enum:["zlw/eth","zlw/trx","zlw/eos","zlw/btc","btc/eth","btc/trx","btc/eos","btc/zlw","eth/btc","eth/trx","eth/eos","eth/zlw","trx/btc","trx/eth","trx/eos","trx/zlw","eos/btc","eos/eth","eos/trx","eos/zlw"], required: true},
  user1_id: {type: ObjectId, required: true, index:true},
  user2_id: {type: ObjectId, required: false, index:true},
  user1_name: {type: String, required: true},
  user2_name: {type: String, required: false},
  coin1_percent:{type:Number, required:false},
  coin2_percent:{type:Number, required:false},

 // user1_coin: {type: String, enum:["btc","eth","trx"], required: true},
 // user2_coin: {type: String, enum:["btc","eth","trx"], required: false},
  user1_values:{type:[{coin_type:{type:String, required:true},value:{type:Number, required:true}}], required:true},
  user2_values:{type:[{coin_type:{type:String, required:true},value:{type:Number, required:true}}], required:false},

  win_user_id: {type: ObjectId, required: false, index:true},
  bot: {type: Boolean, required: false, default:false, index:true},
  value_usd: {type: Number, required: true, index:true},
  date: {type: Date, required: false, default: Date.now, index:-1},
  status:{type:String, enum:["returned","wait_rival","wait_result","completed"], required:false, default:"returned", index:true}
});

const Transaction = new Schema({
  user_id: {type: ObjectId, required: true, index:true},
  type: {type: String, enum:["inc","out"], required: true, index:true},
  coin_type: {type: String, enum:["btc","eth","trx","alpha",'allwin','zlw'],  required: true},
  status: {type: String, enum:["requested","confirmed","canceled"],  required: true, index:true},
  response: {type: String, required: false, default:null},
  from: {type: String, required: false, default:""},
  to: {type: String, required: false, default:""},
  hash: {type: String, required: false},
  value: {type: Number, required: true, index:true},
  value_str: {type: Number, required: true},
  value_usd: {type: Number, required: true},
  date: {type: Date, required: false, default: Date.now, index:-1},
  is_holder:{type:Boolean, required:false, default:false, index:true}
});

const Operation = new Schema({
  date: {type: Date, required: false, default: Date.now, index:-1},
  user_id:{type: ObjectId, required: true, index:true},
  type:{type: String, enum:["plus","minus","plus_ref"], required: true, index:true},
  desc:{type: String, required:true, required: true, index:true},
  values:{type:[{coin_type:{type:String, required:true},value:{type:Number, required:true}}], required:true},
  total:{type:[{coin_type:{type:String, required:true},value:{type:Number, required:true}}], required:true},
  game_id: {type: Number, required: true, index:-1}
});

Operation.plugin(mongoosePaginate);

const Game = new Schema({
  game_id: {type: Number, required: true, unique: true},
  date: {type: Date, required: false, default: Date.now},
  bets: {type: [Bet], required: false, default: [], },
  value_usd: {type: Number, required: false, default: 0},
  points:{type:[Object], required:false, default:[]}
});



const IndacoinVerifyInfo = new Schema({
  indacoin_main_status: {type: String, required:false, index:false},
  indacoin_extra_status: {type: String, required:false, index:false},
  kyc_main_status: {type: String, required:false, index:false},
  kyc_processing_state: {type: String, required:false, index:false},
  kyc_review_reject_type: {type: String, required:false, index:false},
  kyc_docs_loaded: {type: Boolean, required:false, index:false},
  kyc_reject_labels: {type: String, required:false, index:false},
  bank_processing_state: {type: String, required:false, index:false},
  bank_reason: {type: String, required:false, index:false},
  card_last_4_digits: {type: String, required:false, index:false},
});


const IndacoinEvent = new Schema({
  userId: {type: String, required:false, index:true},
  transactionId: {type: Number, required:false, index:true},
  requestId: {type: Number, required:false, index:true},
  status: {type: String, required:false, index:true},
  extraStatus: {type: String, required:false, index:false},
  createdAt:  {type: Date, required:false, index:false},
  verify_info: {type: IndacoinVerifyInfo, required:false},
  confirmedAt: {type: Date, required:false, index:false},
  finishedAt: {type: Date, required:false, index:false},
  blockchainHash:  {type: String, required:false, index:false},
  link:  {type: String, required:false, index:false},
  curIn:  {type: String, required:false, index:false},
  curOut:  {type: String, required:false, index:false},
  altCurrencyName:  {type: String, required:false, index:false},
  amountIn:{type: Number, required:false, index:false},
  amountOut: {type: Number, required:false, index:false},
  realAmountOut:{type: Number, required:false, index:false},
  targetAddress: {type: String, required:false, index:false},
  reason:  {type: String, required:false, index:false},
  extra_info:  {type: Object, required:false, index:false},
  couponCode:  {type: String, required:false, index:false},
  referral_fee: {type: Number, required:false, index:false},
  partnerName:  {type: String, required:false, index:false},
  in_convert_rate:  {type: Number, required:false, index:false},
  cashin_type:{type: Number, required:false, index:false},
});

module.exports = {User, ChatMessage, Partner, PartnerLog, Tournament, DemoUser, Email, Coin, Game, Bet, Transaction, Operation,PromoCode, DividendAllocation, Holder,Chat, IndacoinEvent, ZelwinPaymentOrder,ZelwinPaymentEvent};