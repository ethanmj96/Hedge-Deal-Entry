import { useState } from 'react';
import { Table, DatePicker, Button, Tag, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const API = 'http://localhost:8000';

export default function Settlements() {
  const [month, setMonth] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!month) {
      message.warning('Select a month');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/settlements/${month.format('YYYY-MM')}`);
      const results = await res.json();
      setData(results.map((d, i) => ({ ...d, key: i })));
    } catch {
      message.error('Failed to load settlements');
    }
    setLoading(false);
  };

  const totalPnL = data.reduce((sum, d) => sum + (d['P&L'] ?? 0), 0);

  const downloadCsv = () => {
    const header = 'Trade ID,Counterparty,Direction,Product,Trade Type,Daily Volume,Volume Unit,Days,Monthly Volume,Strike,Settled Price,Currency,P&L';
    const rows = data.map((d) =>
      `${d['Trade ID']},${d['Counterparty']},${d['Direction']},${d['Product']},${d['Trade Type']},${d['Daily Volume']},${d['Volume Unit']},${d['Days']},${d['Monthly Volume']},${d['Strike'] ?? ''},${d['Settled Price'] ?? ''},${d['Currency'] ?? ''},${d['P&L'] ?? ''}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settlements-${month?.format('YYYY-MM') || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { title: 'Trade ID', dataIndex: 'Trade ID', key: 'trade_id' },
    { title: 'Counterparty', dataIndex: 'Counterparty', key: 'counterparty' },
    { title: 'Direction', dataIndex: 'Direction', key: 'direction' },
    { title: 'Product', dataIndex: 'Product', key: 'product' },
    { title: 'Trade Type', dataIndex: 'Trade Type', key: 'trade_type' },
    { title: 'Daily Vol', dataIndex: 'Daily Volume', key: 'daily_vol',
      render: (val, r) => `${val?.toLocaleString()} ${r['Volume Unit']}` },
    { title: 'Days', dataIndex: 'Days', key: 'days' },
    { title: 'Monthly Vol', dataIndex: 'Monthly Volume', key: 'monthly_vol',
      render: (val) => val?.toLocaleString() },
    { title: 'Strike', dataIndex: 'Strike', key: 'strike',
      render: (val) => val != null ? `$${val.toFixed(2)}` : '-' },
    { title: 'Settled Price', dataIndex: 'Settled Price', key: 'settled',
      render: (val) => val != null ? `$${val.toFixed(2)}` : <Tag color="orange">Missing</Tag> },
    { title: 'Currency', dataIndex: 'Currency', key: 'currency' },
    { title: 'P&L', dataIndex: 'P&L', key: 'pnl',
      render: (val, record) => {
        if (val == null) return <Tag color="orange">N/A</Tag>;
        const color = val >= 0 ? 'green' : 'red';
        const ccy = record['Currency'] || '$';
        return <span style={{ color, fontWeight: 600 }}>{ccy} {val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>;
      }
    },
  ];

  return (
    <>
      <h3>Monthly Settlements</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <DatePicker
          picker="month"
          value={month}
          onChange={setMonth}
          style={{ width: 180 }}
          placeholder="Select month"
        />
        <Button type="primary" onClick={handleCalculate} loading={loading}>
          Calculate
        </Button>
        <Button icon={<DownloadOutlined />} onClick={downloadCsv} disabled={data.length === 0}>
          Download CSV
        </Button>
        {data.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: '1.1rem', fontWeight: 600 }}>
            Total P&L:{' '}
            <span style={{ color: totalPnL >= 0 ? 'green' : 'red' }}>
              ${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </span>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        size="middle"
        scroll={{ x: true }}
        pagination={false}
      />
    </>
  );
}
