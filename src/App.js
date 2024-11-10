import { useState } from "react";
import {
    ComposedChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    ReferenceLine,
    Label,
} from "recharts";

import { parseRawData, calculateAverages, calculateStats, calculateDefaultYDomain } from "./cubeUtils";

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 p-2 border border-gray-700 rounded shadow text-gray-200">
                <p className="font-medium">Solve #{payload[0].payload.solveNumber}</p>
                {payload.map(
                    (entry, index) =>
                        entry.value !== null && (
                            <p key={index} style={{ color: entry.color }}>
                                {entry.name}: {entry.value.toFixed(2)}s
                            </p>
                        )
                )}
            </div>
        );
    }
    return null;
};

const StatsCard = ({ stats }) => {
    return (
        <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-sm p-6">
            <h3 className="text-2xl font-bold mb-4">Solve Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-400">Best</div>
                    <div className="text-2xl font-bold">{stats.best}s</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-400">Worst</div>
                    <div className="text-2xl font-bold">{stats.worst}s</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-400">Mean</div>
                    <div className="text-2xl font-bold">{stats.mean}s</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-400">Total Solves</div>
                    <div className="text-2xl font-bold">{stats.totalSolves}</div>
                </div>
            </div>
        </div>
    );
};

const generateTicks = (min, max, count) => {
    const range = max - min;
    const step = range / (count - 1);
    return Array.from({ length: count }, (_, i) => {
        const value = min + (step * i);
        return parseFloat(value.toFixed(1));
    });
};

function App() {
    const [solveData, setSolveData] = useState(null);
    const [yDomain, setYDomain] = useState(null);

    const handleDataInput = (text) => {
        const solves = parseRawData(text);
        if (solves.length === 0) {
            return;
        }
        setSolveData({
            solves,
            chartData: calculateAverages(solves),
            stats: calculateStats(solves)
        });
        const defaultDomain = calculateDefaultYDomain(solves.map(s => s.time));
        setYDomain(defaultDomain);
    };

    const handleWheel = (e) => {
        if (!solveData) return;
        e.preventDefault();
        const meanTime = parseFloat(solveData.stats.mean);
        const currentRange = yDomain[1] - yDomain[0];
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        const newRange = currentRange * zoomFactor;
        const halfRange = newRange / 2;
        
        setYDomain([
            Math.max(0, meanTime - halfRange),
            meanTime + halfRange
        ]);
    };

    const resetZoom = () => {
        if (solveData) {
            const defaultDomain = calculateDefaultYDomain(solveData.solves.map(s => s.time));
            setYDomain(defaultDomain);
        }
    };

    if (!solveData) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-200 p-4 flex items-center justify-center">
                <div className="w-full max-w-2xl">
                    <h1 className="text-2xl font-bold mb-4 text-center">Cube Solve Analytics</h1>
                    <p className="text-gray-400 mb-4 text-center">Paste your solve times data below</p>
                    <textarea
                        className="w-full h-64 p-4 rounded bg-gray-800 border border-gray-700 text-gray-200 font-mono"
                        placeholder="Paste your times here..."
                        onChange={(e) => handleDataInput(e.target.value)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Cube Solve Analytics</h1>
                <button
                    onClick={() => setSolveData(null)}
                    className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-colors"
                >
                    New Data
                </button>
            </div>
            
            <StatsCard stats={solveData.stats} />

            <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-sm p-6 h-[calc(100vh-16rem)] grow">
                <h3 className="text-2xl font-bold mb-4">Solve Times Analysis</h3>
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={resetZoom}
                        className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                    >
                        Reset Zoom
                    </button>
                </div>
                <div 
                    className="h-[calc(100%-6rem)]"
                    onWheel={handleWheel}
                    style={{ cursor: 'ns-resize' }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={solveData.chartData}
                            margin={{ top: 30, right: 30, left: 20, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="solveNumber"
                                type="number"
                                domain={[1, solveData.solves.length]}
                                label={{
                                    value: "Solve Number",
                                    position: "bottom",
                                    offset: 0,
                                    fill: "#9CA3AF",
                                }}
                                tick={{ fill: "#9CA3AF" }}
                            />
                            <YAxis
                                label={{
                                    value: "Time (seconds)",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: -10,
                                    fill: "#9CA3AF",
                                }}
                                domain={yDomain}
                                tick={{ fill: "#9CA3AF" }}
                                allowDataOverflow
                                tickFormatter={(value) => value.toFixed(1)}
                                ticks={generateTicks(yDomain[0], yDomain[1], 10)}
                            />
                            <ReferenceLine
                                y={parseFloat(solveData.stats.best)}
                                stroke="#4B5563"
                                strokeDasharray="3 3"
                            >
                                <Label
                                    value={`Best: ${solveData.stats.best}s`}
                                    position="insideRight"
                                    fill="#4B5563"
                                />
                            </ReferenceLine>
                            <ReferenceLine
                                y={parseFloat(solveData.stats.worst)}
                                stroke="#4B5563"
                                strokeDasharray="3 3"
                            >
                                <Label
                                    value={`Worst: ${solveData.stats.worst}s`}
                                    position="insideRight"
                                    fill="#4B5563"
                                />
                            </ReferenceLine>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                wrapperStyle={{
                                    paddingTop: "30px",
                                }}
                                tick={{ fill: "#9CA3AF" }}
                            />
                            <Scatter name="Solve Time" dataKey="time" fill="#8B5CF6" />
                            <Line
                                name="Ao5"
                                dataKey="ao5"
                                stroke="#10B981"
                                dot={false}
                                connectNulls
                                strokeWidth={2}
                            />
                            <Line
                                name="Ao12"
                                dataKey="ao12"
                                stroke="#F59E0B"
                                dot={false}
                                connectNulls
                                strokeWidth={2}
                            />
                            <Line
                                name="Mean"
                                dataKey="mean"
                                stroke="#EF4444"
                                dot={false}
                                strokeWidth={2}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default App;