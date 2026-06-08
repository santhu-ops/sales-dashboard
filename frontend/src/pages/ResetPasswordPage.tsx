import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/forgot-password', { replace: true });
  }, [navigate]);

  return null;
};

export default ResetPasswordPage;
