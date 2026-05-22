// AetherQuantum - High-Fidelity Quantum Simulator Core
// Simulates a register of N qubits using full statevector simulation with complex numbers.

export const Complex = {
    zero: () => ({ r: 0, i: 0 }),
    one: () => ({ r: 1, i: 0 }),
    i: () => ({ r: 0, i: 1 }),

    create: (r, i = 0) => ({ r, i }),

    add: (c1, c2) => ({ r: c1.r + c2.r, i: c1.i + c2.i }),
    
    sub: (c1, c2) => ({ r: c1.r - c2.r, i: c1.i - c2.i }),

    mul: (c1, c2) => ({
        r: c1.r * c2.r - c1.i * c2.i,
        i: c1.r * c2.i + c1.i * c2.r
    }),

    mulReal: (c, val) => ({ r: c.r * val, i: c.i * val }),

    conj: (c) => ({ r: c.r, i: -c.i }),

    magnitude: (c) => Math.sqrt(c.r * c.r + c.i * c.i),

    magnitudeSq: (c) => c.r * c.r + c.i * c.i,

    phase: (c) => Math.atan2(c.i, c.r), // in radians (-PI to PI)

    toString: (c, decimals = 3) => {
        if (Math.abs(c.r) < 1e-9 && Math.abs(c.i) < 1e-9) return "0";
        if (Math.abs(c.i) < 1e-9) return c.r.toFixed(decimals);
        if (Math.abs(c.r) < 1e-9) {
            if (Math.abs(c.i - 1) < 1e-9) return "i";
            if (Math.abs(c.i + 1) < 1e-9) return "-i";
            return `${c.i.toFixed(decimals)}i`;
        }
        const sign = c.i >= 0 ? "+" : "-";
        const absImag = Math.abs(c.i);
        const imagStr = Math.abs(absImag - 1) < 1e-9 ? "i" : `${absImag.toFixed(decimals)}i`;
        return `${c.r.toFixed(decimals)} ${sign} ${imagStr}`;
    }
};

export class QuantumRegister {
    constructor(numQubits = 4) {
        this.numQubits = numQubits;
        this.reset();
    }

    reset() {
        const size = 1 << this.numQubits;
        this.statevector = Array.from({ length: size }, () => Complex.zero());
        // Initialize to |00...0>
        this.statevector[0] = Complex.one();
    }

    /**
     * Apply a general 2x2 unitary matrix to a target qubit, optionally controlled by other qubits.
     * @param {number} target Qubit index (0-indexed)
     * @param {Array<Array<Object>>} matrix 2x2 complex matrix
     * @param {Array<number>} controls List of control qubit indices
     */
    applyGateMatrix(target, matrix, controls = []) {
        const N = this.numQubits;
        const size = 1 << N;
        const nextState = Array.from({ length: size }, () => Complex.zero());
        const processed = new Uint8Array(size);

        for (let idx = 0; idx < size; idx++) {
            if (processed[idx]) continue;

            const bitVal = (idx >> target) & 1;
            let idx0, idx1;
            if (bitVal === 0) {
                idx0 = idx;
                idx1 = idx | (1 << target);
            } else {
                idx0 = idx & ~(1 << target);
                idx1 = idx;
            }

            processed[idx0] = 1;
            processed[idx1] = 1;

            // Check control conditions
            let controlsSatisfied = true;
            for (const c of controls) {
                if (((idx0 >> c) & 1) === 0) {
                    controlsSatisfied = false;
                    break;
                }
            }

            if (controlsSatisfied) {
                const psi0 = this.statevector[idx0];
                const psi1 = this.statevector[idx1];

                // Matrix multiplication
                // [out0] = M00 * psi0 + M01 * psi1
                // [out1] = M10 * psi0 + M11 * psi1
                nextState[idx0] = Complex.add(
                    Complex.mul(matrix[0][0], psi0),
                    Complex.mul(matrix[0][1], psi1)
                );
                nextState[idx1] = Complex.add(
                    Complex.mul(matrix[1][0], psi0),
                    Complex.mul(matrix[1][1], psi1)
                );
            } else {
                // Controls not satisfied, copy amplitudes
                nextState[idx0] = { r: this.statevector[idx0].r, i: this.statevector[idx0].i };
                nextState[idx1] = { r: this.statevector[idx1].r, i: this.statevector[idx1].i };
            }
        }
        this.statevector = nextState;
    }

    // --- Standard Gate Definitions ---

