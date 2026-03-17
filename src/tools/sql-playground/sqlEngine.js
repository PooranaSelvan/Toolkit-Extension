/**
 * Lightweight in-browser SQL engine for learning purposes.
 * Supports: SELECT, WHERE, ORDER BY, LIMIT, JOIN, GROUP BY, HAVING,
 *           COUNT, SUM, AVG, MIN, MAX, DISTINCT, AS aliases, LIKE, IN,
 *           BETWEEN, IS NULL, AND/OR, INSERT INTO, UPDATE, DELETE, CREATE TABLE.
 *
 * This is intentionally simple — designed for the SQL Playground learning tool.
 */

// ─── Default sample datasets ────────────────────────────────
export const SAMPLE_TABLES = {
  employees: {
    columns: ['id', 'name', 'department', 'salary', 'hire_date', 'manager_id'],
    rows: [
      [1, 'Alice Johnson',  'Engineering', 95000,  '2020-03-15', null],
      [2, 'Bob Smith',      'Engineering', 88000,  '2019-07-22', 1],
      [3, 'Carol Williams', 'Marketing',   72000,  '2021-01-10', null],
      [4, 'David Brown',    'Engineering', 105000, '2018-11-05', 1],
      [5, 'Eva Martinez',   'Marketing',   68000,  '2022-04-18', 3],
      [6, 'Frank Wilson',   'Sales',       78000,  '2020-09-01', null],
      [7, 'Grace Lee',      'Sales',       82000,  '2019-12-12', 6],
      [8, 'Henry Davis',    'HR',          65000,  '2021-06-20', null],
      [9, 'Ivy Chen',       'Engineering', 92000,  '2020-08-14', 1],
      [10, 'Jack Taylor',   'HR',          61000,  '2023-02-28', 8],
    ],
  },
  departments: {
    columns: ['id', 'name', 'budget', 'location'],
    rows: [
      [1, 'Engineering', 500000, 'Building A'],
      [2, 'Marketing',   200000, 'Building B'],
      [3, 'Sales',       300000, 'Building B'],
      [4, 'HR',          150000, 'Building C'],
      [5, 'Finance',     250000, 'Building A'],
    ],
  },
  products: {
    columns: ['id', 'name', 'category', 'price', 'stock', 'rating'],
    rows: [
      [1, 'Laptop Pro',      'Electronics', 1299.99, 45,  4.5],
      [2, 'Wireless Mouse',  'Electronics', 29.99,   200, 4.2],
      [3, 'Standing Desk',   'Furniture',   499.99,  30,  4.7],
      [4, 'Noise Cancelling Headphones', 'Electronics', 349.99, 80, 4.8],
      [5, 'Ergonomic Chair', 'Furniture',   399.99,  25,  4.6],
      [6, 'USB-C Hub',       'Electronics', 49.99,   150, 4.1],
      [7, 'Monitor 27"',     'Electronics', 449.99,  60,  4.4],
      [8, 'Desk Lamp',       'Furniture',   79.99,   100, 4.3],
      [9, 'Mechanical Keyboard', 'Electronics', 149.99, 90, 4.6],
      [10, 'Webcam HD',      'Electronics', 89.99,   120, 3.9],
    ],
  },
  orders: {
    columns: ['id', 'product_id', 'customer_name', 'quantity', 'order_date', 'status'],
    rows: [
      [1, 1,  'John Doe',      1, '2024-01-15', 'delivered'],
      [2, 3,  'Jane Smith',    2, '2024-01-18', 'delivered'],
      [3, 4,  'John Doe',      1, '2024-02-01', 'shipped'],
      [4, 2,  'Bob Wilson',    3, '2024-02-10', 'delivered'],
      [5, 7,  'Alice Brown',   1, '2024-02-14', 'pending'],
      [6, 5,  'Jane Smith',    1, '2024-02-20', 'shipped'],
      [7, 9,  'Charlie Davis', 2, '2024-03-01', 'pending'],
      [8, 1,  'Eva Martinez',  1, '2024-03-05', 'delivered'],
      [9, 6,  'Bob Wilson',    5, '2024-03-10', 'shipped'],
      [10, 8, 'John Doe',      2, '2024-03-15', 'pending'],
    ],
  },
};

