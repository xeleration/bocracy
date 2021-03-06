var heals = 0, keypresses = 0, leftWeapon, rightWeapon, clickedToStart, backButtonTimeout, presentTimeout, a = { name: '', health: 0, attack: 0, speed: 0 },
b = { name: '', health: 0, attack: 0 }, base, clicks = 0,
current = battles[Math.floor(Math.random() * battles.length)], endless = {w:window.location.hash.includes("endless"),t:1,c:0,k:0};
if (window.location.hash != '' && window.location.hash != '#endless') current = window.location.hash.toString().replace('#', '').replace('endless','');
var game = { on : false,
	refresh : { all : function() {
		$('bHealthBar').style.width = (b.health / b.orig_health)*100 + '%';
		$('aHealthBar').style.width = (a.health / a.orig_health)*100 + '%';
		window.requestAnimationFrame(game.refresh.all);
	}}, win : function(side) {
		if (Math.round(innerWidth / innerHeight * 3) == 4
			|| Math.round(innerHeight / innerWidth * 4) == 3
			|| Math.round(innerWidth / innerHeight * 4) == 3
			|| Math.round(innerHeight / innerWidth * 3) == 4)
			$("overlay").style.zoom = .7;
		if (endless.w) {
			if (side == 'green') {
				endless.c = parseFloat(endless.c) + Math.round(Math.max((a.attack/b.attack)*20, 10));
				endless.k++;
				var aName = a.name;
				do {
					a.name = badNames[current.replace('+', 'Boss')][Math.floor(Math.random() * badNames[current.replace('+', 'Boss')].length)];
				} while (a.name == aName);
				a.health = bad[a.name].stats[1];
				a.orig_health = a.health;
				a.attack = bad[a.name].stats[0];
				a.speed = 450;
				a.heal = bad[a.name].stats[2];
				b.health = Math.min(b.orig_health, b.health*1.3);
				updateCharacter();
			} else {
				endless.t++;
				if (endless.t > ls.sc) {
					endless.c = Math.min(Math.round(endless.c * endless.t), 1500);
					if (ls.redbacks == undefined) ls.redbacks = endless.c;
					else ls.redbacks = parseFloat(ls.redbacks) + endless.c;
					$('overlayText').innerHTML = '<div>GAME OVER</div><div id="overlayStats"><h5><span>' + endless.k + '</span>kls</h5><h5><span>' + neatTime(new Date().getTime() - base) + '</span>sec</h5><h5><span redbacks></span>' + endless.c + '</h5><h5><span>' + clicks + '</span>clk</h5><h5><span>' + ls.sc + '</span>dth</h5></div>';
					$('restartText').innerHTML = "Continue";
					injectStyles('#restartText { background: #960000 } #restartText:hover { background: #a00000 }');
					$('restartText').setAttribute("ontouchend", "location='../endless/index.html'");
					$('overlay').style.backgroundColor = '#b30005';
					$('restartText').style.display = "none";
					setTimeout(function(){$('restartText').style.display = "block"}, 750);
					$('overlay').style.display = "block";
					game.on = false;
					endless.t = 1;
					endless.k = 0;
					ga("send", "event", "battle", "lost-endless-battle", "pre-release");
					return;
				}
				b.name = ls['b' + endless.t];
				var upgrades = (ls[b.name + "Upgrades"] || "0:0:0").split(":");
				b.health = good[b.name].stats[1] * ((upgrades[1] * 0.2) + 1);
				b.orig_health = b.health;
				b.attack = good[b.name].stats[0] * ((upgrades[0] * 0.2) + 1);
				b.heal = good[b.name].stats[2] * ((upgrades[2] * 0.2) + 1);
				updateCharacter();
			}
		} else {
		game.on = false;
		if (side == 'green') {
			if (current.includes('+')) var redbacksEarned = Math.round(Math.max((a.attack/b.attack)*30, 25));
			else var redbacksEarned = Math.round(Math.max((a.attack/b.attack)*20, 10));
			if (ls.redbacks == undefined) ls.redbacks = redbacksEarned;
			else ls.redbacks = parseFloat(ls.redbacks) + redbacksEarned;
			$('overlayText').innerHTML = '<div>VICTORY</div><div id="overlayStats"><h5><span>' + neatTime(new Date().getTime() - base) + '</span>sec</h5><h5><span redbacks></span>' + redbacksEarned + '</h5><h5><span>' + clicks + '</span>clk</h5></div>';
			$('overlay').style.backgroundColor = '#64DD17';
			injectStyles('#restartText { background: #42bb05 } #restartText:hover { background: #53CC16 }');
			ga("send", "event", "battle", "won-battle", "pre-release");
		} else {
			$('overlayText').innerHTML = '<div>DEFEAT</div><div id="overlayStats"><h5><span>' + neatTime(new Date().getTime() - base) + '</span>sec</h5><h5><span>' + clicks + '</span>clk</h5></div>';
			$('overlay').style.backgroundColor = '#b30005';
			injectStyles('#restartText { background: #960000 } #restartText:hover { background: #a00000 }');
			ga("send", "event", "battle", "lost-battle", "pre-release");
		}
		$('restartText').style.display = "none";
		setTimeout(function(){$('restartText').style.display = "block"}, 750);
		$('overlay').style.display = "block";
		}
	}, attack : function(atk) {
		if (game.on == true) {
			if (atk == 'green') {
				a.health -= b.attack;
				a.health = Math.max(0, a.health);
				a.health = Math.min(a.orig_health, a.health);
				var newone = $('leftWeapon').cloneNode(true);
				$('leftWeapon').parentNode.replaceChild(newone, $('leftWeapon'));
				$('leftWeapon').style.display = "block";
				$('leftWeapon').style.animationName = "leftWeapon";
				$('clickToStart').style.display = 'none';
				clearTimeout(leftWeapon);
				leftWeapon = setTimeout(function(){
					$('leftWeapon').style.display = 'none';
					$('leftWeapon').style.animationName = '';
				}, 150);
				clicks++;
				if (a.health == 0) game.win('green');
			} else if (atk == 'red') {
				b.health -= a.attack;
				b.health = Math.max(0, b.health);
				b.health = Math.min(b.orig_health, b.health);
				var newone = $('rightWeapon').cloneNode(true);
				$('rightWeapon').parentNode.replaceChild(newone, $('rightWeapon'));
				$('rightWeapon').style.display = "block";
				$('rightWeapon').style.animationName = "rightWeapon";
				clearTimeout(rightWeapon);
				rightWeapon = setTimeout(function(){
					$('rightWeapon').style.display = 'none';
					$('rightWeapon').style.animationName = '';
				}, 100);
				if (b.health == 0) game.win('red');
			}
			document.querySelector('#aHealth p').innerHTML = Math.round(a.health) + '/' + Math.round(a.orig_health);
			document.querySelector('#bHealth p').innerHTML = Math.round(b.health) + '/' + Math.round(b.orig_health);
		}
	}, heal : function(side) {
		if (game.on == true) {
			if (side == 'green') {
				b.health += b.heal; b.health = Math.max(0, b.health);
				b.health = Math.min(b.orig_health, b.health);
				heals++;
				if (heals == 10) ga("send", "event", "battle", "tenth-heal", "pre-release");
			} else if (side == 'red') {
				a.health += a.heal; a.health = Math.max(0, a.health);
				a.health = Math.min(a.orig_health, a.health);
			}
		}
	}
};
function load() {
	clicks = 0, clickedToStart = false;
	if (!window.location.hash.includes('#') || window.location.hash == '#endless') {
		var previousBattleground = current;
		do {
			current = battles[Math.floor(Math.random() * battles.length)];
		} while (current == previousBattleground);
	}
	switch (current.replace('+', '')) {
		case "aonarchy": badNames.url = "b"; goodNames.url = "a"; break;
		case "alief": badNames.url = "b"; goodNames.url = "a"; break;
		case "ammunist": badNames.url = "b"; goodNames.url = "a"; break;
		case "alinar": badNames.url = "b"; goodNames.url = "a"; break;
		case "eora": badNames.url = "b"; goodNames.url = "a"; break;
		default: badNames.url = "b"; goodNames.url = "b";
	}
	if (ls['has' + current.toString().charAt(0).toUpperCase() + current.toString().substring(1).replace('+', '')] == undefined) {
		ls[goodNames[current][Math.floor(Math.random()*goodNames[current].length)]] = true;
		ls['has' + current.toString().charAt(0).toUpperCase() + current.toString().substring(1).replace('+', '')] = true;
	}
	if (endless.w) b.name = ls.b1;
	else {
		var bName = b.name;
		do {
			b.name = goodNames[current.replace('+', 'Boss')][Math.floor(Math.random() * goodNames[current.replace('+', 'Boss')].length)];
		} while (b.name == bName);
	}
	endless.c = 0;
	var aName = a.name;
	do {
		a.name = badNames[current.replace('+', 'Boss')][Math.floor(Math.random() * badNames[current.replace('+', 'Boss')].length)];
	} while (a.name == aName);
	while (ls[b.name] == "false") { b.name = goodNames[current.replace('+', 'Boss')][Math.floor(Math.random() * goodNames[current.replace('+', 'Boss')].length)]; }
	a.health = bad[a.name].stats[1];
	a.attack = bad[a.name].stats[0];
	a.heal = bad[a.name].stats[2];
	var upgrades = (ls[b.name + "Upgrades"] || "0:0:0").split(":");
	b.health = good[b.name].stats[1] * ((upgrades[1] * 0.2) + 1);
	b.attack = good[b.name].stats[0] * ((upgrades[0] * 0.2) + 1);
	b.heal = good[b.name].stats[2] * ((upgrades[2] * 0.2) + 1);
	if (isMobile) a.speed = 300;
	else a.speed = 450;
	b.orig_health = b.health;
	a.orig_health = a.health;
	if (current.includes('+')) {
		var stats = ['attack', 'health', 'speed', 'heal', 'orig_health'];
		for (i = 0; i < stats.length; i++) {
			if (stats[i] == 'speed') a.speed / 1.25;
			else a[stats[i]] *= 1.25;
		}
	}
	document.querySelector('#aHealth p').innerHTML = Math.round(a.health) + '/' + Math.round(a.orig_health);
	document.querySelector('#bHealth p').innerHTML = Math.round(b.health) + '/' + Math.round(b.orig_health);
	var img = new Image();
	img.onload = function() {
		document.body.style.backgroundImage = 'url(../assets/backgrounds/' + current.replace('+', '') + '.svg)';
		document.body.style.backgroundPosition = (Math.random() * 100) + "% 80%";
		$('present').style.background = "url(../assets/backgrounds/" + current.replace('+', '') + ".svg) no-repeat center/100% #3F51B5";
		$('present').innerText = current.replace('+', ' BOSS');
		$('present').style.display = "block";
		$('present').style.animation = "none";
		$('present').offsetHeight;
		$('present').style.animation = ""; 
		clearTimeout(presentTimeout);
		presentTimeout = setTimeout(function(){$('present').style.display = ""}, 2000);
	};
	img.onerror = function() {
		document.body.style.backgroundImage = '';
	};
	img.src = '../assets/backgrounds/' + current.replace('+', '') + '.svg';
	$('refreshButton').style.display = "";
	updateCharacter();
}
function updateCharacter() {
	var bName = b.name;
	bName = bName.replace('D', '.').replace('__', '^').replace('--', '^').replace('_', ' ').replace('_', ' ').replace('-', ' ').replace('-', ' ').replace('^', '-').replace('Boss', ' boss');
	$('bName').innerHTML = bName + ' ' + goodNames.url;
	var aName = a.name;
	aName = aName.replace('D', '.').replace('__', '^').replace('--', '^').replace('_', ' ').replace('_', ' ').replace('-', ' ').replace('-', ' ').replace('^', '-').replace('Boss', ' boss');
	$('aName').innerHTML = aName + ' ' + badNames.url;
		$('bButton').style.backgroundImage = 'url(../assets/characters/' + b.name.toString().replace('_', '-').replace('_', '-').replace('_', '-').replace('_', '-').replace('D', '.').replace('Boss', '') + '.png)';
	$('aButton').style.backgroundImage = 'url(../assets/characters/' + a.name.toString().replace('_', '-').replace('_', '-').replace('_', '-').replace('_', '-').replace('D', '.').replace('Boss', '') + '.png)';
	$('bName').style.fontSize = (30-$('bName').innerHTML.length)/5 + 'vmax';
	$('aName').style.fontSize = Math.min((30-$('aName').innerHTML.length)/5,$('bName').style.fontSize.replace('vmax', '')) + 'vmax';
	if ($('aName').style.fontSize.replace('vmax', '') < 1) $('aName').style.fontSize = (parseFloat($('aName').style.fontSize.replace('vmax', ''))+0.8) + 'vmax';
	$('bName').style.fontSize = Math.min((30-$('bName').innerHTML.length)/5,$('aName').style.fontSize.replace('vmax', '')) + 'vmax';
	var aw  = 'sword', bw = 'sword';
	try {
		if (bad[a.name.replace('--', '__').replace('-', '_').replace('-', '_').replace('-', '_')].info[4] != undefined) aw = bad[a.name.replace('--', '__').replace('-', '_').replace('-', '_').replace('-', '_')].info[4];
	} catch (ex) {}
	try {
		if (good[b.name.replace('--', '__').replace('-', '_').replace('-', '_').replace('-', '_')].info[4] != undefined) bw = good[b.name.replace('--', '__').replace('-', '_').replace('-', '_').replace('-', '_')].info[4];
	} catch (ex){}
	$('leftWeapon').style.backgroundImage = 'url("../assets/weapons/' + bw + '.svg")';
	$('rightWeapon').style.backgroundImage = 'url("../assets/weapons/' + aw + '.svg")';
}
function restart() {
	$('clickToStart').style.display = 'block';
	$('overlay').style.display = 'none';
	load();
	$('injectedStyle').remove();
}
function neatTime(time) {
	var h = Math.floor(time / 3600000),
	m = Math.floor(time / 60000) - (h * 60),
	s = Math.floor(time / 1000) - (m * 60);
	if (h > 0) s = s - (m * 60);
	time = '';
	if (h >= 1) time = h + ':';
	if (m >= 1) time += m + ':';
	return time + s;
}
function injectStyles(rules) {
  var style = document.createElement('style');
  style.id = 'injectedStyle';
  style.innerHTML = rules;
  document.head.appendChild(style);
}
$('bSection').addEventListener(isMobile?'touchend':'click', function(){game.heal('green')});
$('aSection').addEventListener(isMobile?'touchend':'click', function(){
	if ($('clickToStart').style.display == "none") game.attack('green');
	else {
		game.on = true;
		game.attack('green');
		base = new Date().getTime();
		$('refreshButton').style.display = 'none';
	}
});
$('restartText').addEventListener(isMobile?'touchend':'click', function(){restart()});
document.addEventListener(isMobile?'touchend':'click', function(e){
	if (e.target.id != "backButton" && game.on == true) {
		clearTimeout(backButtonTimeout);
		backButtonTimeout = setTimeout(function(){$("backButton").style.display=""}, 1000);
		$("backButton").style.display = "none";
	}
	else if (e.target.id == "backButton") location = "../index.html";
});
document.addEventListener('keyup', function(e){
	keypresses++;
	if (keypresses == 1) ga("send", "event", "battle", "first-keypress", "pre-release");
	var k = e.keyCode || e.which;
	if ((k == 74 || k == 39 || k == 68) && $('overlay').style.display != "block" && $('present').style.display != "block") {
		if (clickedToStart) game.attack('green');
		else {
			clickedToStart = true;
			game.on = true;
			game.attack('green');
			base = new Date().getTime();
			$('refreshButton').style.display = 'none';
		}
	}
	if (k == 70 || k == 37 || k == 65) game.heal('green');
	if ((k == 46 || k == 32) && game.on == false) {
		ga("send", "event", "battle", "restarted-battle", "pre-release");
		restart();
	}
	if (k == 27) location = "../index.html";
});
$('refreshButton').addEventListener(isMobile?'touchend':'click', function() {
	ga("send", "event", "battle", "restarted-battle", "pre-release");
	restart();
});
load();
setInterval(function(){game.attack("red");game.heal("red")}, a.speed);
game.refresh.all();
document.body.ontouchmove=function(e){e.preventDefault()}
