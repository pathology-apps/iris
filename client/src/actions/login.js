import {
    _go,
} from '@actions'

export default function login(
    username,
    password,
    loginResponse,
    navigate,
    auth = {
        login: '/login',
        push: '/collections',
    },
) {
    return (dispatch) => {
        if (!username) {
            return loginResponse({
                title: 'Missing Uniquename',
                msg: 'Please enter your uniquename.',
                type: 'warning',
            })
        }
        if (!password) {
            return loginResponse({
                title: 'Missing Password',
                msg: 'Please enter your Level-2 password.',
                type: 'warning',
            })
        }

        return _go('post', auth.login, {username, password})
            .then((res) => {
                console.log('Response:', res.data);
                if (res.data?.redirect) {
                    sessionStorage.setItem('username', username);
                    const fullname = res.data.full_name;
                    if (fullname) {
                        sessionStorage.setItem('fullname', fullname);
                    }
                    navigate(res.data.redirect);
                } else if (res.data?.error) {
                    return loginResponse({
                        title: 'Login Error',
                        msg: res.data.error,
                        type: 'error',
                    });
                } else {
                    return loginResponse({
                        title: 'Login Error',
                        msg: 'Invalid username or password.',
                        type: 'error',
                    });
                }
                return true;
            })
            .catch((error) => {
                return loginResponse({
                    title: 'Login Error',
                    msg: 'Something went wrong. Please try again later.',
                    type: 'error',
                });
            });
    }
}
