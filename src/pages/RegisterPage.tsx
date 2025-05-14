import React from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const registerSchema = Yup.object().shape({
    username: Yup.string().min(3, 'Не менее 3 символов').required('Обязательно'),
    email: Yup.string().email('Неверный email').required('Обязательно'),
    password: Yup.string().min(6, 'Не менее 6 символов').required('Обязательно'),
});

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { theme } = useTheme();

    return (
        <Container className="py-5">
            <div className="mx-auto" style={{ maxWidth: 500 }}>
                <h1 className={`text-center mb-4 ${theme === 'dark' ? 'text-light' : ''}`}>Регистрация</h1>
                <Formik
                    initialValues={{ username: '', email: '', password: '' }}
                    validationSchema={registerSchema}
                    onSubmit={async (values, { setSubmitting, setStatus }) => {
                        try {
                            await register(values.username, values.email, values.password);
                            navigate('/login');
                        } catch (err: any) {
                            setStatus(err.response?.data?.message || 'Ошибка регистрации');
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({
                          values, errors, touched, status,
                          handleChange, handleBlur, handleSubmit, isSubmitting,
                      }) => (
                        <Form
                            onSubmit={handleSubmit}
                            className={`p-4 rounded shadow-sm ${
                                theme === 'dark' ? 'bg-dark text-light' : 'bg-white'
                            }`}
                        >
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
                            <Button type="submit" variant="primary" className="w-100 mb-3" disabled={isSubmitting}>
                                {isSubmitting ? 'Регистрация...' : 'Регистрация'}
                            </Button>
                            <div className="text-center">
                                <Link to="/login" className={`${theme === 'dark' ? 'text-light' : ''}`}>
                                    Уже есть аккаунт? Войдите!
                                </Link>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </Container>
    );
};
