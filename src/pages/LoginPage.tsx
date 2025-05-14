import React from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { AxiosError } from 'axios';

const loginSchema = Yup.object().shape({
    userName: Yup.string().required('Имя пользователя обязательно'),
    password: Yup.string().required('Пароль обязателен'),
});

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { theme } = useTheme();

    return (
        <Container className="py-5">
            <div className="mx-auto" style={{ maxWidth: 500 }}>
                <h1 className={`text-center mb-4 ${theme === 'dark' ? 'text-light' : ''}`}>Вход</h1>
                <Formik
                    initialValues={{ userName: '', password: '' }}
                    validationSchema={loginSchema}
                    onSubmit={async (values, { setSubmitting, setStatus }) => {
                        try {
                            await login(values.userName, values.password);
                            navigate('/');
                        } catch (error) {
                            const axiosError = error as AxiosError<{ message?: string }>;
                            setStatus(
                                axiosError.response?.data?.message ||
                                'Неверные имя пользователя или пароль'
                            );
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
                          isSubmitting,
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
                                    name="userName"
                                    value={values.userName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.userName && !!errors.userName}
                                    className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.userName}
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
                                {isSubmitting ? 'Вход...' : 'Войти'}
                            </Button>

                            <div className="text-center">
                                <Link to="/register" className={`${theme === 'dark' ? 'text-light' : ''}`}>
                                    Нет аккаунта? Зарегистрируйтесь
                                </Link>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </Container>
    );
};