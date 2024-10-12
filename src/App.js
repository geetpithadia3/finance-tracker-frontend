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

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
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
      <Layout style={{ minHeight: '100vh', background: '#fff' }}>
        {isAuthenticated && (
          <Sider 
            // collapsed={collapsed} 
            // onCollapse={setCollapsed} 
            // breakpoint="lg"
            // collapsedWidth="0"
            // zeroWidthTriggerStyle={{ top: '10px' }}
            style={{
              overflow: 'auto',
              background: '#fff',
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <Title level={4} style={{ color: '#1890ff', margin: 0 }}>Nest.</Title>
            </div>
            <Menu mode="inline" defaultSelectedKeys={['1']}>
              <Menu.Item key="1" icon={<DashboardOutlined />}>
                <Link to="/">Dashboard</Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<BankOutlined />}>
                <Link to="/accounts">Accounts</Link>
              </Menu.Item>
              <Menu.Item key="3" icon={<UnorderedListOutlined />}>
                <Link to="/transactions">Expenses</Link>
              </Menu.Item>
              <Menu.Item key="4" icon={<FlagOutlined />}>
                <Link to="/goals">Goals</Link>
              </Menu.Item>
            </Menu>
          </Sider>
        )}
        <Layout style={{ marginLeft: isAuthenticated ? (collapsed ? 0 : 200) : 0, transition: 'all 0.2s' }}>
          {isAuthenticated && (
            <Header style={{ background: '#fff', padding: 0, position: 'sticky', top: 0, zIndex: 1, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* <Button
                type="text"
                icon={collapsed ? <MenuOutlined /> : <MenuOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              /> */}
              <Title></Title>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key="profile">
                      <Link to="/profile">Profile</Link>
                    </Menu.Item>
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
            <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
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
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;