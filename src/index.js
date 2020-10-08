var fs = require('file-system')

var operators = require('./language/operators')
var reservedWords = require('./language/reservedWords')
var terminators = require('./language/terminators')

var code = fs.readFileSync('enter-code/comando.js', 'utf8')
var codeLines = code.split('\n');

var cvsFile = 'Token; Lexema; Descrição; Linha do Código; Posição na Linha;\n';

var trail = "nada";             // Identifica o tipo de char anterior ao atual (identificar sequencias)
var current_token = ''; 
var comment = false;
var open_quotes = false;              // Se for true todo o conteúdo deve ser salvo como um só

var cont_line = 0;
var cont_column = 0;

for (char of code) {
  if (open_quotes) {
    current_token += char;
    
    if (char == '"') {
      open_quotes = !open_quotes;
      trail = "literal";
      current_token = checkToken(current_token);
    }

    trail = "terminador";

  } else if (comment) {
    if (char == "\n") {
      comment = false;
      current_token = checkToken(current_token);
    } else {
      current_token += char;
    }

    trail = "comentario";

  } else if (char == "\n") {
    cont_line++;
    cont_column = 0;

  } else {
    if (!is_space(char)) {

      if (!is_operator(char)) {

        if (!is_terminator(char)) {

          if (!is_number(char)) {
            if (trail != "letra")
              current_token = checkToken(current_token);

            current_token += char;
            trail = "letra";
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
          }

        }

      } else if (operators.includes(current_token[0])) {
        current_token += char;
        trail = "operador";
        if(is_comment())
          comment = true;

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

  cont_column++;

}

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

  line_column = get_line_column_token(id);
  cvsFile += `${token}; ${id}; ${token_type}; ${line_column.line}; ${line_column.column}\n`;

}

function is_space(char) {
  return char === ' ';
}

function is_comment() {
  return current_token === '//';
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

function get_line_column_token(token, ultima_col = false, ultima_line = false) {
  for (const line of codeLines) {
    var col_token = line.indexOf(token);

    if (col_token >= 0) {
      var line_token = codeLines.indexOf(line)

      if (!(ultima_col && ultima_line)) {
        return { line: line_token + 1, column: col_token + 1 };

      } else {
        if (line_token == ultima_line && col_token > ultima_col) {
          return { line: line_token + 1, column: col_token + 1 };

        } else if ((line_token != ultima_line || col_token != ultima_col) && (line_token > ultima_line || col_token > ultima_col)) {
          return { line: line_token + 1, column: col_token + 1 };

        }
      }
    }
  }

  return false;
}
