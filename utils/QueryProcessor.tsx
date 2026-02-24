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
        result = a.value ** b.value;
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
    if (!applyAt(idx, tokens[idx].value)) return null;
  }

  if (tokens.length !== 1 || tokens[0].type !== "num") return null;
  return tokens[0].value;
}

export { evalArithmetic };

export default function QueryProcessor(query: string): string {
  if (query.toLowerCase().includes("shakespeare")) {
    return (
      "William Shakespeare (26 April 1564 - 23 April 1616) was an " +
      "English poet, playwright, and actor, widely regarded as the greatest " +
      "writer in the English language and the world's pre-eminent dramatist."
    );
  }

  if (query.toLowerCase().includes("name")) {
    return "Jai";
  }

  if (query.toLowerCase().includes("andrew id")) {
    return "jnukala";
  }

  const largestMatch = query.match(
    /which of the following numbers is the largest:\s*([\d,\s]+)/i
  );
  if (largestMatch) {
    const numbers = largestMatch[1]
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    if (numbers.length > 0) {
      return String(Math.max(...numbers));
    }
  }

  // Generic arithmetic: "what is <expr>?" with correct order of operations
  // Precedence: power (right-assoc) > multiplied by > plus/minus (left to right)
  const whatIsMatch = query.match(/what is\s+([^?]+)\??/i);
  if (whatIsMatch) {
    const expr = whatIsMatch[1].trim();
    if (/^\d[\d\s]*(?:to the power of|multiplied by|plus|minus)[\d\s]*\d/.test(expr)) {
      const result = evalArithmetic(expr);
      if (result !== null) return String(result);
    }
  }

  const squareAndCubeMatch = query.match(
    /which of the following numbers is both a square and a cube:\s*([\d,\s]+)/i
  );
  if (squareAndCubeMatch) {
    const numbers = squareAndCubeMatch[1]
      .split(",")
      .map((s) => parseInt(s.trim().replace(/\D+$/, ""), 10))
      .filter((n) => !isNaN(n) && n > 0);
    const isPerfectSquare = (n: number) => {
      const r = Math.round(Math.sqrt(n));
      return r * r === n;
    };
    const isPerfectCube = (n: number) => {
      const r = Math.round(Math.cbrt(n));
      return r * r * r === n;
    };
    const both = numbers.filter(
      (n) => isPerfectSquare(n) && isPerfectCube(n)
    );
    if (both.length > 0) {
      return both.join(", ");
    }
  }

  const primesMatch = query.match(
    /which of the following numbers are primes?:\s*([\d,\s]+)/i
  );
  if (primesMatch) {
    const numbers = primesMatch[1]
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 2);
    const isPrime = (n: number) => {
      if (n < 2) return false;
      if (n === 2) return true;
      if (n % 2 === 0) return false;
      for (let d = 3; d * d <= n; d += 2) {
        if (n % d === 0) return false;
      }
      return true;
    };
    const primes = numbers.filter(isPrime);
    if (primes.length > 0) {
      return primes.join(", ");
    }
  }

  // Scrabble score: "what is the scrabble score of <word>?"
  const scrabbleMatch = query.match(/what is the scrabble score of\s+(\w+)\s*\??/i);
  if (scrabbleMatch) {
    const word = scrabbleMatch[1].toLowerCase().replace(/[^a-z]/g, "");
    const scrabbleScores: Record<string, number> = {
      a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1, j: 8, k: 5, l: 1,
      m: 3, n: 1, o: 1, p: 3, q: 10, r: 1, s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4, z: 10,
    };
    let score = 0;
    for (const c of word) score += scrabbleScores[c] ?? 0;
    if (word.length > 0) return String(score);
  }

  // Anagram: "which of the following is an anagram of X: A, B, C?"
  const anagramMatch = query.match(
    /which of the following is an anagram of\s+(\w+)\s*:\s*([^?]+)/i
  );
  if (anagramMatch) {
    const target = anagramMatch[1].toLowerCase().replace(/[^a-z]/g, "");
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z]/g, "")
        .split("")
        .sort()
        .join("");
    const targetNorm = normalize(target);
    const options = anagramMatch[2]
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const match = options.find((opt) => normalize(opt) === targetNorm && opt.toLowerCase() !== target.toLowerCase());
    if (match) return match.trim();
  }

  return "";
}
