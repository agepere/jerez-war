var Twit = require('twit');
var config = require('./config');
var people = require('./people');
const initialPeople= Object.keys(people).length;
var leftPeople = initialPeople;


var T = new Twit(config);
var round=0;

const MIN_REBIRTH= 98;

startRound();

setInterval(startRound, 1000*5);



function startRound(){
	rollDices();
	const order = orderPeople();
	var tweet = fight(order);
	console.log(tweet);

	if(leftPeople == 1){
		const winner = getWinner();
		const finish = "ENHORABUENA @" + winner + getAka(winner) +" se ha alzado con la victoria jerezana.";
		console.log(finish);
		process.exit();
	}
	

}

function rollDices(){
	for(var user in people)
		people[user][0] = Math.floor(Math.random() * 100);
}

function orderPeople(){
	var users = Object.keys(people);
	
	users.sort(function(first, second){
		return people[second][0] - people[first][0];
	});

	return users;
}

function play(iterationAttack, iterationDeffend){

	return !(iterationAttack >= initialPeople || iterationDeffend >= initialPeople);

}

function getWinner(){
	for(var user in people)
		if(getLifes(user) >0)
			return user;
}

function fight(order){
	const firstest = order[0];
	const latests = order[initialPeople - 1];
	var res = "";
	var iterationAttack = 0;
	var iterationDeffend = 0;
	round++;
	console.log("================ ROUND "+ round + " ================" );

	while(play(iterationAttack, iterationDeffend)){
		var attacker = order[iterationAttack];
		var deffender = order[initialPeople - 1 - iterationDeffend];
		
		console.log(attacker + " vs " + deffender);

		if (!isAlive(attacker) && getDice(attacker)> MIN_REBIRTH){ //Revivimos al primero 
			setLifes(attacker,1);
			res= "¡INCREIBLE! @"+attacker+ getAka(attacker)+" ha vuelto de entre los muertos para vengarse.";
			leftPeople ++;
			break;

		} else if(!isAlive(attacker) && getDice(attacker)< MIN_REBIRTH){ //Actualizamos el puntero del primero por muerto
			iterationAttack++;
			console.log(attacker +" esta muertisimo next");
			continue;

		} else if(!isAlive(deffender)){ //Actualizamos el puntero del defensor por muerto
			iterationDeffend++;
			console.log(deffender +" esta muertisimo next");
			continue;

		} else if(attacker != deffender){
			var attackerDice =  Math.floor(Math.random() * 100 + getKills(attacker) * 0.5);
			var deffenderDice =  Math.floor(Math.random() * 100 + getKills(deffender) * 0.5);
			console.log(attackerDice + "vs" + deffenderDice);

			if(attackerDice > deffenderDice){
				const currentLifes =  getLifes(deffender)-1;
				setLifes(deffender, currentLifes);
				setKills(attacker, getKills(attacker) + 1);
				res = "@" + attacker+ getAka(attacker) +  " ha ganado a @" + deffender + getAka(deffender);

				if(currentLifes == 1 ){
					res += ". Ahora le queda 1 única vida, ¡aprovechala!";
				} else if (currentLifes > 1){
					res += ". Aún le quedan "+ currentLifes + " pero no debería confiarse.";
				}

				else {
				 res += ". Ha muerto definitivamente :(, necesitarás un milagro si quieres ganar.";
				 leftPeople--;
				}

				break;
			}


			
		}
		iterationDeffend++;
		iterationAttack++;



}
	if(res == ""){
		res = "Guau! todos han empatado en esta ronda. Podemos destacar la batalla de @"+ attacker + getAka(attacker)+ " contra @" + deffender + getAka(deffender) + " habrá que esforzarse más en la próxima." ; 
	}

	return res+" Quedan "+ leftPeople +" jerezanos luchando por la victoria." ;

}



function getDice(name){
	return people[name][0];
}
function getLifes(name){
	return people[name][1];
}

function setLifes(name,life){
	people[name][1] = life;
}
function isAlive(name){
	return people[name][1] > 0;
}
function getAka(name){
	const list =people[name][3];
	const res = list[Math.floor(Math.random() * list.length )];

	return res ? " AKA "+ res : "" ;
}
function canRebirth(name){
	return people[name][2];
}
function getKills(name){
	return people[name][4];
}

function setKills(name, kills){
	 people[name][4]= kills;
}