// ─── Tokenizer ──────────────────────────────────────────────
function tokenize(sql) {
  const tokens = [];
  let i = 0;
  const s = sql.trim();

  while (i < s.length) {
    // Skip whitespace
    if (/\s/.test(s[i])) { i++; continue; }

    // String literal
    if (s[i] === "'" || s[i] === '"') {
      const quote = s[i];
      let val = '';
      i++;
      while (i < s.length && s[i] !== quote) {
        if (s[i] === '\\') { i++; val += s[i] || ''; }
        else val += s[i];
        i++;
      }
      i++; // skip closing quote
      tokens.push({ type: 'STRING', value: val });
      continue;
    }

    // Number
    if (/[0-9]/.test(s[i]) || (s[i] === '-' && i + 1 < s.length && /[0-9]/.test(s[i + 1]) && (tokens.length === 0 || ['OP', 'COMMA', 'LPAREN', 'KEYWORD'].includes(tokens[tokens.length - 1]?.type)))) {
      let num = '';
      if (s[i] === '-') { num += s[i]; i++; }
      while (i < s.length && /[0-9.]/.test(s[i])) { num += s[i]; i++; }
      tokens.push({ type: 'NUMBER', value: parseFloat(num) });
      continue;
    }

    // Operators
    if (s[i] === '(' ) { tokens.push({ type: 'LPAREN', value: '(' }); i++; continue; }
    if (s[i] === ')' ) { tokens.push({ type: 'RPAREN', value: ')' }); i++; continue; }
    if (s[i] === ',' ) { tokens.push({ type: 'COMMA', value: ',' }); i++; continue; }
    if (s[i] === '*' ) { tokens.push({ type: 'STAR', value: '*' }); i++; continue; }
    if (s[i] === ';' ) { i++; continue; } // ignore semicolons

    // Two-char ops
    if (s[i] === '!' && s[i + 1] === '=') { tokens.push({ type: 'OP', value: '!=' }); i += 2; continue; }
    if (s[i] === '<' && s[i + 1] === '=') { tokens.push({ type: 'OP', value: '<=' }); i += 2; continue; }
    if (s[i] === '>' && s[i + 1] === '=') { tokens.push({ type: 'OP', value: '>=' }); i += 2; continue; }
    if (s[i] === '<' && s[i + 1] === '>') { tokens.push({ type: 'OP', value: '!=' }); i += 2; continue; }

    // Single-char ops
    if ('=<>+-/'.includes(s[i])) { tokens.push({ type: 'OP', value: s[i] }); i++; continue; }

    // Dot notation
    if (s[i] === '.') { tokens.push({ type: 'DOT', value: '.' }); i++; continue; }

    // Word (keyword or identifier)
    if (/[a-zA-Z_]/.test(s[i])) {
      let word = '';
      while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) { word += s[i]; i++; }
      const upper = word.toUpperCase();
      const KEYWORDS = [
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'ORDER', 'BY', 'ASC', 'DESC',
        'LIMIT', 'OFFSET', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'CROSS', 'ON', 'AS',
        'GROUP', 'HAVING', 'DISTINCT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL',
        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'UPPER', 'LOWER', 'LENGTH',
        'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
        'INTEGER', 'TEXT', 'REAL', 'BOOLEAN', 'DATE', 'PRIMARY', 'KEY',
        'TRUE', 'FALSE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      ];
      if (KEYWORDS.includes(upper)) {
        tokens.push({ type: 'KEYWORD', value: upper });
      } else {
        tokens.push({ type: 'IDENT', value: word });
      }
      continue;
    }

    // Unknown character — skip
    i++;
  }
  return tokens;
}

// ─── Parser helpers ─────────────────────────────────────────
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() { return this.tokens[this.pos] || null; }
  advance() { return this.tokens[this.pos++] || null; }

  expect(type, value) {
    const t = this.advance();
    if (!t) throw new Error(`Expected ${value || type} but reached end of query`);
    if (type && t.type !== type) throw new Error(`Expected ${value || type} but got "${t.value}"`);
    if (value && t.value !== value) throw new Error(`Expected "${value}" but got "${t.value}"`);
    return t;
  }

  match(type, value) {
    const t = this.peek();
    if (!t) return false;
    if (type && t.type !== type) return false;
    if (value !== undefined && t.value !== value) return false;
    return true;
  }

  matchKeyword(kw) { return this.match('KEYWORD', kw); }

  consumeIf(type, value) {
    if (this.match(type, value)) { this.advance(); return true; }
    return false;
  }
}

// ─── Expression evaluator ───────────────────────────────────
function resolveColumn(col, row, columns, tableName) {
  // Handle table.column notation
  const parts = col.split('.');
  const colName = parts.length > 1 ? parts[1] : parts[0];
  const idx = columns.indexOf(colName);
  if (idx === -1) {
    // Try with table prefix
    const prefixed = columns.findIndex((c) => c === colName || c.endsWith('.' + colName));
    if (prefixed === -1) return undefined;
    return row[prefixed];
  }
  return row[idx];
}

