import React from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const loginSchema = Yup.object().shape({
  identifier: Yup.string().required('Имя пользователя обязательно'),
  password: Yup.string().required('Пароль обязателен')
});

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: '500px' }}>
        <h1 className={`text-center mb-4 ${theme === 'dark' ? 'text-light' : ''}`}>Вход</h1>
        
        <Formik
          initialValues={{ identifier: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            try {
              await login(values.identifier, values.password);
              navigate('/');
            } catch (error) {
              setStatus('Invalid credentials');
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
                  name="identifier"
                  value={values.identifier}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.identifier && !!errors.identifier}
                  autoFocus
                  className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.identifier}
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
                {isSubmitting ? 'Происходит вход...' : 'Вход'}
              </Button>

              <div className="text-center">
                <Link 
                  to="/register" 
                  className={`text-decoration-none ${theme === 'dark' ? 'text-light' : ''}`}
                >
                  У вас еще нет аккаунта? Зарегистрируйтесь!
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
};