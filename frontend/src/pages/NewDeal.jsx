import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  message,
  Row,
  Col,
} from 'antd';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:8000';

export default function NewDeal() {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/options`)
      .then((res) => res.json())
      .then(setOptions)
      .catch(() => message.error('Could not load options'));
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        trade_date: values.trade_date.format('YYYY-MM-DD'),
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date.format('YYYY-MM-DD'),
      };
      const res = await fetch(`${API}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        message.error('Error: ' + JSON.stringify(err.detail));
        setLoading(false);
        return;
      }
      const data = await res.json();
      message.success(`Deal saved: ${data.trade_id}`);
      form.resetFields();
    } catch {
      message.error('Failed to save deal');
    }
    setLoading(false);
  };

  const tradeType = Form.useWatch('trade_type', form);
  const isMultiLeg = tradeType === 'Collar' || tradeType === '3-Way';

  if (!options) return <p>Loading options...</p>;

  const makeOptions = (list) => list.map((v) => ({ label: v, value: v }));

  return (
    <>
      <h3>New Deal Entry</h3>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="trade_id" label="Trade ID" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="trade_date" label="Trade Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
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
            <Form.Item name="counterparty" label="Counterparty" rules={[{ required: true }]}>
              <Select options={makeOptions(options.counterparties)} placeholder="Select..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="trade_type" label="Trade Type" rules={[{ required: true }]}>
              <Select options={makeOptions(options.trade_types)} placeholder="Select..." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="product" label="Product" rules={[{ required: true }]}>
              <Select options={makeOptions(options.products)} placeholder="Select..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="volume" label="Volume" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} step={0.01} />
            </Form.Item>
          </Col>
        </Row>

        {!isMultiLeg && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="direction" label="Direction" rules={[{ required: true }]}>
                <Select options={makeOptions(options.directions)} placeholder="Select..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} step={0.01} />
              </Form.Item>
            </Col>
          </Row>
        )}

        {isMultiLeg && (
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="put_strike" label="Put Strike (Floor)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="call_strike" label="Call Strike (Ceiling)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} step={0.01} />
              </Form.Item>
            </Col>
            {tradeType === '3-Way' && (
              <Col span={8}>
                <Form.Item name="sold_put_strike" label="Sold Put Strike (Sub-Floor)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.01} />
                </Form.Item>
              </Col>
            )}
          </Row>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Deal
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
