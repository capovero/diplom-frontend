import React from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const loginSchema = Yup.object().shape({
  identifier: Yup.string().required('Email or username is required'),
  password: Yup.string().required('Password is required')
});

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: '500px' }}>
        <h1 className="text-center mb-4">Login</h1>
        
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
            <Form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
              {status && <Alert variant="danger">{status}</Alert>}
              
              <Form.Group className="mb-3">
                <Form.Label>Email or Username</Form.Label>
                <Form.Control
                  type="text"
                  name="identifier"
                  value={values.identifier}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.identifier && !!errors.identifier}
                  autoFocus
                />
                <Form.Control.Feedback type="invalid">
                  {errors.identifier}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.password && !!errors.password}
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
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center">
                <Link to="/register" className="text-decoration-none">
                  Don't have an account? Register
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
};