var fs = require('file-system')

var operators = require('./language/operators')
var reservedWords = require('./language/reservedWords')
var terminators = require('./language/terminators')

var code = fs.readFileSync('enter-code/comando.js', 'utf8')
var codeLines = code.split('\n');

var cvsFile = 'Token; Lexema; Descrição; Linha do Código; Posição na Linha;\n';

var trail = "nada";             // Identifica o tipo de char anterior ao atual (identificar sequencias)
var current_token = ''; 
var verifyBlock = "";
var commentLine = false;
var commentBlock = false;
var open_quotes = false;              // Se for true todo o conteúdo deve ser salvo como um só

for (char of code) {
  if (open_quotes) {
    current_token += char;
    
    if (char == '"') {
      open_quotes = !open_quotes;
      trail = "literal";
      current_token = checkToken(current_token);
    }

    trail = "terminador";

  } else if (commentBlock) {
    if (char == "*") {
      verifyBlock = "*";
    } else {
      verifyBlock += char;
    }

    current_token += char;
    if (verifyBlock == '*/'){
      commentBlock = false;
      trail = "comentario";
      current_token = checkToken(current_token);
    }

  } else if (commentLine) {
    if (char == "\n") {
      commentLine = false;
      trail = "comentario";
      current_token = checkToken(current_token);
    } else {
      current_token += char;
    }

  } else if (char == "\n") {

  } else {
    if (!is_space(char)) {

      if (!is_operator(char)) {

        if (!is_terminator(char)) {

          if (!is_number(char)) {
            if (char == "." && is_number(current_token)) {
              current_token += char;
              trail = "constante";
            } else {
              if (trail != "letra")
                current_token = checkToken(current_token);

              current_token += char;
              trail = "letra";
            }

          } else if (Number.isInteger(parseInt(current_token[0]))) {
            current_token += char;
            trail = "constante";

          } else {
            current_token = checkToken(current_token);
            current_token += char;
            trail = "constante";

          }

        } else {
          if (char == '"') {
            current_token = '"';
            open_quotes = !open_quotes;
          } else {
            current_token = checkToken(current_token);
            current_token += char;
            trail = "terminador";
            current_token = checkToken(current_token);
          }

        }

      } else if (operators.includes(current_token[0])) {
        current_token += char;
        trail = "operador";
        if(is_commentLine())
          commentLine = true;
        if(is_commentBlock())
          commentBlock = true;

      } else {
        current_token = checkToken(current_token);
        current_token += char;
        trail = "operador";

      }

    } else {
      current_token = checkToken(current_token);
      trail = "nada";
    }

  }

}

if (current_token != '')
  checkToken(current_token);

fs.writeFile('./output/resultado.csv', cvsFile, function (err) { })

function checkToken(current_token) {
  if (current_token == ',') {
    return '';

  } else if (current_token != '') {
    switch (trail) {
      case "nada":
        break;

      case "comentario":
        insertTable(current_token, 'Comentário');
        break;

      case "letra":
        if (reservedWords.includes(current_token)) {
          insertTable(current_token, 'Palavra Reservada');
        } else if (current_token != "\n") {
          insertTable(current_token, 'Identificador');
        }
        break;

      case "operador":
        insertTable(current_token, 'Operador');
        break;

      case "constante":
        insertTable(current_token, 'Constante');
        break;

      case "literal":
        insertTable(current_token, 'Literal');
        break;

      case "terminador":
        insertTable(current_token, 'Terminador');
        break;

    }
  }

  return '';
}

function insertTable(id, token_type) {
  var token = "";
  switch(token_type) {
    case 'Identificador':
    case 'Constante':
    case 'Literal':
      token = `<${token_type}, ${id}>`;
      break;

    case 'Comentário':
      token = `<${token_type}, ${id}>`;
      id = '//';
      break;

    default:
      token = `<${id},>`;
      break;
  }

  cvsFile += `${token}; ${id}; ${token_type}\n`;

}

function is_space(char) {
  return char === ' ';
}

function is_commentLine() {
  return current_token === '//';
}

function is_commentBlock() {
  return current_token === '/*';
}

function is_operator(char) {
  return operators.includes(char);
}

function is_terminator(char) {
  return terminators.includes(char)
}

function is_number(char) {
  var n = parseInt(char);
  return Number.isInteger(n);
}
