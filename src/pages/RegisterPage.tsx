import React from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const registerSchema = Yup.object().shape({
    username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .required('Username is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
});

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    return (
        <Container className="py-5">
            <div className="mx-auto" style={{ maxWidth: '500px' }}>
                <h1 className={`text-center mb-4 ${theme === 'dark' ? 'text-light' : ''}`}>Register</h1>

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
                                <Form.Label>Username</Form.Label>
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
                                <Form.Label>Email</Form.Label>
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
                                <Form.Label>Password</Form.Label>
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
                                {isSubmitting ? 'Registering...' : 'Register'}
                            </Button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className={`text-decoration-none ${theme === 'dark' ? 'text-light' : ''}`}
                                >
                                    Already have an account? Login
                                </Link>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </Container>
    );
};