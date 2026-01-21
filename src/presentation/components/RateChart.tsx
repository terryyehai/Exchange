import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RateChartProps {
    currencyCode: string;
    data: any[];
    currentRange: number;
    onRangeChange: (days: number) => void;
}

/**
 * 歷史匯率折線圖組件 (Phase 5: 真實數據與動態範圍)
 */
export const RateChart: React.FC<RateChartProps> = ({ currencyCode, data, currentRange, onRangeChange }) => {
    const ranges = [
        { label: '7天', days: 7 },
        { label: '30天', days: 30 },
        { label: '90天', days: 90 },
        { label: '1年', days: 365 },
    ];

    return (
        <div style={{ width: '100%', height: 300, marginTop: '10px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '14px', color: '#888', fontWeight: 'normal' }}>
                    {currencyCode} / JPY 匯率趨勢
                </h3>
                <span style={{ fontSize: '12px', color: '#444' }}>資料來源: Frankfurter API</span>
            </div>

            <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#444"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            hide
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(20, 20, 20, 0.9)',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                fontSize: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{ color: '#2ed158' }}
                            labelStyle={{ color: '#888', marginBottom: '4px' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="rate"
                            stroke="#2ed158"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#2ed158', stroke: '#000', strokeWidth: 2 }}
                            animationDuration={1000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', padding: '0 10px' }}>
                {ranges.map(r => (
                    <button
                        key={r.days}
                        onClick={() => onRangeChange(r.days)}
                        style={{
                            background: currentRange === r.days ? 'rgba(46, 209, 88, 0.15)' : 'transparent',
                            border: 'none',
                            color: currentRange === r.days ? '#2ed158' : '#888',
                            fontSize: '13px',
                            fontWeight: currentRange === r.days ? '600' : 'normal',
                            padding: '6px 16px',
                            borderRadius: '10px',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                        }}
                    >
                        {r.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
