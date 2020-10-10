var fs = require('file-system')

var operators = require('./language/operators')
var reservedWords = require('./language/reservedWords')
var terminators = require('./language/terminators')

var code = fs.readFileSync('data/inputCode.js', 'utf8')
var cvsFile = '\n############ TABELA DE TOKENS ############\n' 
            + 'Token; Lexema; Descrição\n';

var trail = "nada";         // Identifica o tipo de char do token atual
var current_token = "";     // Guarda o conjunto de caracteres do token atual
var $VerifyBlock = "";      // String auxiliar para encontrar o fim de um bloco de comentário
var commentLine = false;    // Identificador de comentário de linha
var commentBlock = false;   // Identificador de comentário em bloco
var open_quotes = false;    // Identificador de abertura de aspas
var type_open_quotes = ""   // Identifica qual tipo de aspa abriu o literal
var backslash = true;       // Auxiliar pra identificar o uso de uma barra invertifa em uma string

// Execução Principal (Leitura do Código por Caractere)
for (char of code) {
  if (open_quotes) {
    current_token += char;

    if (!backslash && char == type_open_quotes) {
      open_quotes = !open_quotes;
      trail = "literal";
      current_token = checkToken(current_token);
    }
    
    if(!backslash && char == '\\')
      backslash = true;
    else
      backslash = false;

    trail = "terminador";

  } else if (commentBlock) {
    if (char == "*") {
      $VerifyBlock = "*"; 
    } else {
      $VerifyBlock += char;
    }

    current_token += char;
    if ($VerifyBlock == '*/'){
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

          } else if (is_number(current_token[0]) && is_number(char)) {
            current_token += char;
            trail = "constante";

          } else {
            current_token = checkToken(current_token);
            current_token += char;
            trail = "constante";

          }

        } else {
          if (char == '"' || char == '\'') {
            type_open_quotes = char;
            current_token = char;
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

// Salva Arquivo
fs.writeFile('./data/outputTable.csv', cvsFile, function (err) { })



// Funções
function checkToken(current_token) {
  if (current_token != '') {
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
        if (current_token == '=')
          insertTable(current_token, 'Atribuição');
        else
          insertTable(current_token, 'Operador');
        break;

      case "constante":
        insertTable(current_token, 'Constante Numérica');
        break;

      case "literal":
        insertTable(current_token, 'Constante Literal');
        break;

      case "terminador":
        if (current_token == ',')
          insertTable(current_token, 'Separador');
        else
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
    case 'Constante Numérica':
    case 'Constante Literal':
      token = `<${token_type}, ${id}>`;
      break;

    case 'Comentário':
      token = `< ${token_type} , ${id} >`;
      id = '//';
      break;

    default:
      token = `< ${id} , >`;
      break;
  }

  cvsFile += `${token};\t ${id};\t ${token_type}\n`;

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
