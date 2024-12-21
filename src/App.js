import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Avatar, Dropdown } from 'antd';
import TransactionsList from './components/TransactionsList';
import GoalsList from './components/GoalsList';
import ManageAccounts from './components/ManageAccounts';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { BankOutlined, FlagOutlined, MenuOutlined, UnorderedListOutlined, LogoutOutlined, DashboardOutlined, UserOutlined } from '@ant-design/icons';
import Profile from './components/Profile';
import styled from 'styled-components';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ResponsiveSider = styled(Sider)`
  @media (max-width: 768px) {
    position: absolute;
    z-index: 1;
    height: 100%;
    left: ${props => (props.collapsed ? '-80px' : '0')};
    transition: left 0.3s ease-in-out;
  }
`;

const ResponsiveLayout = styled(Layout)`
  @media (max-width: 768px) {
    margin-left: 0 !important;
    filter: ${props => (props.blurred ? 'blur(5px)' : 'none')};
    transition: filter 0.3s ease-in-out;
    
  }
`;

const OverlaySider = styled(ResponsiveSider)`
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
  }
`;

const App = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        {isAuthenticated && (
          <OverlaySider
            collapsed={collapsed}
            onCollapse={setCollapsed}
            breakpoint="lg"
            collapsedWidth="0"
            style={{ background: '#fff' }}
            zeroWidthTriggerStyle={{ top: '10px' }}
          >
            <div style={{ padding: '30px', textAlign: 'center' }}>
              {/* <Title level={4} style={{ color: '#1890ff', margin: 0 }}>Nest.</Title> */}
              <Title level={4} style={{ color: '#1890ff', margin: 0 }}></Title>
            </div>
            <Menu mode="inline" defaultSelectedKeys={['1']}>
              <Menu.Item key="1" icon={<DashboardOutlined />}>
                <Link to="/">Dashboard</Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<BankOutlined />}>
                <Link to="/accounts">Accounts</Link>
              </Menu.Item>
              <Menu.Item key="3" icon={<UnorderedListOutlined />}>
                <Link to="/transactions">Transactions</Link>
              </Menu.Item>
              <Menu.Item key="4" icon={<FlagOutlined />}>
                <Link to="/goals">Goals</Link>
              </Menu.Item>
            </Menu>
          </OverlaySider>
        )}
        <ResponsiveLayout blurred={!collapsed && window.innerWidth <= 768}>
          {isAuthenticated && (
            <Header style={{ background: '#fff', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Title level={4} style={{ color: '#1890ff', margin: 0 }}>Track</Title>
              </div>
              <Dropdown
                overlay={
                  <Menu>
                    {/* <Menu.Item key="profile">
                      <Link to="/profile">Profile</Link>
                    </Menu.Item> */}
                    <Menu.Item key="logout" onClick={handleLogout}>
                      Logout
                    </Menu.Item>
                  </Menu>
                }
                placement="bottomRight"
              >
                <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer', marginRight: '10px' }} icon={<UserOutlined />} />
              </Dropdown>
            </Header>
          )}
          <Content style={{ margin: '24px 16px 0', overflow: 'initial', background: '#fff' }}>
            <div style={{ padding: 24, minHeight: 360 }}>
              <Routes>
                <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
                <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/transactions" element={isAuthenticated ? <TransactionsList /> : <Navigate to="/login" />} />
                <Route path="/goals" element={isAuthenticated ? <GoalsList /> : <Navigate to="/login" />} />
                <Route path="/accounts" element={isAuthenticated ? <ManageAccounts /> : <Navigate to="/login" />} />
                <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
              </Routes>
            </div>
          </Content>
        </ResponsiveLayout>
      </Layout>
    </Router>
  );
};

export default App;
