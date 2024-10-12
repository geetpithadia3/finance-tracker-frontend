import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { getAuthHeaders } from '../utils/auth';

const Profile = () => {
  const [form] = Form.useForm();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
  }, []);

  const onFinish = async (values) => {
    try {
      const response = await fetch('http://localhost:8080/user/external-credentials', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(values)
      });
      if (response.ok) {
        message.success('Profile updated successfully');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    }
  };


  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="externalKey" label="Splitwise Secret">
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Update Profile
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Profile;