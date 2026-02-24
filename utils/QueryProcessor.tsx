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

  const plusMatch = query.match(/what is (\d+) plus (\d+)/i);
  if (plusMatch) {
    const sum = parseInt(plusMatch[1], 10) + parseInt(plusMatch[2], 10);
    return String(sum);
  }

  const minusMatch = query.match(/what is (\d+) minus (\d+)/i);
  if (minusMatch) {
    const diff =
      parseInt(minusMatch[1], 10) - parseInt(minusMatch[2], 10);
    return String(diff);
  }

  const multipliedMatch = query.match(
    /what is (\d+) multiplied by (\d+)/i
  );
  if (multipliedMatch) {
    const product =
      parseInt(multipliedMatch[1], 10) * parseInt(multipliedMatch[2], 10);
    return String(product);
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

  return "";
}
