import { useState, useEffect } from 'react';
import { Table, InputNumber, Select, Button, message, Row, Col, DatePicker } from 'antd';
import dayjs from 'dayjs';

const API = 'http://localhost:8000';

export default function SettledPrices() {
  const [prices, setPrices] = useState([]);
  const [options, setOptions] = useState(null);
  const [product, setProduct] = useState(null);
  const [month, setMonth] = useState(null);
  const [price, setPrice] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchPrices = () => {
    fetch(`${API}/settled-prices`)
      .then((res) => res.json())
      .then((data) => setPrices(data.map((d, i) => ({ ...d, key: i }))));
  };

  useEffect(() => {
    fetchPrices();
    fetch(`${API}/options`)
      .then((res) => res.json())
      .then(setOptions);
  }, []);

  const handleSave = async () => {
    if (!product || !month || price === null) {
      message.warning('Fill in all fields');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/settled-prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          month: month.format('YYYY-MM'),
          price,
        }),
      });
      if (res.ok) {
        message.success('Settled price saved');
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

  const columns = [
    { title: 'Product', dataIndex: 'Product', key: 'product' },
    { title: 'Month', dataIndex: 'Month', key: 'month' },
    { title: 'Settled Price', dataIndex: 'Price', key: 'price' },
  ];

  const makeOptions = (list) => list?.map((v) => ({ label: v, value: v })) || [];

  return (
    <>
      <h3>Settled Prices</h3>
      <Row gutter={16} style={{ marginBottom: 16 }} align="bottom">
        <Col>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Product</label>
          <Select
            style={{ width: 180 }}
            options={makeOptions(options?.products)}
            placeholder="Select product"
            value={product}
            onChange={setProduct}
          />
        </Col>
        <Col>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Month</label>
          <DatePicker
            picker="month"
            value={month}
            onChange={setMonth}
            style={{ width: 150 }}
          />
        </Col>
        <Col>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Price</label>
          <InputNumber
            style={{ width: 130 }}
            step={0.01}
            value={price}
            onChange={setPrice}
            placeholder="0.00"
          />
        </Col>
        <Col>
          <Button type="primary" onClick={handleSave} loading={saving}>
            Save Price
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={prices}
        size="middle"
        pagination={false}
      />
    </>
  );
}
