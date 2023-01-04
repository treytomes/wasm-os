export default class MoreMath {
    static isInRange(value: number, inclusiveMin: number, exclusiveMax: number) {
        return (inclusiveMin <= value) && (value < exclusiveMax);
    }

    /**
     * Linear interpolation by t-% from a to b.
     */
    static lerp(t: number, a: number, b: number) {
        return a + t * (b - a);
    }
}
