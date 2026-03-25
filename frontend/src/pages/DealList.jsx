import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Space,
} from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const API = 'http://localhost:8000';

export default function DealList() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetch(`${API}/options`)
      .then((res) => res.json())
      .then(setOptions);
  }, []);

  const fetchDeals = () => {
    setLoading(true);
    fetch(`${API}/deals`)
      .then((res) => res.json())
      .then((data) => {
        setDeals(data.map((d, i) => ({ ...d, key: i })));
        setLoading(false);
      })
      .catch(() => {
        message.error('Could not load deals');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleDelete = async (tradeId) => {
    const baseId = tradeId.replace(/-\d+$/, '');
    try {
      const res = await fetch(`${API}/deals/${encodeURIComponent(baseId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        message.error('Failed to delete deal');
        return;
      }
      message.success(`Deleted deal: ${tradeId}`);
      fetchDeals();
    } catch {
      message.error('Failed to delete deal');
    }
  };

  const openEdit = (record) => {
    setEditRecord(record);
    form.setFieldsValue({
      trade_date: dayjs(record['Trade Date']),
      start_date: dayjs(record['Start Date']),
      end_date: dayjs(record['End Date']),
      counterparty: record['Counterparty'],
      direction: record['Direction'],
      commodity: record['Commodity'],
      product: record['Product'],
      trade_type: record['Trade Type'],
      volume: record['Volume'],
      volume_unit: record['Volume Unit'],
      price: record['Price'],
      currency: record['Currency'],
    });
  };

  const handleEditSave = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        trade_date: values.trade_date.format('YYYY-MM-DD'),
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date.format('YYYY-MM-DD'),
      };
      const tradeId = editRecord['Trade ID'];
      const res = await fetch(`${API}/deals/${encodeURIComponent(tradeId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        message.error('Failed to update deal');
        setSaving(false);
        return;
      }
      message.success(`Updated deal: ${tradeId}`);
      setEditRecord(null);
      fetchDeals();
    } catch {
      message.error('Failed to update deal');
    }
    setSaving(false);
  };

  const makeOptions = (list) => list?.map((v) => ({ label: v, value: v })) || [];

  const uniqueValues = (field) =>
    [...new Set(deals.map((d) => d[field]).filter(Boolean))].map((v) => ({
      text: v,
      value: v,
    }));

  const columns = [
    { title: 'Trade ID', dataIndex: 'Trade ID', key: 'trade_id', filters: uniqueValues('Trade ID'), onFilter: (val, record) => record['Trade ID'] === val },
    { title: 'Trade Date', dataIndex: 'Trade Date', key: 'trade_date', filters: uniqueValues('Trade Date'), onFilter: (val, record) => record['Trade Date'] === val },
    { title: 'Start', dataIndex: 'Start Date', key: 'start_date', filters: uniqueValues('Start Date'), onFilter: (val, record) => record['Start Date'] === val },
    { title: 'End', dataIndex: 'End Date', key: 'end_date', filters: uniqueValues('End Date'), onFilter: (val, record) => record['End Date'] === val },
    { title: 'Counterparty', dataIndex: 'Counterparty', key: 'counterparty', filters: uniqueValues('Counterparty'), onFilter: (val, record) => record['Counterparty'] === val },
    { title: 'Direction', dataIndex: 'Direction', key: 'direction', filters: uniqueValues('Direction'), onFilter: (val, record) => record['Direction'] === val },
    { title: 'Commodity', dataIndex: 'Commodity', key: 'commodity', filters: uniqueValues('Commodity'), onFilter: (val, record) => record['Commodity'] === val },
    { title: 'Product', dataIndex: 'Product', key: 'product', filters: uniqueValues('Product'), onFilter: (val, record) => record['Product'] === val },
    { title: 'Trade Type', dataIndex: 'Trade Type', key: 'trade_type', filters: uniqueValues('Trade Type'), onFilter: (val, record) => record['Trade Type'] === val },
    { title: 'Volume', dataIndex: 'Volume', key: 'volume', filters: uniqueValues('Volume'), onFilter: (val, record) => record['Volume'] === val },
    { title: 'Unit', dataIndex: 'Volume Unit', key: 'volume_unit', filters: uniqueValues('Volume Unit'), onFilter: (val, record) => record['Volume Unit'] === val },
    { title: 'Price', dataIndex: 'Price', key: 'price', filters: uniqueValues('Price'), onFilter: (val, record) => record['Price'] === val },
    { title: 'Currency', dataIndex: 'Currency', key: 'currency', filters: uniqueValues('Currency'), onFilter: (val, record) => record['Currency'] === val },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Delete this deal?"
            onConfirm={() => handleDelete(record['Trade ID'])}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <h3>Deal List</h3>
      <Table
        columns={columns}
        dataSource={deals}
        loading={loading}
        size="middle"
        scroll={{ x: true }}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={`Edit Deal: ${editRecord?.['Trade ID'] || ''}`}
        open={!!editRecord}
        onCancel={() => setEditRecord(null)}
        footer={null}
        width={700}
      >
        {options && (
          <Form form={form} layout="vertical" onFinish={handleEditSave}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="trade_date" label="Trade Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="counterparty" label="Counterparty" rules={[{ required: true }]}>
                  <Select options={makeOptions(options.counterparties)} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="start_date" label="Start Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="end_date" label="End Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="direction" label="Direction" rules={[{ required: true }]}>
                  <Select options={makeOptions(options.directions)} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="trade_type" label="Trade Type" rules={[{ required: true }]}>
                  <Select options={makeOptions(['Swap', 'Call', 'Put'])} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="commodity" label="Commodity" rules={[{ required: true }]}>
                  <Select options={makeOptions(options.commodities)} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="product" label="Product" rules={[{ required: true }]}>
                  <Select options={makeOptions(options.products)} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="volume" label="Volume" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.01} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="volume_unit" label="Volume Unit" rules={[{ required: true }]}>
                  <Select options={makeOptions(options.volume_units)} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.01} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
                  <Select options={makeOptions(options.currencies)} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving}>
                  Save Changes
                </Button>
                <Button onClick={() => setEditRecord(null)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}
