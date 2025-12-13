let modInfo = {
	name: "100 Layers, 100 Upgrades",
	id: "RD82:100LMT",
	author: "Randim82",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	internationalizationMod: false,
	changedDefaultLanguage: false,
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

var colors = {
	button: {
		width: '250px',// Table Button
		height: '40px',// Table Button
		font: '25px',// Table Button
		border: '3px'// Table Button
	},
	default: {
		1: "#ffffff",//Branch color 1
		2: "#bfbfbf",//Branch color 2
		3: "#7f7f7f",//Branch color 3
		color: "#dfdfdf",
		points: "#ffffff",
		locked: "#bf8f8f",
		background: "#0f0f0f",
		background_tooltip: "rgba(0, 0, 0, 0.75)",
	},
}

// When enabled, it will hidden left table
function hiddenLeftTable(){
	return false
}

// Set your version in num and name
let VERSION = {
	num: "1.0",
	name: "Literally nothing",
}

function changelog(){
	return ""
} 

function winText(){
	return "Congratulations! You have reached the end and beaten this game, but for now..."
}

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}


function getPointGen() {
	if(!canGenPoints()) return new Decimal(0)
	let gain = new Decimal(1)

    if (hasUpgrade("layer1", 11)) gain = gain.times(3)

    for (let layerNum = 4; layerNum <= 100; layerNum += 4) {
        
        let multVal = 0;
        
        if (layerNum === 4) multVal = 2;
        else if (layerNum === 8) multVal = 3;
        else if (layerNum === 12) multVal = 5;
        else if (layerNum === 16) multVal = 7;
        else if (layerNum === 20) multVal = 10;
        else if (layerNum === 24) multVal = 12;
        else if (layerNum === 28) multVal = 15;
        else if (layerNum === 32) multVal = 16;
        else if (layerNum === 36) multVal = 18;
        else if (layerNum === 40) multVal = 20;
        else if (layerNum >= 40) multVal = layerNum / 2;
        if (multVal > 0) {
            if (player["layer" + layerNum] && hasUpgrade("layer" + layerNum, 11)) {
                gain = gain.times(multVal);
            }
        }
    }
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra information at the top of the page
var displayThings = [
	function() {
		return ""
	}
]

// You can write code here to easily display information in the top-left corner
function displayThingsRes(){
	return 'Points: '+format(player.points)+' | '
}

// Determines when the game "ends"
function isEndgame() {
	return false
}

function getPointsDisplay(){
	let a = ''
	if(player.devSpeed && player.devSpeed!=1){
		a += options.ch ? '<br>时间加速: '+format(player.devSpeed)+'x' : '<br>Dev Speed: '+format(player.devSpeed)+'x'
	}
	if(player.offTime!==undefined){
		a += options.ch ? '<br>离线加速剩余时间: '+formatTime(player.offTime.remain) : '<br>Offline Time: '+formatTime(player.offTime.remain)
	}
	a += '<br>'
	if(!(options.ch==undefined && modInfo.internationalizationMod==true)){
		a += `<span class="overlayThing">${(i18n("你有", "You have", false))} <h2 class="overlayThing" id="points"> ${format(player.points)}</h2> ${i18n(modInfo.pointsName, modInfo.pointsNameI18N)}</span>`
		if(canGenPoints()){
			a += `<br><span class="overlayThing">(`+(tmp.other.oompsMag != 0 ? format(tmp.other.oomps) + " OoM" + (tmp.other.oompsMag < 0 ? "^OoM" : tmp.other.oompsMag > 1 ? "^" + tmp.other.oompsMag : "") + "s" : formatSmall(getPointGen()))+`/sec)</span>`
		}
		a += `<div style="margin-top: 3px"></div>`
	}
	a += tmp.displayThings
	a += '<br><br>'
	return a
}

// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
