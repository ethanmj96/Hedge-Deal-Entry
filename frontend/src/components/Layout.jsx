import { Layout as AntLayout, Menu } from 'antd';
import {
  FormOutlined,
  UnorderedListOutlined,
  DollarOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Sider, Content, Header } = AntLayout;

const menuItems = [
  { key: '/deals', icon: <UnorderedListOutlined />, label: 'Deal List' },
  { key: '/deals/new', icon: <FormOutlined />, label: 'New Deal' },
  { key: '/prices', icon: <DollarOutlined />, label: 'Prices' },
  { key: '/settlements', icon: <CalculatorOutlined />, label: 'Settlements' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey =
    menuItems.find((item) => location.pathname === item.key)?.key ||
    menuItems.find((item) => location.pathname.startsWith(item.key))?.key ||
    '/deals';

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={80}>
        <div
          style={{
            color: '#fff',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Module
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <h2 style={{ margin: 0, lineHeight: '64px' }}>
            Hedge Deal Entry
          </h2>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