    // Hadamard Gate (Superposition)
    h(target, controls = []) {
        const val = 1 / Math.sqrt(2);
        const matrix = [
            [Complex.create(val), Complex.create(val)],
            [Complex.create(val), Complex.create(-val)]
        ];
        this.applyGateMatrix(target, matrix, controls);
    }

    // Pauli-X Gate (NOT)
    x(target, controls = []) {
        const matrix = [
            [Complex.zero(), Complex.one()],
            [Complex.one(), Complex.zero()]
        ];
        this.applyGateMatrix(target, matrix, controls);
    }

    // Pauli-Y Gate
    y(target, controls = []) {
        const matrix = [
            [Complex.zero(), Complex.create(0, -1)],
            [Complex.create(0, 1), Complex.zero()]
        ];
        this.applyGateMatrix(target, matrix, controls);
    }

    // Pauli-Z Gate (Phase Flip)
    z(target, controls = []) {
        const matrix = [
            [Complex.one(), Complex.zero()],
            [Complex.zero(), Complex.create(-1)]
        ];
        this.applyGateMatrix(target, matrix, controls);
    }

    // S Gate (Phase Shift PI/2)
    s(target, controls = []) {
        const matrix = [
            [Complex.one(), Complex.zero()],
            [Complex.zero(), Complex.create(0, 1)] // i
        ];
        this.applyGateMatrix(target, matrix, controls);
    }

    // T Gate (Phase Shift PI/4)
    t(target, controls = []) {
        const cos = Math.cos(Math.PI / 4);
        const sin = Math.sin(Math.PI / 4);
        const matrix = [
            [Complex.one(), Complex.zero()],
            [Complex.zero(), Complex.create(cos, sin)] // e^(i*PI/4)
        ];
        this.applyGateMatrix(target, matrix, controls);
    }

    // Rotation around X-axis
    rx(target, theta, controls = []) {
        const cos = Math.cos(theta / 2);
        const sin = Math.sin(theta / 2);
        const matrix = [
            [Complex.create(cos), Complex.create(0, -sin)],
            [Complex.create(0, -sin), Complex.create(cos)]
        ];
        this.applyGateMatrix(target, matrix, controls);
    }

    // Rotation around Y-axis
    ry(target, theta, controls = []) {
        const cos = Math.cos(theta / 2);
        const sin = Math.sin(theta / 2);
        const matrix = [
            [Complex.create(cos), Complex.create(-sin)],
            [Complex.create(sin), Complex.create(cos)]
        ];
        this.applyGateMatrix(target, matrix, controls);
    }

    // Rotation around Z-axis
    rz(target, theta, controls = []) {
        const cos = Math.cos(theta / 2);
        const sin = Math.sin(theta / 2);
        const matrix = [
            [Complex.create(cos, -sin), Complex.zero()],
            [Complex.zero(), Complex.create(cos, sin)]
        ];
        this.applyGateMatrix(target, matrix, controls);
    }

    // --- State Inspection & Sampling ---

    // Get probability of each computational basis state
    getProbabilities() {
        return this.statevector.map(amplitude => Complex.magnitudeSq(amplitude));
    }

    // Formats a state index as a binary string (e.g. 3 -> "0011")
    formatStateLabel(idx) {
        return idx.toString(2).padStart(this.numQubits, '0');
    }

    // Sample from the probability distribution (simulate measurements)
    sample(shots = 1024) {
        const probs = this.getProbabilities();
        const counts = {};
        const size = 1 << this.numQubits;

        // Initialize empty counts
        for (let i = 0; i < size; i++) {
            if (probs[i] > 1e-9) {
                counts[this.formatStateLabel(i)] = 0;
            }
        }

        // Build CDF
        const cdf = new Float64Array(size);
        let cumSum = 0;
        for (let i = 0; i < size; i++) {
            cumSum += probs[i];
            cdf[i] = cumSum;
        }

        // Make sure last is exactly 1.0 to prevent floating precision issues
        if (size > 0) cdf[size - 1] = 1.0;

        // Run Monte Carlo shots
        for (let s = 0; s < shots; s++) {
            const r = Math.random();
            // Binary search in CDF
            let low = 0;
            let high = size - 1;
            let match = 0;

            while (low <= high) {
                const mid = (low + high) >> 1;
                if (cdf[mid] >= r) {
                    match = mid;
                    high = mid - 1;
                } else {
                    low = mid + 1;
                }
            }
            const label = this.formatStateLabel(match);
            counts[label] = (counts[label] || 0) + 1;
        }

        return counts;
    }
}