function evaluateExpr(expr, row, columns) {
  if (expr.type === 'literal') return expr.value;
  if (expr.type === 'column') return resolveColumn(expr.name, row, columns);
  if (expr.type === 'star') return '*';

  if (expr.type === 'function') {
    const fname = expr.name.toUpperCase();
    if (fname === 'UPPER') return String(evaluateExpr(expr.args[0], row, columns)).toUpperCase();
    if (fname === 'LOWER') return String(evaluateExpr(expr.args[0], row, columns)).toLowerCase();
    if (fname === 'LENGTH') return String(evaluateExpr(expr.args[0], row, columns)).length;
    // Aggregates are handled separately
    return null;
  }

  if (expr.type === 'binary') {
    const left = evaluateExpr(expr.left, row, columns);
    const right = evaluateExpr(expr.right, row, columns);
    switch (expr.op) {
      case '=':  return left == right; // eslint-disable-line eqeqeq
      case '!=': return left != right; // eslint-disable-line eqeqeq
      case '<':  return left < right;
      case '>':  return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      case '+':  return Number(left) + Number(right);
      case '-':  return Number(left) - Number(right);
      case '*':  return Number(left) * Number(right);
      case '/':  return Number(right) !== 0 ? Number(left) / Number(right) : null;
      default:   return null;
    }
  }

  if (expr.type === 'and') return evaluateExpr(expr.left, row, columns) && evaluateExpr(expr.right, row, columns);
  if (expr.type === 'or') return evaluateExpr(expr.left, row, columns) || evaluateExpr(expr.right, row, columns);
  if (expr.type === 'not') return !evaluateExpr(expr.expr, row, columns);

  if (expr.type === 'like') {
    const val = String(evaluateExpr(expr.expr, row, columns) || '');
    const pattern = expr.pattern.replace(/%/g, '.*').replace(/_/g, '.');
    return new RegExp(`^${pattern}$`, 'i').test(val);
  }

  if (expr.type === 'in') {
    const val = evaluateExpr(expr.expr, row, columns);
    return expr.values.some((v) => evaluateExpr(v, row, columns) == val); // eslint-disable-line eqeqeq
  }

  if (expr.type === 'between') {
    const val = evaluateExpr(expr.expr, row, columns);
    const lo = evaluateExpr(expr.low, row, columns);
    const hi = evaluateExpr(expr.high, row, columns);
    return val >= lo && val <= hi;
  }

  if (expr.type === 'is_null') return evaluateExpr(expr.expr, row, columns) === null || evaluateExpr(expr.expr, row, columns) === undefined;
  if (expr.type === 'is_not_null') return evaluateExpr(expr.expr, row, columns) !== null && evaluateExpr(expr.expr, row, columns) !== undefined;

  if (expr.type === 'case') {
    for (const when of expr.whens) {
      if (evaluateExpr(when.condition, row, columns)) {
        return evaluateExpr(when.result, row, columns);
      }
    }
    return expr.elseResult ? evaluateExpr(expr.elseResult, row, columns) : null;
  }

  return null;
}

// ─── Parse expressions ──────────────────────────────────────
function parseExpression(parser, precedence = 0) {
  let left = parsePrimary(parser);

  while (true) {
    const t = parser.peek();
    if (!t) break;

    // AND / OR
    if (t.type === 'KEYWORD' && t.value === 'AND' && precedence < 2) {
      parser.advance();
      const right = parseExpression(parser, 2);
      left = { type: 'and', left, right };
      continue;
    }
    if (t.type === 'KEYWORD' && t.value === 'OR' && precedence < 1) {
      parser.advance();
      const right = parseExpression(parser, 1);
      left = { type: 'or', left, right };
      continue;
    }

    // Comparison operators
    if (t.type === 'OP' && ['=', '!=', '<', '>', '<=', '>='].includes(t.value) && precedence < 3) {
      parser.advance();
      const right = parseExpression(parser, 3);
      left = { type: 'binary', op: t.value, left, right };
      continue;
    }

    // + -
    if (t.type === 'OP' && ['+', '-'].includes(t.value) && precedence < 4) {
      parser.advance();
      const right = parseExpression(parser, 4);
      left = { type: 'binary', op: t.value, left, right };
      continue;
    }

    // * /
    if (t.type === 'OP' && ['*', '/'].includes(t.value) && precedence < 5) {
      parser.advance();
      const right = parseExpression(parser, 5);
      left = { type: 'binary', op: t.value, left, right };
      continue;
    }

    // LIKE
    if (t.type === 'KEYWORD' && t.value === 'LIKE') {
      parser.advance();
      const pat = parser.advance();
      left = { type: 'like', expr: left, pattern: pat.value };
      continue;
    }

    // IN (...)
    if (t.type === 'KEYWORD' && t.value === 'IN') {
      parser.advance();
      parser.expect('LPAREN');
      const values = [];
      values.push(parseExpression(parser, 0));
      while (parser.consumeIf('COMMA')) values.push(parseExpression(parser, 0));
      parser.expect('RPAREN');
      left = { type: 'in', expr: left, values };
      continue;
    }

    // BETWEEN ... AND ...
    if (t.type === 'KEYWORD' && t.value === 'BETWEEN') {
      parser.advance();
      const low = parseExpression(parser, 3);
      parser.expect('KEYWORD', 'AND');
      const high = parseExpression(parser, 3);
      left = { type: 'between', expr: left, low, high };
      continue;
    }

    // IS NULL / IS NOT NULL
    if (t.type === 'KEYWORD' && t.value === 'IS') {
      parser.advance();
      if (parser.matchKeyword('NOT')) {
        parser.advance();
        parser.expect('KEYWORD', 'NULL');
        left = { type: 'is_not_null', expr: left };
      } else {
        parser.expect('KEYWORD', 'NULL');
        left = { type: 'is_null', expr: left };
      }
      continue;
    }

    // AS alias (for SELECT expressions)
    if (t.type === 'KEYWORD' && t.value === 'AS') break;

    break;
  }

  return left;
}

