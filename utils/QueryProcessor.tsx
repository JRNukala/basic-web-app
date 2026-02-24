type Token = { type: "num"; value: bigint } | { type: "op"; value: string };

function tokenizeArithmetic(expr: string): Token[] | null {
  const tokens: Token[] = [];
  // Match number or operator (operators in order so longer phrases match first)
  const opPattern = /\s*(\d+)\s*|\s*(to\s+the\s+power\s+of|multiplied\s+by|plus|minus)\s*/gi;
  let m: RegExpExecArray | null;
  while ((m = opPattern.exec(expr)) !== null) {
    if (m[1] !== undefined && m[1] !== "") {
      tokens.push({ type: "num", value: BigInt(m[1]) });
    } else if (m[2] !== undefined && m[2] !== "") {
      tokens.push({ type: "op", value: m[2].toLowerCase().replace(/\s+/g, " ") });
    }
  }
  return tokens.length >= 2 && tokens[0].type === "num" ? tokens : null;
}

function evalArithmetic(expr: string): bigint | null {
  const tokens = tokenizeArithmetic(expr.trim());
  if (!tokens || tokens.length < 2) return null;

  const applyAt = (i: number, op: string): boolean => {
    if (i <= 0 || i >= tokens.length - 1) return false;
    const a = tokens[i - 1];
    const b = tokens[i + 1];
    if (a.type !== "num" || b.type !== "num") return false;
    let result: bigint;
    switch (op) {
      case "to the power of": {
        const exp = Number(b.value);
        if (exp < 0 || exp > 10000) return false;
        let r = BigInt(1);
        for (let i = 0; i < exp; i++) r = r * a.value;
        result = r;
        break;
      }
      case "multiplied by":
        result = a.value * b.value;
        break;
      case "plus":
        result = a.value + b.value;
        break;
      case "minus":
        result = a.value - b.value;
        break;
      default:
        return false;
    }
    tokens.splice(i - 1, 3, { type: "num", value: result });
    return true;
  };

  // 1. Powers (right-associative: rightmost first)
  for (let pass = 0; pass < 1000; pass++) {
    let idx = -1;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "op" && tokens[i].value === "to the power of") {
        idx = i;
      }
    }
    if (idx === -1) break;
    if (!applyAt(idx, "to the power of")) return null;
  }

  // 2. Multiplications (left to right)
  for (let pass = 0; pass < 1000; pass++) {
    const idx = tokens.findIndex(
      (t) => t.type === "op" && t.value === "multiplied by"
    );
    if (idx === -1) break;
    if (!applyAt(idx, "multiplied by")) return null;
  }

  // 3. Plus and minus (left to right)
  for (let pass = 0; pass < 1000; pass++) {
    const idx = tokens.findIndex(
      (t) => t.type === "op" && (t.value === "plus" || t.value === "minus")
    );
    if (idx === -1) break;
    const opToken = tokens[idx];
    if (opToken.type !== "op" || !applyAt(idx, opToken.value)) return null;
  }

  if (tokens.length !== 1 || tokens[0].type !== "num") return null;
  return tokens[0].value;
}

export { evalArithmetic };

