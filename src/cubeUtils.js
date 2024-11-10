export const calculateDefaultYDomain = (times) => {
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const padding = (maxTime - minTime) * 0.1; // Add 10% padding
    return [Math.max(0, minTime - padding), maxTime + padding];
};

export const parseRawData = (text) => {
    const lines = text.split("\n");
    return lines
        .map((line) => {
            const match = line.match(/(\d+)\.\s+(\d+\.\d+)/);
            if (match) {
                return {
                    solveNumber: parseInt(match[1]),
                    time: parseFloat(match[2]),
                };
            }
            return null;
        })
        .filter((item) => item !== null);
};

export const calculateAverages = (solves) => {
    let sumTotal = 0;
    return solves.map((solve, index) => {
        sumTotal += solve.time;
        const mean = sumTotal / (index + 1);

        let ao5 = null;
        if (index >= 4) {
            const last5 = solves.slice(index - 4, index + 1).map((s) => s.time);
            const sorted = [...last5].sort((a, b) => a - b);
            sorted.pop();
            sorted.shift();
            ao5 = sorted.reduce((a, b) => a + b, 0) / 3;
        }

        let ao12 = null;
        if (index >= 11) {
            const last12 = solves.slice(index - 11, index + 1).map((s) => s.time);
            const sorted = [...last12].sort((a, b) => a - b);
            sorted.pop();
            sorted.shift();
            ao12 = sorted.reduce((a, b) => a + b, 0) / 10;
        }

        return {
            solveNumber: solve.solveNumber,
            time: solve.time,
            mean: parseFloat(mean.toFixed(2)),
            ao5: ao5 ? parseFloat(ao5.toFixed(2)) : null,
            ao12: ao12 ? parseFloat(ao12.toFixed(2)) : null,
        };
    });
};

export const calculateStats = (solves) => {
    const times = solves.map((s) => s.time);

    // Calculate best ao5
    let bestAo5 = null;
    if (solves.length >= 5) {
        const ao5s = solves.slice(4).map((_, idx) => {
            const window = times.slice(idx, idx + 5);
            const sorted = [...window].sort((a, b) => a - b);
            sorted.pop(); // Remove worst
            sorted.shift(); // Remove best
            return sorted.reduce((a, b) => a + b, 0) / 3;
        });
        bestAo5 = Math.min(...ao5s);
    }

    // Calculate best ao12
    let bestAo12 = null;
    if (solves.length >= 12) {
        const ao12s = solves.slice(11).map((_, idx) => {
            const window = times.slice(idx, idx + 12);
            const sorted = [...window].sort((a, b) => a - b);
            sorted.pop(); // Remove worst
            sorted.shift(); // Remove best
            return sorted.reduce((a, b) => a + b, 0) / 10;
        });
        bestAo12 = Math.min(...ao12s);
    }

    return {
        best: Math.min(...times).toFixed(2),
        worst: Math.max(...times).toFixed(2),
        mean: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
        totalSolves: times.length,
        bestAo5: bestAo5 ? bestAo5.toFixed(2) : "-",
        bestAo12: bestAo12 ? bestAo12.toFixed(2) : "-",
    };
};
