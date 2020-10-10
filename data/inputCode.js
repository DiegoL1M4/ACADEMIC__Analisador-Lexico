/* Analisador Léxico */

// Teste Code 1
var and = true && !teste;
let or = false || teste;

let numInt = 1000000000;
let numFloat = 55.99;

numInt++;
numInt--;

numFloat += 5;
numFloat -= 10;

if(numFloat >= numInt) {
    console.log("Teste 'string'");
} else if(numFloat == numInt) {
    console.log('Teste "string"');
} else {
    console.log("Barra invertida \\ \" \'");
}

// Teste Code 2
for(j = 0; j < 1; j++) {
    x = [1,2,3];
}

while(numFloat > numInt) {
    xy = [[1],[2],[3]];
}

do {
    numFloat += 5;
} while(numFloat < numInt);

switch(numFloat) {
    case 'a':
        break;

    default:
        continue;
}

// Teste Code 3
try {
    numFloat -= 10;
} catch(ae) {
    console.log("ok");
} finally {
    console.log("ok");
}

function testando() {
    if(numFloat >= numInt) {
        for(j = 0; j < 1; j++) {
            while(numFloat > numInt) {
                xy = [[1],[2],[3]];
            }
        }
    }
    return true;
}