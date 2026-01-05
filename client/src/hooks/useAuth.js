import { useEffect, useState, useContext } from 'react';
import Axios from 'axios';
import setAuthToken from '../helpers/setAuthToken';
import globalContext from '../context/global/globalContext';

const useAuth = () => {
  localStorage.token && setAuthToken(localStorage.token);

  const {
    setId,
    setIsLoading,
    setUserName,
    setEmail,
  } = useContext(globalContext);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    const token = localStorage.token;
    token && loadUser(token);

    setIsLoading(false);
    // eslint-disable-next-line
  }, []);

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const res = await Axios.post('/api/users', {
        name,
        email,
        password,
      });

      const token = res.data.token;

      if (token) {
        localStorage.setItem('token', token);
        setAuthToken(token);
        await loadUser(token);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.msg || 
                          error.message || 
                          'Registration failed. Please try again.';
      alert(errorMessage);
      console.error('Registration error:', error.response?.data || error);
    }
    setIsLoading(false);
  };

  const login = async (emailAddress, password) => {
    setIsLoading(true);
    try {
      const res = await Axios.post('/api/auth', {
        email: emailAddress,
        password,
      });

      const token = res.data.token;

      if (token) {
        localStorage.setItem('token', token);
        setAuthToken(token);
        await loadUser(token);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.msg || 
                          error.message || 
                          'Login failed. Please try again.';
      alert(errorMessage);
      console.error('Login error:', error.response?.data || error);
    }
    setIsLoading(false);
  };

  const loadUser = async (token) => {
    try {
      const res = await Axios.get('/api/auth', {
        headers: {
          'x-auth-token': token,
        },
      });

      const { _id, name, email } = res.data;

      setIsLoggedIn(true);
      setId(_id);
      setUserName(name);
      setEmail(email);
    } catch (error) {
      localStorage.removeItem('token');
      const errorMessage = error.response?.data?.msg || 
                          error.message || 
                          'Failed to load user.';
      console.error('Load user error:', error.response?.data || error);
      // Don't alert on loadUser errors as they might be expected
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setId(null);
    setUserName(null);
    setEmail(null);
  };

  return [isLoggedIn, login, logout, register, loadUser];
};

export default useAuth;
