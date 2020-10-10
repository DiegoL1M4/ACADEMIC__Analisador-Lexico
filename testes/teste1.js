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