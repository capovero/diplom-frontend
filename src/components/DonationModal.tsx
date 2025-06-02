// src/components/DonationModal.tsx

import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '../context/ThemeContext';

interface DonationModalProps {
    show: boolean;
    onHide: () => void;
    projectTitle: string;
    onDonate: (amount: number) => Promise<void>;
}

const donationSchema = Yup.object().shape({
    amount: Yup.number()
        .min(1, 'Минимальное пожертвование — $1')
        .max(1_000_000, 'Максимум $1 000 000')
        .required('Сумма обязательна'),
});

export const DonationModal: React.FC<DonationModalProps> = ({
                                                                show,
                                                                onHide,
                                                                projectTitle,
                                                                onDonate,
                                                            }) => {
    const { theme } = useTheme();

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
                <Modal.Title>Поддержать "{projectTitle}"</Modal.Title>
            </Modal.Header>

            <Formik
                initialValues={{ amount: '' }}
                validationSchema={donationSchema}
                onSubmit={async (values, helpers: FormikHelpers<{ amount: string }>) => {
                    const numericAmount = Number(values.amount);

                    // Спрашиваем подтверждение
                    const ok = window.confirm(`Вы уверены, что хотите пожертвовать $${numericAmount}?`);
                    if (!ok) {
                        helpers.setSubmitting(false);
                        return;
                    }

                    try {
                        await onDonate(numericAmount);
                        onHide();
                    } catch (error) {
                        console.error('Пожертвование не удалось:', error);
                    } finally {
                        helpers.setSubmitting(false);
                    }
                }}
            >
                {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      isSubmitting,
                  }) => (
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                            <Form.Group className="mb-3">
                                <Form.Label>Сумма пожертвования ($)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="amount"
                                    value={values.amount}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.amount && !!errors.amount}
                                    placeholder="Введите сумму"
                                    min="1"
                                    step="1"
                                    className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.amount}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Modal.Body>

                        <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
                            <Button
                                variant={theme === 'dark' ? 'outline-light' : 'secondary'}
                                onClick={onHide}
                                disabled={isSubmitting}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? 'В процессе...' : 'Пожертвовать'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};
