import React, {useEffect, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {Form, Alert, Button, Input, Layout} from 'antd'
import {isEmpty} from '@libs/global'
import login from '@actions/login'
import {browserBlacklisted, responseToChildren} from '@libs'
import {LockOutlined, UserOutlined} from '@ant-design/icons'

function LoginTemplate() {
    // Tools
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const usernameInput = useRef()
    // Selectors
    const theme = useSelector((store) => store.template.theme)
    const logoutReason = useSelector((store) => store.home.logoutReason)
    // State
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState({})
    // Effects
    useEffect(() => {
        usernameInput?.current.focus()
        const {pathname} = window.location
        if (browserBlacklisted() && pathname !== '/upgrade') {
            navigate('/upgrade')
        }
    }, [usernameInput])
    // Derived Functions
    const loginResponse = (resp) => {
        setResponse(resp)
        setLoading(false)
        if (resp.redirect) {
            navigate(resp.redirect)
        }
    }
    const handleFormFinish = () => {
        setLoading(true)
        dispatch(login(username, password, loginResponse, navigate))
    }
    const handlePassword = (e) => {
        setPassword(e.target.value)
    }
    const handleUsername = (e) => {
        setUsername(e.target.value)
    }

    return (
        <Layout className={`pt ${theme}`}>
            <div className="pt-login" style={{ backgroundColor: '#fff' }}>
                <div className="pt-login-box" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #d9d9d9' }}>
                    <h2 className="pt-login-header">Login</h2>
                    <Form onFinish={handleFormFinish} className="pt-login-container">
                        <Form.Item
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your uniquename!',
                                },
                            ]}
                        >
                            <Input
                                size="large"
                                className="pt-login-form-item"
                                prefix={<UserOutlined />}
                                type="text"
                                value={username}
                                ref={usernameInput}
                                onChange={handleUsername}
                                placeholder="Uniqname"
                            />
                        </Form.Item>
                        <Form.Item
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your level-2 password!',
                                },
                            ]}
                        >
                            <Input
                                size="large"
                                className="pt-login-form-item"
                                prefix={<LockOutlined />}
                                type="password"
                                value={password}
                                autoComplete={new Date().toLocaleDateString()}
                                onChange={handlePassword}
                                placeholder="Password"
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                key="btnSubmit"
                                className="pt-login-btn"
                                block
                                htmlType="submit"
                                type="primary"
                                loading={loading}
                                size="large"
                            >
                                Sign In
                            </Button>
                        </Form.Item>
                        
                        {!isEmpty(response) && (
                            <Alert
                                message={response.title || 'Logged Out'}
                                description={responseToChildren(response.msg)}
                                type={response.type || 'info'}
                                showIcon
                            />
                        )}
                    </Form>
                </div>
            </div>
        </Layout>
    )
}

export default LoginTemplate
