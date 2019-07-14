var Twit = require('twit');
var config = require('./config');
var people = require('./people');
var webshot = require('webshot');
const initialPeople= Object.keys(people).length;
const initialOrder = people;

var leftPeople = initialPeople;


var T = new Twit(config);
var round=0;

const MIN_REBIRTH= 98;
const EXTRA_PER_KILL= 1.0;

startRound();

setInterval(startRound, 1000*10);




function startRound(){
	rollDices();
	const order = orderPeople();
	const tweet = fight(order);
	const html = createImage();
	const options = {
		siteType: "html",
		streamType: "png"
		};

	webshot(html, "test-image.png", options, (err) => {
			if (err)
				console.log(err);
			else{
				console.log("Image created");

				//TODO: Tweet test-image & tweet

				console.log(tweet);
				if(leftPeople == 1){
					const winner = getWinner();
					const finish = "ENHORABUENA @" + winner + getAka(winner) +" se ha alzado con la victoria jerezana.";
					console.log(finish);
					process.exit();
				}
			}
		});
	

	
	

}

function createImage(){
	const deadStyle= "background: rgb(237,154,9);background: linear-gradient(90deg, rgba(237,154,9,0.4) 0%, rgba(207,82,20,0.9) 7%, rgba(199,71,24,1) 30%, rgba(177,52,6,1) 50%, rgba(199,71,24,1) 70%, rgba(207,82,20,1) 93%, rgba(237,154,9,0.4) 100%); text-align:center; ";
	const damagedStyle= " background: rgb(243,244,166);background: linear-gradient(90deg, rgba(243,244,166,0.4) 0%, rgba(247,247,158,0.9) 7%, rgba(254,255,33,1) 30%, rgba(254,255,33,1) 50%, rgba(254,255,33,1) 70%, rgba(247,247,158,0.9) 93%, rgba(243,244,166,0.4) 100%);text-align:center; ";
	var html = "<ul style='list-style-type: none; width:10%; margin-left:0px; float:left;'>";
	var j = 0;

	for(var user in initialOrder){
		const lifes = getLifes(user);
		const style = lifes == 0 ? deadStyle : lifes == 1 ? damagedStyle : "";
		html +="<li style='font-family: Brush Script MT,cursive;  font-weight: 10; font-size:65%;"+ style+"'>"+user+" ["+ getKills(user) +"]</li>";
		
		if(j % 51 == 0 && j!=0){
			html += "</ul><ul style='list-style-type: none; width:10%; margin-left:0px; float:left;'>";
		}
		j++;
	}
	html += "</ul>";
	

	return html;
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

		if(isAlive(deffender) && getDice(deffender) == 0){
			const currentLifes =  getLifes(deffender)-1;
			setLifes(deffender, currentLifes);

			res = "@"+deffender+ getAka(deffender) + " se ha caído el solo y ha perdido una vida HAHAHAHHA a ver si espabilamos ;)";

			if(currentLifes == 1 ){
				res += ". Ahora te queda 1 única vida, ¡aprovéchala!";
			} else if (currentLifes > 1){
				res += ". Aún te quedan "+ currentLifes + " pero no deberías confiarte.";
			} else {
				res += " y encima ha muerto definitivamente xdd, necesitarás un milagro si quieres ganar.";
				leftPeople--;
			}

			break;


		}
		else if (!isAlive(attacker) && getDice(attacker)> MIN_REBIRTH){ //Revivimos al primero 
			setLifes(attacker,1);
			res= "¡INCREIBLE! @"+attacker+ getAka(attacker)+" ha vuelto de entre los muertos para vengarse.";
			leftPeople ++;
			break;

		} else if(!isAlive(attacker) && getDice(attacker)<= MIN_REBIRTH){ //Actualizamos el puntero del primero por muerto
			iterationAttack++;
			console.log(attacker +" esta muertisimo NEXT");
			continue;

		} else if(!isAlive(deffender)){ //Actualizamos el puntero del defensor por muerto
			iterationDeffend++;
			console.log(deffender +" esta muertisimo NEXT");
			continue;

		} else if(attacker != deffender){
			var attackerDice =  Math.floor(Math.random() * 100 + getKills(attacker) * EXTRA_PER_KILL);
			var deffenderDice =  Math.floor(Math.random() * 100 + getKills(deffender) * EXTRA_PER_KILL);
			console.log(attackerDice + "vs" + deffenderDice);

			if(attackerDice > deffenderDice){
				const currentLifes =  getLifes(deffender)-1;
				setLifes(deffender, currentLifes);
				setKills(attacker, getKills(attacker) + 1);
				res = "@" + attacker+ getAka(attacker) +  " ha ganado a @" + deffender + getAka(deffender);

				if(currentLifes == 1 ){
					res += ". Ahora le queda 1 única vida, ¡aprovéchala!";
				} else if (currentLifes > 1){
					res += ". Aún le quedan "+ currentLifes + " pero no debería confiarse.";
				}

				else {
				 res += " y ha muerto definitivamente :(, necesitarás un milagro si quieres ganar.";
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
	if(kills<100)
		people[name][4]= kills;
}