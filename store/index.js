export const state = () => ({
  page: "index",
  locales: ['ru', 'en','jp','br','ch'],
  locale: 'ru',
  coin_type: "",
  game: null,
  games: [],
  config: null,
  updates: 0,
  error: null,
  eth_transaction: false,
  user_address: "",
  seller_price: 0,
  seller_balance: 0,
  rate: 0,
  my_bets: [],// История моих ставок,
  game_notifications: [],
  currency: {},
  user: null,
  info: null,
  show_game_id: 0,
  trading_view: false,
  bets_usd_per_coin: {eth: 0, trx: 0, btc: 0, eos: 0},
  disconnect: false,
  show_welcome: true,
  show_auth: false,
  show_wallet: false,
  game_times: {now_time: "", end_time: "", start_time: "", left_time: "", closed: true},
  last_game: null,
  show_wallet_window: false,
  show_auth_window: false,
  stats: null,
  ref: '',
  partner: {},
  email: null,
  password: null,
  youtuber: null,
  dividends:null
});

export const getters = {
  trading_view: state => state.trading_view,
  page: state => state.page,
  locales: state => state.locales,
  locale: state => state.locale,
  game: state => state.game,
  games: state => state.games,
  config: state => state.config,
  updates: state => state.updates,
  coin_type: state => state.coin_type,
  error: state => state.error,
  eth_balance: state => state.eth_balance,
  btc_balance: state => state.btc_balance,
  eth_transaction: state => state.eth_transaction,
  user_address: state => state.user_address,
  seller_price: state => state.seller_price,
  seller_balance: state => state.seller_balance,
  my_bets: state => state.my_bets,
  rate: state => state.rate,
  game_notifications: state => state.game_notifications,
  user: state => state.user,
  info: state => state.info,
  currency: state => state.currency,
  show_game_id: state => state.show_game_id,
  bets_usd_per_coin: state => state.bets_usd_per_coin,
  disconnect: state => state.disconnect,
  show_welcome: state => state.show_welcome,
  show_auth: state => state.show_auth,
  show_wallet: state => state.show_wallet,
  game_times: state => state.game_times,
  last_game: state => state.last_game,
  show_wallet_window: state => state.show_wallet_window,
  show_auth_window: state => state.show_auth_window,
  stats: state => state.stats,
  ref: state => state.ref,
  partner: state => state.partner,
  email: state => state.email,
  password: state => state.password,
  youtuber: state => state.youtuber,
  dividends: state => state.dividends
};

/*if(window.ethereum)
    return ethereum.selectedAddress
return "Please install Metamask!";*/

export const mutations = {
  SET_LANG(state, locale) {
    if (state.locales.indexOf(locale) !== -1) {
      state.locale = locale
    }
  },

  DROP_NOTIFICATION(state, game_id) {
    state.game_notifications = state.game_notifications.filter(function (obj) {
      return obj.game_id !== game_id;
    });
  },

  set(state, data) {
    state[data.name] = data.value;
    state.updates++;
  },

  points(state, point) {
    if (state.game) state.game.points.push(point);
    state.currency = point;
    state.updates++;
  },

  games(state, games) {

    console.log("games", {games, state})
    if (state.user && games.length === 1) {
      for (let bet of games[0].bets) {
        if (bet.user1_id === state.user._id || bet.user2_id === state.user._id) {
          state.games = games.concat(state.games);
          break;
        }
      }
    }

    /*    state.games=games.concat(state.games);
        if(games.length===1){
          state.last_game =  games[0];
        }*/
    state.updates++;
  },

  bet(state, bet) {

    let arr = [];
    if (state.game.game_id === bet.game_id) arr = state.game.bets;
    if (state.game.game_id + 1 === bet.game_id) arr = state.game.next_bets;

    let is_new_bet = true;
    if (state.game) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i]._id + '' === bet._id + '') {
          arr.splice(i, 1, bet);
          // arr.unshift(bet);
          //arr[i]=bet;
          is_new_bet = false;
          break;
        }
      }
      if (is_new_bet) arr.unshift(bet);
    }
    state.updates++;
  },

  game(state, game) {

    state.game = game;
    for (let bet of game.bets) {
      state.bets_usd_per_coin[bet.rate] += bet.value_usd;
    }
    if (game.points) state.currency = game.points[game.points.length - 1];

  },

  shiftGames(state) {
    state.games.shift();
  },

  info(state, p) {
    state.info = p;

    try {
      if (p === "PAYMENT_RECEIVED") window.ym(61731352, 'reachGoal', 'payment_success');
      if (p === "VERIFY_CODE_SENDED_TO_EMAIL") window.ym(61731352, 'reachGoal', 'signup_success');
    } catch (err) {
      console.error("MakeBet", err);
    }

  },

};

export const actions = {

  GAMES_HISTORY(context, h) {
    context.commit("GAMES_HISTORY", h);
  },

  DROP_NOTIFICATION(context, game_id) {
    context.commit("DROP_NOTIFICATION", game_id);
  },

  shiftGames(context) {
    context.commit("shiftGames");
  },

  init(context) {

    let socket = window.$nuxt.$socket;

    socket.on('disconnect', function () {
      console.log("disconnect");
      context.commit("set", {name: "disconnect", value: true});

    });

    socket.connect();
    socket.on("user", (v) => {context.commit("set", {name: "user", value: v})});
    socket.on("config", (v) => {context.commit("set", {name: "config", value: v})});
    socket.on("stats", (v) => {context.commit("set", {name: "stats", value: v})});
    socket.on("dividends", (v) => {context.commit("set", {name: "dividends", value: v})});
    socket.on("info", (v) => {context.commit("info", v)});
    socket.on("points", (v) => {context.commit("points", v)});
    socket.on("games", (v) => {context.commit("games", v)});
    socket.on("game", (v) => {context.commit("game", v)});
    socket.on("bet", (v) => {context.commit("bet", v)});


    //console.log(window.localStorage.getItem("digitalppl"));

    if (window.localStorage && window.localStorage.getItem("digitalppl")) {
      let json = window.localStorage.getItem("digitalppl");
      let parsed_json = JSON.parse(json);
      let user = parsed_json.user;
      let email = parsed_json.email;
      let password = parsed_json.password;

      if (user && email && password) {
        socket.emit("login", {email, password})
      } else {
        socket.emit("login", {})
      }
    }else socket.emit("login", {})
  },

  /*  socketEmit(context,{name,params}){
      console.log("socketEmit",name,params);
      window.$nuxt.$socket.emit(name,params);
    },*/

  set(context, data) {
    context.commit("set", data);
  }
};