function parsePrimary(parser) {
  const t = parser.peek();
  if (!t) throw new Error('Unexpected end of expression');

  // NOT
  if (t.type === 'KEYWORD' && t.value === 'NOT') {
    parser.advance();
    return { type: 'not', expr: parseExpression(parser, 5) };
  }

  // CASE WHEN
  if (t.type === 'KEYWORD' && t.value === 'CASE') {
    parser.advance();
    const whens = [];
    while (parser.matchKeyword('WHEN')) {
      parser.advance();
      const condition = parseExpression(parser, 0);
      parser.expect('KEYWORD', 'THEN');
      const result = parseExpression(parser, 0);
      whens.push({ condition, result });
    }
    let elseResult = null;
    if (parser.matchKeyword('ELSE')) {
      parser.advance();
      elseResult = parseExpression(parser, 0);
    }
    parser.expect('KEYWORD', 'END');
    return { type: 'case', whens, elseResult };
  }

  // Parenthesized expression
  if (t.type === 'LPAREN') {
    parser.advance();
    const expr = parseExpression(parser, 0);
    parser.expect('RPAREN');
    return expr;
  }

  // * (star)
  if (t.type === 'STAR') {
    parser.advance();
    return { type: 'star' };
  }

  // NULL
  if (t.type === 'KEYWORD' && t.value === 'NULL') {
    parser.advance();
    return { type: 'literal', value: null };
  }

  // TRUE / FALSE
  if (t.type === 'KEYWORD' && (t.value === 'TRUE' || t.value === 'FALSE')) {
    parser.advance();
    return { type: 'literal', value: t.value === 'TRUE' };
  }

  // Number
  if (t.type === 'NUMBER') {
    parser.advance();
    return { type: 'literal', value: t.value };
  }

  // String
  if (t.type === 'STRING') {
    parser.advance();
    return { type: 'literal', value: t.value };
  }

  // Function call or identifier
  if (t.type === 'IDENT' || t.type === 'KEYWORD') {
    const AGGREGATE_FNS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];
    const SCALAR_FNS = ['UPPER', 'LOWER', 'LENGTH'];
    const upper = t.value.toUpperCase();

    if ([...AGGREGATE_FNS, ...SCALAR_FNS].includes(upper)) {
      parser.advance();
      if (parser.match('LPAREN')) {
        parser.advance();
        const args = [];
        if (!parser.match('RPAREN')) {
          args.push(parseExpression(parser, 0));
          while (parser.consumeIf('COMMA')) args.push(parseExpression(parser, 0));
        }
        parser.expect('RPAREN');
        return { type: 'function', name: upper, args };
      }
      // Not a function call, treat as identifier
      let name = t.value;
      if (parser.match('DOT')) {
        parser.advance();
        const col = parser.advance();
        name = `${name}.${col.value}`;
      }
      return { type: 'column', name };
    }

    parser.advance();
    let name = t.value;
    // Dot notation: table.column
    if (parser.match('DOT')) {
      parser.advance();
      const col = parser.advance();
      name = `${name}.${col.value}`;
    }
    return { type: 'column', name };
  }

  throw new Error(`Unexpected token: ${t.value}`);
}

// ─── Parse a full SELECT query ──────────────────────────────
function parseSelect(parser) {
  parser.expect('KEYWORD', 'SELECT');

  let distinct = false;
  if (parser.matchKeyword('DISTINCT')) {
    parser.advance();
    distinct = true;
  }

  // SELECT columns
  const selectExprs = [];
  do {
    const expr = parseExpression(parser, 0);
    let alias = null;
    if (parser.matchKeyword('AS')) {
      parser.advance();
      alias = parser.advance().value;
    } else if (parser.match('IDENT') && !parser.matchKeyword('FROM')) {
      // Implicit alias (without AS)
      alias = parser.advance().value;
    }
    selectExprs.push({ expr, alias });
  } while (parser.consumeIf('COMMA'));

  // FROM
  parser.expect('KEYWORD', 'FROM');
  const table = parser.advance().value;
  let tableAlias = null;
  if (parser.matchKeyword('AS')) {
    parser.advance();
    tableAlias = parser.advance().value;
  } else if (parser.match('IDENT')) {
    // Implicit alias — the next token is an IDENT (not a keyword like WHERE, JOIN, etc.)
    // Since keywords are tokenized as 'KEYWORD' type, an 'IDENT' here is safe to consume as alias
    tableAlias = parser.advance().value;
  }

  // JOINs
  const joins = [];
  while (parser.matchKeyword('JOIN') || parser.matchKeyword('INNER') || parser.matchKeyword('LEFT') || parser.matchKeyword('RIGHT') || parser.matchKeyword('CROSS')) {
    let joinType = 'INNER';
    const t = parser.advance();
    if (['LEFT', 'RIGHT', 'CROSS', 'INNER'].includes(t.value)) {
      joinType = t.value;
      parser.expect('KEYWORD', 'JOIN');
    }
    const joinTable = parser.advance().value;
    let joinAlias = null;
    if (parser.match('IDENT') && !parser.matchKeyword('ON')) {
      joinAlias = parser.advance().value;
    }
    if (parser.matchKeyword('AS')) {
      parser.advance();
      joinAlias = parser.advance().value;
    }
    let onExpr = null;
    if (parser.matchKeyword('ON')) {
      parser.advance();
      onExpr = parseExpression(parser, 0);
    }
    joins.push({ type: joinType, table: joinTable, alias: joinAlias, on: onExpr });
  }

  // WHERE
  let where = null;
  if (parser.matchKeyword('WHERE')) {
    parser.advance();
    where = parseExpression(parser, 0);
  }

  // GROUP BY
  let groupBy = null;
  if (parser.matchKeyword('GROUP')) {
    parser.advance();
    parser.expect('KEYWORD', 'BY');
    groupBy = [];
    do {
      groupBy.push(parseExpression(parser, 0));
    } while (parser.consumeIf('COMMA'));
  }

  // HAVING
  let having = null;
  if (parser.matchKeyword('HAVING')) {
    parser.advance();
    having = parseExpression(parser, 0);
  }

  // ORDER BY
  let orderBy = null;
  if (parser.matchKeyword('ORDER')) {
    parser.advance();
    parser.expect('KEYWORD', 'BY');
    orderBy = [];
    do {
      const expr = parseExpression(parser, 0);
      let dir = 'ASC';
      if (parser.matchKeyword('ASC')) { parser.advance(); dir = 'ASC'; }
      else if (parser.matchKeyword('DESC')) { parser.advance(); dir = 'DESC'; }
      orderBy.push({ expr, dir });
    } while (parser.consumeIf('COMMA'));
  }

  // LIMIT
  let limit = null;
  let offset = null;
  if (parser.matchKeyword('LIMIT')) {
    parser.advance();
    limit = parser.advance().value;
    if (parser.matchKeyword('OFFSET')) {
      parser.advance();
      offset = parser.advance().value;
    }
  }

  return { type: 'SELECT', distinct, selectExprs, table, tableAlias, joins, where, groupBy, having, orderBy, limit, offset };
}

