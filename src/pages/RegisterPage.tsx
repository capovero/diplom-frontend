import React from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Имя пользователя должно состоять не менее чем из 3 символов')
    .required('Имя пользователя обязательно'),
  email: Yup.string()
    .email('Неверный адрес электронной почты')
    .required('Электронная почта обязательна'),
  password: Yup.string()
    .min(6, 'Пароль должен состоять не менее чем из 6 символов')
    .required('Пароль обязателен')
});

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: '500px' }}>
        <h1 className={`text-center mb-4 ${theme === 'dark' ? 'text-light' : ''}`}>Регистрация</h1>
        
        <Formik
          initialValues={{ username: '', email: '', password: '' }}
          validationSchema={registerSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            try {
              await axios.post('/api/auth/register', values);
              navigate('/login');
            } catch (error) {
              setStatus('Registration failed. Please try again.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            status,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          }) => (
            <Form onSubmit={handleSubmit} className={`p-4 rounded shadow-sm ${theme === 'dark' ? 'bg-dark text-light' : 'bg-white'}`}>
              {status && <Alert variant="danger">{status}</Alert>}
              
              <Form.Group className="mb-3">
                <Form.Label>Имя пользователя</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.username && !!errors.username}
                  autoFocus
                  className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Почта</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.email && !!errors.email}
                  className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Пароль</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.password && !!errors.password}
                  className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100 mb-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Регистрация...' : 'Регистрация'}
              </Button>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className={`text-decoration-none ${theme === 'dark' ? 'text-light' : ''}`}
                >
                  У вас уже есть аккаунт? Войдите!
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
};