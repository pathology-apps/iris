import React, { useState } from 'react';
import { Input, Form, Button, message, Typography } from 'antd';
import axios from 'axios';

const { TextArea } = Input;
const { Title } = Typography;

const Suggestions = () => {
  const [form] = Form.useForm();
  const username = sessionStorage.getItem('username') || '';
  const fullname = sessionStorage.getItem('fullname')?.replace(/,([^ ])/g, ', $1') || '';

  const handleSubmit = async () => {
    try {
      const formData = await form.validateFields();
      const { suggestion, name, email } = formData;

      const emailBody = `
        <html>
          <body>
            <h2>New Suggestion from ${name}</h2>
            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
              <tr>
                <th style="text-align: left;">Name</th>
                <td>${name}</td>
              </tr>
              <tr>
                <th style="text-align: left;">Uniqname</th>
                <td>${username}</td>
              </tr>
              <tr>
                <th style="text-align: left;">Email</th>
                <td>${email}</td>
              </tr>
              <tr>
                <th style="text-align: left;">Suggestion</th>
                <td>${suggestion}</td>
              </tr>
            </table>
          </body>
        </html>
      `;

      await axios.post('/api/sendemail', {
        to: 'nkathawa@med.umich.edu',
        name: name,
        username: username,
        email: email,
        suggestion: suggestion,
        subject: 'New Suggestion from ' + name,
        html: emailBody, // Use `html` instead of `text` for the email body
      });

      message.success('Suggestion submitted successfully');
      form.resetFields();
    } catch (error) {
      console.error('Error sending suggestion:', error);
      message.error('Failed to submit suggestion, please try again later.');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2em', marginBottom: '30px', textAlign: 'center' }}>Suggestions</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Your Name"
          name="name"
          initialValue={fullname}
          style={{ marginBottom: '20px' }}
        >
          <Input value={fullname} disabled style={{ borderRadius: '4px', background: '#f5f5f5' }} />
        </Form.Item>
        <Form.Item
          label="Your Uniqname"
          name="uniqname"
          initialValue={username}
          style={{ marginBottom: '20px' }}
        >
          <Input value={username} disabled style={{ borderRadius: '4px', background: '#f5f5f5' }} />
        </Form.Item>
        <Form.Item
          label="Your Email"
          name="email"
          initialValue={`${username}@med.umich.edu`}
          style={{ marginBottom: '20px' }}
        >
          <Input value={`${username}@med.umich.edu`} disabled style={{ borderRadius: '4px', background: '#f5f5f5' }} />
        </Form.Item>
        <Form.Item
          label="Your Suggestion"
          name="suggestion"
          rules={[{ required: true, message: 'Please enter your suggestion' }]}
          style={{ marginBottom: '20px' }}
        >
          <TextArea rows={4} placeholder="Type your suggestion here..." style={{ borderRadius: '4px' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%', borderRadius: '4px' }}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Suggestions;