// ─── Execute SELECT ─────────────────────────────────────────
function executeSelect(query, tables) {
  const db = { ...tables };

  // Get base table
  const baseTable = db[query.table] || db[query.table.toLowerCase()];
  if (!baseTable) throw new Error(`Table "${query.table}" not found. Available: ${Object.keys(db).join(', ')}`);

  let columns = [...baseTable.columns];
  let rows = baseTable.rows.map((r) => [...r]);

  // Apply JOINs
  for (const join of query.joins) {
    const joinTable = db[join.table] || db[join.table.toLowerCase()];
    if (!joinTable) throw new Error(`Table "${join.table}" not found`);

    const leftCols = columns;
    const rightCols = joinTable.columns;
    const newColumns = [
      ...leftCols.map((c) => c),
      ...rightCols.map((c) => {
        // Prefix with table name if ambiguous
        return leftCols.includes(c) ? `${join.alias || join.table}.${c}` : c;
      }),
    ];

    const newRows = [];
    for (const leftRow of rows) {
      let matched = false;
      for (const rightRow of joinTable.rows) {
        const combinedRow = [...leftRow, ...rightRow];
        if (!join.on || evaluateExpr(join.on, combinedRow, newColumns)) {
          newRows.push(combinedRow);
          matched = true;
        }
      }
      if (!matched && join.type === 'LEFT') {
        newRows.push([...leftRow, ...rightCols.map(() => null)]);
      }
    }
    columns = newColumns;
    rows = newRows;
  }

  // Apply WHERE
  if (query.where) {
    rows = rows.filter((row) => evaluateExpr(query.where, row, columns));
  }

  // Check if we have aggregate functions
  const hasAggregates = query.selectExprs.some((se) => containsAggregate(se.expr));

  if (query.groupBy || hasAggregates) {
    // GROUP BY
    const groups = new Map();

    if (query.groupBy) {
      for (const row of rows) {
        const key = query.groupBy.map((g) => evaluateExpr(g, row, columns)).join('|||');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(row);
      }
    } else {
      // No GROUP BY but has aggregates — treat whole result as one group
      groups.set('__all__', rows);
    }

    // Build result rows from groups
    const resultRows = [];
    for (const [, groupRows] of groups) {
      const resultRow = query.selectExprs.map((se) =>
        evaluateWithAggregates(se.expr, groupRows, columns)
      );
      // Check HAVING
      if (query.having) {
        // Evaluate HAVING in the context of group aggregate
        const havingResult = evaluateHaving(query.having, groupRows, columns);
        if (!havingResult) continue;
      }
      resultRows.push(resultRow);
    }

    // Build result columns
    const resultColumns = query.selectExprs.map((se, i) => {
      if (se.alias) return se.alias;
      return exprToString(se.expr);
    });

    columns = resultColumns;
    rows = resultRows;
  } else {
    // No aggregates — evaluate select expressions
    const isSelectAll = query.selectExprs.length === 1 && query.selectExprs[0].expr.type === 'star';

    if (!isSelectAll) {
      const resultColumns = query.selectExprs.map((se) =>
        se.alias || exprToString(se.expr)
      );
      rows = rows.map((row) =>
        query.selectExprs.map((se) => evaluateExpr(se.expr, row, columns))
      );
      columns = resultColumns;
    }
  }

  // DISTINCT
  if (query.distinct) {
    const seen = new Set();
    rows = rows.filter((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // ORDER BY
  if (query.orderBy) {
    rows.sort((a, b) => {
      for (const ob of query.orderBy) {
        const aVal = evaluateExpr(ob.expr, a, columns);
        const bVal = evaluateExpr(ob.expr, b, columns);
        let cmp = 0;
        if (aVal == null && bVal == null) cmp = 0;
        else if (aVal == null) cmp = -1;
        else if (bVal == null) cmp = 1;
        else if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
        else cmp = String(aVal).localeCompare(String(bVal));
        if (ob.dir === 'DESC') cmp = -cmp;
        if (cmp !== 0) return cmp;
      }
      return 0;
    });
  }

  // LIMIT / OFFSET
  if (query.limit !== null && query.limit !== undefined) {
    const off = query.offset || 0;
    rows = rows.slice(off, off + query.limit);
  }

  return { columns, rows };
}

function containsAggregate(expr) {
  if (!expr) return false;
  if (expr.type === 'function' && ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'].includes(expr.name)) return true;
  if (expr.left && containsAggregate(expr.left)) return true;
  if (expr.right && containsAggregate(expr.right)) return true;
  if (expr.args) return expr.args.some(containsAggregate);
  return false;
}

function evaluateWithAggregates(expr, groupRows, columns) {
  if (expr.type === 'function') {
    const fname = expr.name;
    const arg = expr.args[0];
    const AGGREGATES = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];
    if (AGGREGATES.includes(fname)) {
      if (fname === 'COUNT') {
        if (arg.type === 'star') return groupRows.length;
        return groupRows.filter((r) => evaluateExpr(arg, r, columns) !== null && evaluateExpr(arg, r, columns) !== undefined).length;
      }
      const vals = groupRows.map((r) => evaluateExpr(arg, r, columns)).filter((v) => v !== null && v !== undefined).map(Number);
      if (fname === 'SUM') return vals.reduce((a, b) => a + b, 0);
      if (fname === 'AVG') return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null;
      if (fname === 'MIN') return vals.length ? Math.min(...vals) : null;
      if (fname === 'MAX') return vals.length ? Math.max(...vals) : null;
    }
    // Scalar function — use first row
    return evaluateExpr(expr, groupRows[0], columns);
  }
  if (expr.type === 'column') return evaluateExpr(expr, groupRows[0], columns);
  if (expr.type === 'literal') return expr.value;
  if (expr.type === 'binary') {
    const left = evaluateWithAggregates(expr.left, groupRows, columns);
    const right = evaluateWithAggregates(expr.right, groupRows, columns);
    switch (expr.op) {
      case '+': return Number(left) + Number(right);
      case '-': return Number(left) - Number(right);
      case '*': return Number(left) * Number(right);
      case '/': return Number(right) !== 0 ? Number(left) / Number(right) : null;
      default: return null;
    }
  }
  if (expr.type === 'case') {
    for (const when of expr.whens) {
      if (evaluateWithAggregates(when.condition, groupRows, columns)) {
        return evaluateWithAggregates(when.result, groupRows, columns);
      }
    }
    return expr.elseResult ? evaluateWithAggregates(expr.elseResult, groupRows, columns) : null;
  }
  return evaluateExpr(expr, groupRows[0], columns);
}

function evaluateHaving(expr, groupRows, columns) {
  if (expr.type === 'binary' && ['=', '!=', '<', '>', '<=', '>='].includes(expr.op)) {
    const left = containsAggregate(expr.left)
      ? evaluateWithAggregates(expr.left, groupRows, columns)
      : evaluateWithAggregates(expr.left, groupRows, columns);
    const right = containsAggregate(expr.right)
      ? evaluateWithAggregates(expr.right, groupRows, columns)
      : evaluateWithAggregates(expr.right, groupRows, columns);
    switch (expr.op) {
      case '=':  return left == right; // eslint-disable-line eqeqeq
      case '!=': return left != right; // eslint-disable-line eqeqeq
      case '<':  return left < right;
      case '>':  return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
    }
  }
  if (expr.type === 'and') return evaluateHaving(expr.left, groupRows, columns) && evaluateHaving(expr.right, groupRows, columns);
  if (expr.type === 'or') return evaluateHaving(expr.left, groupRows, columns) || evaluateHaving(expr.right, groupRows, columns);
  return !!evaluateWithAggregates(expr, groupRows, columns);
}

function exprToString(expr) {
  if (expr.type === 'star') return '*';
  if (expr.type === 'column') return expr.name;
  if (expr.type === 'literal') return String(expr.value);
  if (expr.type === 'function') return `${expr.name}(${expr.args.map(exprToString).join(', ')})`;
  if (expr.type === 'binary') return `${exprToString(expr.left)} ${expr.op} ${exprToString(expr.right)}`;
  return '?';
}

// ─── Execute INSERT ─────────────────────────────────────────
function executeInsert(tokens, tables) {
  const p = new Parser(tokens);
  p.expect('KEYWORD', 'INSERT');
  p.expect('KEYWORD', 'INTO');
  const tableName = p.advance().value;

  const resolvedName = tables[tableName] ? tableName : tableName.toLowerCase();
  const table = tables[resolvedName];
  if (!table) throw new Error(`Table "${tableName}" not found`);

  let cols = null;
  if (p.match('LPAREN')) {
    p.advance();
    cols = [];
    do {
      cols.push(p.advance().value);
    } while (p.consumeIf('COMMA'));
    p.expect('RPAREN');
  }

  p.expect('KEYWORD', 'VALUES');
  p.expect('LPAREN');
  const values = [];
  do {
    const expr = parseExpression(p, 0);
    values.push(expr.value !== undefined ? expr.value : null);
  } while (p.consumeIf('COMMA'));
  p.expect('RPAREN');

  let newRow;
  if (cols) {
    newRow = table.columns.map((c) => {
      const idx = cols.indexOf(c);
      return idx >= 0 ? values[idx] : null;
    });
  } else {
    newRow = values;
  }

  // Avoid mutating the original table — replace the rows array immutably
  tables[resolvedName] = {
    ...table,
    rows: [...table.rows, newRow],
  };

  return { message: `1 row inserted into "${tableName}"`, affectedRows: 1 };
}

// ─── Execute UPDATE ─────────────────────────────────────────
function executeUpdate(tokens, tables) {
  const p = new Parser(tokens);
  p.expect('KEYWORD', 'UPDATE');
  const tableName = p.advance().value;

  const resolvedName = tables[tableName] ? tableName : tableName.toLowerCase();
  const table = tables[resolvedName];
  if (!table) throw new Error(`Table "${tableName}" not found`);

  p.expect('KEYWORD', 'SET');
  const sets = [];
  do {
    const col = p.advance().value;
    p.expect('OP', '=');
    const expr = parseExpression(p, 0);
    sets.push({ col, expr });
  } while (p.consumeIf('COMMA'));

  let where = null;
  if (p.matchKeyword('WHERE')) {
    p.advance();
    where = parseExpression(p, 0);
  }

  let count = 0;
  // Build new rows array immutably instead of mutating existing rows
  const newRows = table.rows.map((row) => {
    if (!where || evaluateExpr(where, row, table.columns)) {
      const updatedRow = [...row];
      for (const s of sets) {
        const idx = table.columns.indexOf(s.col);
        if (idx >= 0) updatedRow[idx] = evaluateExpr(s.expr, row, table.columns);
      }
      count++;
      return updatedRow;
    }
    return [...row];
  });

  tables[resolvedName] = { ...table, rows: newRows };

  return { message: `${count} row(s) updated in "${tableName}"`, affectedRows: count };
}

// ─── Execute DELETE ─────────────────────────────────────────
function executeDelete(tokens, tables) {
  const p = new Parser(tokens);
  p.expect('KEYWORD', 'DELETE');
  p.expect('KEYWORD', 'FROM');
  const tableName = p.advance().value;

  const resolvedName = tables[tableName] ? tableName : tableName.toLowerCase();
  const table = tables[resolvedName];
  if (!table) throw new Error(`Table "${tableName}" not found`);

  let where = null;
  if (p.matchKeyword('WHERE')) {
    p.advance();
    where = parseExpression(p, 0);
  }

  const before = table.rows.length;
  let filteredRows;
  if (where) {
    filteredRows = table.rows.filter((row) => !evaluateExpr(where, row, table.columns));
  } else {
    filteredRows = [];
  }
  const count = before - filteredRows.length;

  // Replace table reference immutably instead of mutating
  tables[resolvedName] = { ...table, rows: filteredRows };

  return { message: `${count} row(s) deleted from "${tableName}"`, affectedRows: count };
}

// ─── Execute CREATE TABLE ───────────────────────────────────
function executeCreate(tokens, tables) {
  const p = new Parser(tokens);
  p.expect('KEYWORD', 'CREATE');
  p.expect('KEYWORD', 'TABLE');
  const tableName = p.advance().value;

  if (tables[tableName]) throw new Error(`Table "${tableName}" already exists`);

  p.expect('LPAREN');
  const columns = [];
  do {
    const colName = p.advance().value;
    // Consume type (optional)
    if (p.peek() && ['KEYWORD', 'IDENT'].includes(p.peek().type) && !p.match('COMMA') && !p.match('RPAREN')) {
      p.advance(); // type
      // PRIMARY KEY
      if (p.matchKeyword('PRIMARY')) { p.advance(); p.expect('KEYWORD', 'KEY'); }
    }
    columns.push(colName);
  } while (p.consumeIf('COMMA'));
  p.expect('RPAREN');

  tables[tableName] = { columns, rows: [] };
  return { message: `Table "${tableName}" created with columns: ${columns.join(', ')}`, affectedRows: 0 };
}

// ─── Main execute function ──────────────────────────────────
export function executeSQL(sql, tables) {
  // Input validation
  if (sql == null || typeof sql !== 'string') {
    throw new Error('Query must be a non-empty string');
  }

  const trimmed = sql.trim();
  if (!trimmed) throw new Error('Empty query');

  if (!tables || typeof tables !== 'object') {
    throw new Error('Invalid database tables object');
  }

  let tokens;
  try {
    tokens = tokenize(trimmed);
  } catch (err) {
    throw new Error(`Syntax error: Unable to parse query — ${err?.message || 'unknown tokenization error'}`);
  }

  if (!tokens || tokens.length === 0) throw new Error('Empty query — no valid tokens found');

  const firstKeyword = tokens[0].value?.toUpperCase();

  try {
    switch (firstKeyword) {
      case 'SELECT': {
        const parser = new Parser(tokens);
        const query = parseSelect(parser);
        const result = executeSelect(query, tables);
        return { type: 'result', ...result };
      }
      case 'INSERT':
        return { type: 'message', ...executeInsert(tokens, tables) };
      case 'UPDATE':
        return { type: 'message', ...executeUpdate(tokens, tables) };
      case 'DELETE':
        return { type: 'message', ...executeDelete(tokens, tables) };
      case 'CREATE':
        return { type: 'message', ...executeCreate(tokens, tables) };
      default:
        throw new Error(`Unsupported statement: "${firstKeyword}". Supported: SELECT, INSERT, UPDATE, DELETE, CREATE TABLE`);
    }
  } catch (err) {
    // Re-throw with clearer context if it's a raw error
    if (err?.message) throw err;
    throw new Error(`Query execution failed: ${String(err)}`);
  }
}

// ─── Sample queries for learning ────────────────────────────
export const SAMPLE_QUERIES = [
  {
    category: 'Basics',
    queries: [
      { label: 'Select All Employees', sql: 'SELECT * FROM employees;' },
      { label: 'Select Specific Columns', sql: 'SELECT name, department, salary FROM employees;' },
      { label: 'Select with Alias', sql: 'SELECT name AS employee_name, salary AS annual_salary FROM employees;' },
      { label: 'Distinct Departments', sql: 'SELECT DISTINCT department FROM employees;' },
    ],
  },
  {
    category: 'Filtering (WHERE)',
    queries: [
      { label: 'Filter by Department', sql: "SELECT * FROM employees WHERE department = 'Engineering';" },
      { label: 'Salary Range', sql: 'SELECT name, salary FROM employees WHERE salary > 80000;' },
      { label: 'Multiple Conditions', sql: "SELECT name, salary FROM employees\nWHERE department = 'Engineering' AND salary > 90000;" },
      { label: 'LIKE Pattern', sql: "SELECT * FROM products WHERE name LIKE '%Desk%';" },
      { label: 'IN Clause', sql: "SELECT * FROM employees WHERE department IN ('Engineering', 'Sales');" },
      { label: 'BETWEEN', sql: 'SELECT name, price FROM products WHERE price BETWEEN 100 AND 500;' },
      { label: 'IS NULL', sql: 'SELECT name, manager_id FROM employees WHERE manager_id IS NULL;' },
    ],
  },
  {
    category: 'Sorting & Limiting',
    queries: [
      { label: 'Order by Salary (DESC)', sql: 'SELECT name, salary FROM employees ORDER BY salary DESC;' },
      { label: 'Top 5 Expensive Products', sql: 'SELECT name, price FROM products ORDER BY price DESC LIMIT 5;' },
      { label: 'Pagination (Page 2)', sql: 'SELECT * FROM employees ORDER BY id LIMIT 5 OFFSET 5;' },
    ],
  },
  {
    category: 'Aggregation',
    queries: [
      { label: 'Count Employees', sql: 'SELECT COUNT(*) AS total_employees FROM employees;' },
      { label: 'Average Salary by Dept', sql: 'SELECT department, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department;' },
      { label: 'Department Stats', sql: 'SELECT department,\n  COUNT(*) AS headcount,\n  MIN(salary) AS min_sal,\n  MAX(salary) AS max_sal,\n  AVG(salary) AS avg_sal\nFROM employees\nGROUP BY department;' },
      { label: 'HAVING Filter', sql: 'SELECT department, COUNT(*) AS cnt\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 2;' },
      { label: 'Total Revenue by Product', sql: 'SELECT p.name, SUM(o.quantity * p.price) AS total_revenue\nFROM orders o\nJOIN products p ON o.product_id = p.id\nGROUP BY p.name\nORDER BY total_revenue DESC;' },
    ],
  },
  {
    category: 'Joins',
    queries: [
      { label: 'Inner Join', sql: 'SELECT o.id, p.name, o.quantity, o.status\nFROM orders o\nJOIN products p ON o.product_id = p.id;' },
      { label: 'Left Join', sql: 'SELECT d.name AS dept, e.name AS employee\nFROM departments d\nLEFT JOIN employees e ON d.name = e.department;' },
      { label: 'Orders with Product Info', sql: "SELECT o.customer_name, p.name AS product, o.quantity, p.price,\n  o.quantity * p.price AS total\nFROM orders o\nJOIN products p ON o.product_id = p.id\nWHERE o.status = 'delivered'\nORDER BY total DESC;" },
    ],
  },
  {
    category: 'Data Modification',
    queries: [
      { label: 'Insert Employee', sql: "INSERT INTO employees VALUES (11, 'New Person', 'Engineering', 75000, '2024-06-01', 1);" },
      { label: 'Update Salary', sql: "UPDATE employees SET salary = 100000 WHERE name = 'Alice Johnson';" },
      { label: 'Delete by Condition', sql: "DELETE FROM orders WHERE status = 'pending';" },
    ],
  },
];
