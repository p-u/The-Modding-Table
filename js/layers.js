const fixedRules = [
    { offset: 4, mult: 2 },
    { offset: 8, mult: 3 },
    { offset: 12, mult: 5 },
    { offset: 16, mult: 7 },
    { offset: 20, mult: 10 },
    { offset: 24, mult: 12 },
    { offset: 28, mult: 15 },
    { offset: 32, mult: 16 },
    { offset: 36, mult: 18 },
    { offset: 40, mult: 20 },
];

function getMultForOffset(offset) {
    let rule = fixedRules.find(r => r.offset === offset);
    if (rule) return rule.mult;
    if (offset >= 40 && offset % 4 === 0) {
        return offset / 2;
    }
    return 0;
}

function getMaxAutomatedLayer() {
    let maxAutomated = 0;
    for (let T = 5; T <= 100; T++) {
        let triggerLayerID = "layer" + T;
        if (player[triggerLayerID] && hasUpgrade(triggerLayerID, 11)) {
            let currentLayerAutomated = Math.floor(T / 5);
            
            if (currentLayerAutomated > maxAutomated) {
                maxAutomated = currentLayerAutomated;
            }
        }
    }
    return maxAutomated;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var ALL_LAYERS = ["points"];
for (let i = 1; i <= 100; i++) {
    ALL_LAYERS.push("layer" + i);
}

for (let i = 1; i <= 100; i++) {
    let layerID = "layer" + i;
    let prevLayer = (i === 1) ? "points" : "layer" + (i - 1);
    let upgradeDesc = `Triple ${prevLayer} gain.`;

    for (let off = 4; off < i; off += 4) {
        let mult = getMultForOffset(off);
        if (mult > 0) {
            let target = i - off;
            let targetName;
            if (target == 0) {
                targetName = "points";
            } else {
                targetName = "layer" + target;
            }
            upgradeDesc += ` Also x${mult} ${targetName} gain.`;
        }
    }
    if (i >= 5) {
        let maxTargetLayer = Math.floor(i / 5); 
        if (maxTargetLayer >= 1) {
             let targetRange;
             if (maxTargetLayer === 1) {
                 targetRange = `Layer 1`; 
             } else {
                 targetRange = `Layers 1 through ${maxTargetLayer}`;
             }
             upgradeDesc += ` Also, this upgrade enables Passive Generation and Auto Upgrade for ${targetRange}.`;
        }
    }


    addLayer(layerID, {
        name: "Layer " + i,
        symbol: "L" + i,
        position: 0, 
        style: {}, 
        branches: [], 

        startData() { return {
            unlocked: (i === 1),
            points: new Decimal(0),
        }},
        
        microtabs:{
            tab:{
                "main":{
                    name(){return 'upgrade'}, 
                    content:[
                        ['upgrade', 11],
                    ],
                },
            },
        },
        tabFormat: [
            ["row", [
                ["clickable", 11], 
                ["clickable", 12], 
            ]],
            ["display-text", function() { return getPointsDisplay() }],
            "main-display",
            "prestige-button",
            "blank",
            ["microtabs","tab"]
        ],

        tooltip(){return false},
        color: getRandomColor(),
        
        requires: new Decimal(4).add(Decimal.floor(i/25)), 
        
        resource: "layer " + i + " points",
        baseResource: (i === 1) ? "points" : "layer" + (i - 1) + " points",
        baseAmount() {
            if (i === 1) {
                return new Decimal(player.points);
            }
            return new Decimal(player[prevLayer].points);
        },
        type: "normal",
        exponent: 0.5,
        row: i, 
        
        layerShown() { return true },

        passiveGeneration() {
            if (i <= getMaxAutomatedLayer()) {
                return 1;
            }
            return 0; 
        },
        
        autoUpgrade() {
            if (i <= getMaxAutomatedLayer()) {
                return true;
            }
            return false;
        },

        gainMult() {
            let mult = new Decimal(1);

            if (player["layer" + (i + 1)] && hasUpgrade("layer" + (i + 1), 11)) {
                mult = mult.times(3);
            }

            for (let off = 4; (i + off) <= 100; off += 4) {
                let futureLayerID = "layer" + (i + off);
                let multiplier = getMultForOffset(off);

                if (multiplier > 0) {
                    if (player[futureLayerID] && hasUpgrade(futureLayerID, 11)) {
                        mult = mult.times(multiplier);
                    }
                }
            }

            return mult;
        },
        gainExp() {
            return new Decimal(1);
        },
        
        upgrades: {
            11: {
                title: "Multiplier Boost",
                description: upgradeDesc, 
                cost: new Decimal(1), 
                style() {return {
                    'width': '1000px',
                    'height': '100px',
                }},
            },
        },
        
        clickables: {
            11: { // Back
                title: "◄ Previous Layer",
                display() {
                    let target = i - 1;
                    return `Go to Layer ${target}`;
                },
                unlocked() {
                    return i > 1;
                },
                onClick() {
                    showTab("layer" + (i - 1));
                },
                canClick() {
                    return true;
                },
                style() {
                    return {'width': '150px', 'height': '50px', 'background-color': '#0099cc'};
                }
            },
            12: { // Forward
                title: "Next Layer ►",
                display() {
                    let target = i + 1;
                    return `Go to Layer ${target}`;
                },
                unlocked() {
                    return i < 100;
                },
                onClick() {
                    const targetLayerID = "layer" + (i + 1);
                    showTab(targetLayerID)
                },
                canClick() {
                    return true;
                },
                style() {
                    return {'width': '150px', 'height': '50px', 'background-color': '#0099cc'};
                }
            },
        },
    });
}