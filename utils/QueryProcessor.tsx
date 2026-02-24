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

  return "";
}
