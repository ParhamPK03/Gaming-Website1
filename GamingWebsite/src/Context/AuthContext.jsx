import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();  

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage
  const loadUserFromLocalStorage = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  };

  useEffect(() => {
    loadUserFromLocalStorage();
  }, []);

  const loginUser = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await response.json();
      const user = users.find(user => user.email === email && user.password === password);

      if (user) {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user)); // Save user to localStorage
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error logging in user:', error);
      return false;
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to register');
      }
      
      const data = await response.json();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data)); // Save user to localStorage
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const updateUserInServer = async (updatedUser) => {
    try {
      const response = await fetch(`http://localhost:5000/users/${updatedUser.id}`, {
        method: 'PUT', // Use PUT to update the existing user
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const data = await response.json();
      setUser(data); // Update state with the new user data
      localStorage.setItem('user', JSON.stringify(data)); // Update localStorage
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('user'); // Remove user from localStorage
  };

  const isAuthenticated = !!user; // true if user exists, false otherwise

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loginUser, registerUser, logoutUser, updateUserInServer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
