import { useState, useEffect, useRef } from 'react';
import { Table, InputNumber, Select, Button, Upload, Modal, message, Row, Col, DatePicker, Tag, Space } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const API = 'http://localhost:8000';

export default function Prices() {
  const [prices, setPrices] = useState([]);
  const [options, setOptions] = useState(null);
  const [product, setProduct] = useState(null);
  const [month, setMonth] = useState(null);
  const [price, setPrice] = useState(null);
  const [priceType, setPriceType] = useState('Settled');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchPrices = () => {
    fetch(`${API}/prices`)
      .then((res) => res.json())
      .then((data) => setPrices(data.map((d, i) => ({ ...d, key: i }))));
  };

  useEffect(() => {
    fetchPrices();
    fetch(`${API}/options`)
      .then((res) => res.json())
      .then(setOptions);
  }, []);

  const savePrice = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          month: month.format('YYYY-MM'),
          price,
          type: priceType,
        }),
      });
      if (res.ok) {
        message.success('Price saved');
        setProduct(null);
        setMonth(null);
        setPrice(null);
        fetchPrices();
      } else {
        message.error('Failed to save');
      }
    } catch {
      message.error('Failed to save');
    }
    setSaving(false);
  };

  const handleSave = () => {
    if (!product || !month || price === null) {
      message.warning('Fill in all fields');
      return;
    }
    const monthStr = month.format('YYYY-MM');
    const existing = prices.find(
      (p) => p.Product === product && p.Month === monthStr && p.Type === priceType
    );
    if (existing) {
      Modal.confirm({
        title: 'Price already exists',
        content: `${product} ${monthStr} already has a ${priceType} price of $${existing.Price}. Overwrite with $${price}?`,
        okText: 'Overwrite',
        cancelText: 'Cancel',
        onOk: savePrice,
      });
    } else {
      savePrice();
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      const entries = [];
      for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        // Skip header row if present
        if (i === 0 && (cols[0].toLowerCase() === 'product' || isNaN(parseFloat(cols[2])))) continue;
        if (cols.length < 4) continue;
        entries.push({
          product: cols[0],
          month: cols[1],
          price: parseFloat(cols[2]),
          type: cols[3],
        });
      }
      if (entries.length === 0) {
        message.warning('No valid rows found in file');
        setUploading(false);
        return;
      }
      const res = await fetch(`${API}/prices/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries),
      });
      if (res.ok) {
        const data = await res.json();
        message.success(data.message);
        fetchPrices();
      } else {
        message.error('Bulk upload failed');
      }
    } catch {
      message.error('Error reading file');
    }
    setUploading(false);
    e.target.value = '';
  };

  const uniqueValues = (field) =>
    [...new Set(prices.map((d) => d[field]).filter(Boolean))].map((v) => ({
      text: v,
      value: v,
    }));

  const columns = [
    { title: 'Product', dataIndex: 'Product', key: 'product', filters: uniqueValues('Product'), onFilter: (val, record) => record['Product'] === val },
    { title: 'Month', dataIndex: 'Month', key: 'month', filters: uniqueValues('Month'), onFilter: (val, record) => record['Month'] === val },
    { title: 'Price', dataIndex: 'Price', key: 'price' },
    { title: 'Type', dataIndex: 'Type', key: 'type',
      filters: [{ text: 'Settled', value: 'Settled' }, { text: 'Forward', value: 'Forward' }],
      onFilter: (val, record) => record['Type'] === val,
      render: (val) => <Tag color={val === 'Settled' ? 'green' : 'blue'}>{val || 'N/A'}</Tag>
    },
  ];

  const makeOptions = (list) => list?.map((v) => ({ label: v, value: v })) || [];

  const downloadCsv = () => {
    const header = 'Product,Month,Price,Type';
    const rows = prices.map((p) => `${p.Product},${p.Month},${p.Price},${p.Type || ''}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 };

  return (
    <>
      <h3>Prices</h3>

      {/* Manual entry */}
      <Row gutter={8} style={{ marginBottom: 16 }} align="bottom">
        <Col>
          <label style={labelStyle}>Product</label>
          <Select
            style={{ width: 140 }}
            options={makeOptions(options?.products)}
            placeholder="Select..."
            value={product}
            onChange={setProduct}
            size="small"
          />
        </Col>
        <Col>
          <label style={labelStyle}>Month</label>
          <DatePicker
            picker="month"
            value={month}
            onChange={setMonth}
            style={{ width: 120 }}
            size="small"
          />
        </Col>
        <Col>
          <label style={labelStyle}>Price</label>
          <InputNumber
            style={{ width: 100 }}
            step={0.01}
            value={price}
            onChange={setPrice}
            placeholder="0.00"
            size="small"
          />
        </Col>
        <Col>
          <label style={labelStyle}>Type</label>
          <Select
            style={{ width: 100 }}
            value={priceType}
            onChange={setPriceType}
            size="small"
            options={[
              { label: 'Settled', value: 'Settled' },
              { label: 'Forward', value: 'Forward' },
            ]}
          />
        </Col>
        <Col>
          <Space size={4}>
            <Button type="primary" size="small" onClick={handleSave} loading={saving}>
              Save
            </Button>
            <Button
              size="small"
              icon={<UploadOutlined />}
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload
            </Button>
            <Button size="small" icon={<DownloadOutlined />} onClick={downloadCsv} disabled={prices.length === 0}>
              Download
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleBulkUpload}
            />
          </Space>
        </Col>
      </Row>
      <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: 16 }}>
        CSV format: Product, Month (YYYY-MM), Price, Type (Settled/Forward)
      </p>

      <Table
        columns={columns}
        dataSource={prices}
        size="middle"
        pagination={{ pageSize: 20 }}
      />
    </>
  );
}
