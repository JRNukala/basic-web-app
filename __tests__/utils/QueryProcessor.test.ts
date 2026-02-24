import QueryProcessor from "../../utils/QueryProcessor";
import '@testing-library/jest-dom'

describe("QueryProcessor", () => {
    test("should return a string", () => {
        const query = "test";
        const response: string = QueryProcessor(query);
        expect(typeof response).toBe("string");
    });

    test('should return shakespeare description', () => {
        const query = "shakespeare";
        const response: string = QueryProcessor(query);
        expect(response).toBe((
            "William Shakespeare (26 April 1564 - 23 April 1616) was an " +
            "English poet, playwright, and actor, widely regarded as the greatest " +
            "writer in the English language and the world's pre-eminent dramatist."
          ));
    });

    test('should return name', () => {
        const query = "What is your name?";
        const response: string = QueryProcessor(query);
        expect(response).toBe("Jai");
    });

    test('should return Andrew ID', () => {
        const query = "What is your Andrew ID?";
        const response: string = QueryProcessor(query);
        expect(response).toBe("jnukala");
    });

    test('should return largest number', () => {
        const query = "Which of the following numbers is the largest: 65, 90, 76?";
        const response: string = QueryProcessor(query);
        expect(response).toBe("90");
    });

    test('should return sum for plus', () => {
        const query = "What is 31 plus 78?";
        const response: string = QueryProcessor(query);
        expect(response).toBe("109");
    });

    test('should return difference for minus', () => {
        const query = "What is 16 minus 54?";
        const response: string = QueryProcessor(query);
        expect(response).toBe("-38");
    });

    test('should return product for multiplied by', () => {
        const query = "What is 75 multiplied by 85?";
        const response: string = QueryProcessor(query);
        expect(response).toBe("6375");
    });

    test('should return numbers that are both square and cube', () => {
        const query = "Which of the following numbers is both a square and a cube: 948, 4194, 1103, 36, 4913, 1, 2405?";
        const response: string = QueryProcessor(query);
        expect(response).toBe("1");
    });

    test('should return numbers that are primes', () => {
        const query = "Which of the following numbers are primes: 43, 96, 67, 81, 64?";
        const response: string = QueryProcessor(query);
        expect(response).toBe("43, 67");
    });
});