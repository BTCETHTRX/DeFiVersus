const gamesStart = 1568332800;
const Config = require("../utils/Config");
const GameDB = require("../db/Game");

var next_bets = [];

let current = null;

const Game = class {

  static async getGames(pageNumber, nPerPage){
    let list  = await GameDB.find({})
      .sort( { data: -1 })
      .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * nPerPage ) : 0 )
      .limit( nPerPage );
    list.forEach(game => {games.unshift(game)});
    //console.log("games",games.length);
  }

  static get current(){
    return current;
  }



  static create(fireDate){
    current=new Game(fireDate);
    current.bets = next_bets;
    next_bets=[];
  }


  constructor(fireDate = null) {
    if (fireDate === null) {
      fireDate = new Date();
      fireDate.setSeconds(0);
      fireDate.setMilliseconds(0);
      fireDate.setMinutes(Math.floor(fireDate.getMinutes() / 3) * 3);
    }

    let sessionTimeSec = Config.cached.public.game.sessionTimeSec;

    let sec = Math.floor(fireDate / 1000);
    this.start_time = fireDate;
    this.game_id = (sec - gamesStart) / sessionTimeSec + 1;
    this.points = [];
    this.bets=[];
  }

  toJSON() {
    return {
      start_time: this.start_time,
      end_time: this.end_time,
      game_id: this.game_id,
      value_usd: this.value_usd,
      bets: this.bets,
      next_bets:next_bets,
      points: this.points
    }
  }

  get next_bets(){
    return next_bets;
  }

  get end_time() {
    let sessionTimeSec = Config.cached.public.game.sessionTimeSec;
    return new Date(this.start_time.getTime() + sessionTimeSec * 1000);
  }

  get can_make_bet() {
    return this.end_time.getTime() - Config.cached.public.game.closeBetsTimeSec * 1000 > new Date().getTime();
  }

  get bet_left_seconds() {
    return   Math.floor(((this.end_time.getTime() - Config.cached.public.game.closeBetsTimeSec * 1000)-new Date().getTime())/1000);
  }


  NewBet(bet) {
   next_bets.push(bet);
   return true;
  }

  get value_usd(){
    let val = 0;
    for(let bet of this.bets) val+=bet.value_usd;
    return val;
  }

  findOpenedBet(rate,value_usd, user_id, isDemo){
    for(let bet of next_bets){
      if(bet.demo === isDemo && bet.rate===rate && bet.value_usd===value_usd && bet.user1_id+''!==user_id+'' && (!bet.user2_id || bet.bot)){
        return bet;
      }
    }
    return null;
  }


  NewPoint(point) {
    this.points.push(point);
  }



  get close_percents(){
    const first = this.points[0];
    const last = this.points[this.points.length-1];
    const arr = [];
    arr["eth"] = (Number(last.eth)/Number(first.eth)*100-100);
    arr["btc"] = (Number(last.btc)/Number(first.btc)*100-100);
    arr["eos"] = (Number(last.eos)/Number(first.eos)*100-100);
    arr["trx"] = (Number(last.trx)/Number(first.trx)*100-100);
    arr["zlw"] = (Number(last.zlw)/Number(first.zlw)*100-100);

    return arr;
  }

  /**Закрываем игру, подведя итоги - возвращаем список ставок - победителей*/
  async CloseGame(fireDate) {
    const returns_list = [];//Список кому нужно вернуть деньги или наградить {is_return:false, user_id:null, value_usd:0, user_coin:""}


    for(let i=0; i<next_bets.length;i++){
      let bet = next_bets[i];
      if(!bet.user2_id) {
        returns_list.push({demo:bet.demo, is_return:true, user_id: bet.user1_id, value_usd:bet.value_usd, user_values:bet.user1_values});
        next_bets.splice(i,1);
        i--;
        bet.status="returned";
        bet.save();//without await
      }
    }



    /** Упс! Ставок небыло - закрываем только ставки сл. игры,  на которые не ответили */
    if (this.bets.length <1) return {returns_list};

    /**Создаем объект игры для сохранении в Базе*/
    let game_db = new GameDB({game_id: this.game_id});
    game_db.value_usd = this.value_usd;




    game_db.bets = [];





    for(let bet of this.bets){
      if(!bet.user2_id){
        bet.status="returned";
        console.log("returned",bet._id);
        returns_list.push({demo:bet.demo, is_return:true, user_id: bet.user1_id, value_usd:bet.value_usd, user_values:bet.user1_values});
      }else{
        bet.status="completed";
        let rate = bet.rate.split("/");
        bet.coin1_percent=this.close_percents[rate[0]];
        bet.coin2_percent=this.close_percents[rate[1]];

        if(bet.coin1_percent === bet.coin2_percent){ //Ничья - возвращаем обоим деньги
          console.info("НИЧЬЯ",rate[0],this.close_percents[rate[0]] ,rate[1],this.close_percents[rate[1]]);
            returns_list.push({demo:bet.demo, bot:false, is_return:true, user_id: bet.user1_id, value_usd:bet.value_usd, user_values:bet.user1_values});
            returns_list.push({demo:bet.demo, bot:bet.bot,  is_return:true, user_id: bet.user2_id, value_usd:bet.value_usd, user_values:bet.user2_values});
        }else if(bet.coin1_percent > bet.coin2_percent){ //Первая валюта выиграла
            bet.win_user_id=bet.user1_id;
            returns_list.push({demo:bet.demo, bot:false,  is_return:true, user_id: bet.user1_id, value_usd:bet.value_usd, user_values:bet.user1_values}); //Возвращаем первому игроку его ставку
            returns_list.push({demo:bet.demo, bot:false,  is_return:false, user_id: bet.user1_id, looser_id:bet.user2_id, value_usd:bet.value_usd, user_values:bet.user2_values}); //Награждаем первого игрока суммой противника - комиссия
        }else { //Вторая валюта выиграла
          bet.win_user_id=bet.user2_id;
          returns_list.push({demo:bet.demo, bot:bet.bot,  is_return:true,user_id: bet.user2_id, value_usd:bet.value_usd, user_values:bet.user2_values}); //Возвращаем  второму его ставку
          returns_list.push({demo:bet.demo, bot:bet.bot,  is_return:false,user_id: bet.user2_id, looser_id:bet.user1_id, value_usd:bet.value_usd, user_values:bet.user1_values}); //Награждаем второго игрока суммой противника - комиссия
        }
      }

      //console.log("BET SAVE",bet);

      /*await*/ bet.save();
      game_db.bets.push(bet); // Обновляем список ставок в объекте игры
    }

    game_db.points = []; //Заполняем график в сжатом виде (10 точек)
    if(this.points.length>0) {
      let max_points = Math.min(10, this.points.length);
      let part = this.points.length / 100 * max_points;
      for (let i = 0; i < max_points; i++) {
        let a = this.points[Math.floor(part * i)];
        game_db.points.push(a);
      }

      const last = this.points[this.points.length-1];
      game_db.points[game_db.points.length - 1] = last;
    }

    game_db.save();
    return {game_db,returns_list};
  }

};


module.exports =Game;
current = new Game();


