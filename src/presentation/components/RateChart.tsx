import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RateChartProps {
    currencyCode: string;
    data: any[];
}

/**
 * 歷史匯率折線圖組件 (Phase 4: Recharts 整合)
 */
export const RateChart: React.FC<RateChartProps> = ({ currencyCode, data }) => {
    return (
        <div style={{ width: '100%', height: 250, marginTop: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
                {currencyCode} / JPY 走勢 (模擬數據)
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#444"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        hide
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#2ed158' }}
                        labelStyle={{ color: '#888' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#2ed158"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#2ed158' }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                {['7天', '30天', '90天', '1年'].map(range => (
                    <button
                        key={range}
                        style={{
                            background: range === '30天' ? 'rgba(46, 209, 88, 0.2)' : 'transparent',
                            border: 'none',
                            color: range === '30天' ? '#2ed158' : '#666',
                            fontSize: '12px',
                            padding: '4px 12px',
                            borderRadius: '20px'
                        }}
                    >
                        {range}
                    </button>
                ))}
            </div>
        </div>
    );
};
