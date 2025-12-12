// --- CONFIGURATION ---
// 1. Fixed Rules (Offsets 4, 8, 12... to 40)
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

// Helper to get multiplier based on offset
function getMultForOffset(offset) {
    // Check fixed rules first
    let rule = fixedRules.find(r => r.offset === offset);
    if (rule) return rule.mult;
    
    // Check dynamic rules (offset >= 44, in steps of 4)
    // Formula: For offset >= 44 (and offset % 4 === 0), mult = offset / 2
    if (offset >= 44 && offset % 4 === 0) {
        return offset / 2;
    }
    return 0;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Explicitly define all layer IDs to prevent initialization errors
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
    if (i >= 10 && i % 5 === 0) {
        let targetLayerNum = (i / 5) - 1; 
        if (targetLayerNum >= 1) {
             upgradeDesc += ` Automates and passively generates Layer ${targetLayerNum} upgrades.`;
        }
    }


    addLayer(layerID, {
        name: "Layer " + i,
        symbol: "L" + i,
        small: true,
        position: 0, 
        nodeStyle: {"font-size": "15px", "height": "30px"},
        style: {}, // Required for stability
        branches: [], // Required for stability (disables complex tree drawing)

        startData() { return {
            unlocked: (i === 1),
            points: new Decimal(0),
        }},
        
        // Custom microtabs structure for layout stability
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
            ["display-text", function() { return getPointsDisplay() }],
            "main-display",
            "prestige-button",
            "blank",
            ["microtabs","tab"]
        ],

        tooltip(){return false},
        color: getRandomColor(),
        
        requires: new Decimal(5), 
        
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

        // 4. Automation and Passive Generation Logic
        passiveGeneration() {
            // Target layer i is automated by trigger layer T = (i + 1) * 5
            let triggerLayerNum = (i + 1) * 5; 
            
            // Check for the New Automation Rule (Triggered by L10, L15, L20, etc.)
            if (triggerLayerNum <= 100 && triggerLayerNum >= 10) {
                let triggerLayerID = "layer" + triggerLayerNum;
                // If the trigger layer's upgrade is bought, return 1 (100% passive gen)
                if (player[triggerLayerID] && hasUpgrade(triggerLayerID, 11)) {
                    return 1; 
                }
            }

            return 0; 
        },
        autoUpgrade() {
            // Target layer i is automated by trigger layer T = (i + 1) * 5
            let triggerLayerNum = (i + 1) * 5; 
            
            if (triggerLayerNum <= 100 && triggerLayerNum >= 10) {
                let triggerLayerID = "layer" + triggerLayerNum;
                if (player[triggerLayerID] && hasUpgrade(triggerLayerID, 11)) {
                    return true;
                }
            }
            
            return false;
        },

        gainMult() {
            let mult = new Decimal(1);

            // A. Check Immediate Previous Layer (Standard x3)
            if (player["layer" + (i + 1)] && hasUpgrade("layer" + (i + 1), 11)) {
                mult = mult.times(3);
            }

            // B. Check All "Future" Layers based on offsets
            // Note: Your fixed rules use offsets in steps of 4 (4, 8, 12...)
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
                description: upgradeDesc, // Use the dynamically generated string
                cost: new Decimal(1), 
                style() {return {
                    'width': '1000px',
                    'height': '100px',
                }},
            },
        },
    });
}