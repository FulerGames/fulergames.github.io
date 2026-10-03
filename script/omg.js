var times = [];
times[4] = [30, 20, 15, 12, 10, 9, 8, 7, 6, 5];
times[5] = [40, 25, 20, 18, 15, 12, 10, 8, 7, 6];
times[6] = [50, 30, 25, 20, 18, 15, 12, 10, 9, 8];
times[7] = [60, 40, 30, 25, 20, 18, 16, 14, 12, 10];

var siren = new Audio('src/omg/panic.mp3');
var alarm = new Audio('src/omg/alert.mp3');
var end = new Audio('src/omg/explosion.mp3');

function clicker(button, type){
	document.querySelectorAll('.' + type).forEach(element => {
		element.classList.remove("selected");
	});
	button.classList.add("selected");
	
	setClock();
};

function getValue(type){
	var retorno = "";
	document.querySelectorAll('.' + type + '.selected').forEach(element => {
		if(type == "players"){retorno = element.id;}
		else{retorno = element.innerText;}
	});
	return parseInt(retorno);
};

function setBackground(){
	var fire_counter = 0;
	document.querySelectorAll('.life').forEach(element => {
		if(element.src.includes("fire")){fire_counter++;}
	});
	
	var color = (10 - fire_counter) * 17; // 170 = AA
	document.body.style.backgroundColor = "rgb(170, " + color + ", " + color + ")";
}

function toggleLife(life){
	if(Number.isInteger(life)){life = document.getElementById("life_" + life);}

	if(life.src.includes("life")){life.src = life.src.replace("life","fire");}
	else{life.src = life.src.replace("fire","life");}
	
	setBackground();
};

function timeRuns(timer){
	if(isMissionRunning()){
		if(timer[1] <= 0){
			// When 0 miliseconds, reduce seconds
			if((timer[0]-5) % 5 === 0 || timer[0] < 5){panic(timer[0]);}
			
			timer[0] -= 1;
			timer[1] = 99;
		}
		else{
			// Otherwise, reduce miliseconds
			if(timer[1] == 90){setBackground();}
			timer[1] -= 1;
		}
		
		// If still time, triggers again in 10 miliseconds
		if(timer[0] >= 0){
			setTimeout(timeRuns, 10, timer);
			updateClock(timer);
		}
		// Otherwise, end mission!
		else{
			timer = [0, 0];
			endMission();
		}
	}
	else{
		setClock();
	}
};

function setClock(){
	var timer = [times[getValue("players")][getValue("mission") - 1], 0];
	updateClock(timer);
	return timer;
};
setClock();

function updateClock(timer){
	var text = "00:";
	if(timer[0] < 10){text += "0";}
	text += timer[0] + ":";
	if(timer[1] < 10){text += "0";}
	text += timer[1];
	
	document.getElementById("timer").innerText = text;
};

function startMission(){
	toggleMission();
	timeRuns(setClock());
};

function isMissionRunning(){return !document.getElementById("start").innerText.includes("Começar");};
function toggleMission(){
	var starter = document.getElementById("start");
	if(starter.innerText.includes("Começar")){
		starter.innerText = "❌ ABORTAR ❌ ";
		enableButtons(false);
	}
	else{
		starter.innerText = "🚀 Começar Missão! 🚀";
		enableButtons(true);
		audioStop();
	}
	setBackground();
};

function enableButtons(mode){
	mode = !mode;
	document.querySelectorAll('.players').forEach(element => {element.disabled = mode;});
	document.querySelectorAll('.mission').forEach(element => {element.disabled = mode;});
};

function endMission(){
	toggleMission();
	
	var current_mission = getValue("mission");
	document.getElementById("mission_" + current_mission).classList.add('done')
	if(current_mission < 10){
		document.getElementById("mission_" + current_mission).classList.remove('selected');
		document.getElementById("mission_" + (current_mission + 1)).classList.add('selected');
	}
	
	setClock();
	if(localStorage.omg_audio != "off"){end.play();}
	
	//alert("Acabou a missão!");
	let fail = prompt("Acabou a missão! Quantas falhas tiveram na missão?");
	fail = Number.parseInt(fail);

	document.querySelectorAll('.life').forEach(element => {
		if(fail > 0 && element.src.includes("life")){
			element.click();
			fail--;
		}
	});
	
	if(fail > 0){
		endGame("💥 DERROTA! 💥");
	}
	else{
		if(document.querySelectorAll('.done').length == 10){
			endGame("🎉 VITÓRIA! 🎉");
		}
	}
};

function panic(time){
	if(localStorage.omg_audio != "off"){
		if(time <= 5){siren.play();}
		else{alarm.play();}
	}
	document.body.style.backgroundColor = "#FF0000";
};

function toggleAudio(mode){
	var audio = document.getElementById("audio");
	if(mode === undefined){mode = audio.src.includes("on");}

	if(mode){
		localStorage.omg_audio = "off";
		audio.src = audio.src.replace("on","off");
		audioStop();
	}
	else{
		localStorage.omg_audio = "on";
		audio.src = audio.src.replace("off","on");
	}
};
if(localStorage.omg_audio == "off"){toggleAudio("off");}

function audioStop(){
	siren.pause();
	alarm.pause();
	end.pause();
};

function endGame(result){
	document.getElementById("timer").innerText = result;
	document.getElementById("timer").removeAttribute("id");
	document.getElementById("start").innerText = "🔄 Reiniciar 🔄";
	document.getElementById("start").onclick = restart;
	document.getElementById("start").removeAttribute("id");	
};

function restart(mode){
	if(mode == "confirm"){
		var option = confirm("Você tem certeza que quer reiniciar a partida?");
		if(!option){return false;}
	}
	window.location.reload();
};